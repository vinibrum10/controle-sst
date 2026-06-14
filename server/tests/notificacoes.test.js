const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, criarFuncionario, authHeader } = require("./helpers");
const { DEFAULT_PERMISSOES } = require("../utils/permissionsSeed");
const { invalidarMatriz } = require("../utils/permissions");
const { findOrCreateSemana, semanaInfoFromDate } = require("../utils/semana");

let admin;

beforeAll(async () => {
  admin = await criarUsuario({ email: "notificacoes-admin@teste.com", papel: "ADMIN" });
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.notificacao.deleteMany({});

  // Restaura a matriz padrao apos os testes que a alteram.
  await prisma.$transaction(
    DEFAULT_PERMISSOES.map((item) =>
      prisma.permissaoPerfil.upsert({
        where: { papel_chave: { papel: item.papel, chave: item.chave } },
        update: { permitido: item.permitido },
        create: item
      })
    )
  );
  await prisma.permissaoHistorico.deleteMany({});
  invalidarMatriz();
});

function daquiADias(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data;
}

describe("GET /api/notificacoes", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/notificacoes");
    expect(res.status).toBe(401);
  });

  test("usuario sem notificacoes recebe lista vazia", async () => {
    const usuario = await criarUsuario({ email: "notif-vazio@teste.com" });

    const res = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuario));

    expect(res.status).toBe(200);
    expect(res.body.itens).toEqual([]);
    expect(res.body.naoLidas).toBe(0);
  });
});

describe("Notificacao de tarefa atribuida", () => {
  test("criar uma tarefa notifica o responsavel com usuario vinculado", async () => {
    const funcionario = await criarFuncionario({ email: "notif-tarefa-resp@teste.com" });
    const usuario = await criarUsuario({ email: "notif-tarefa-resp-login@teste.com", funcionarioId: funcionario.id });
    const { codigo } = semanaInfoFromDate(new Date());

    const resTarefa = await request(app)
      .post("/api/tarefas")
      .set("Authorization", authHeader(admin))
      .send({
        titulo: "Tarefa com notificacao",
        responsavelId: funcionario.id,
        semana: codigo,
        prazo: daquiADias(10).toISOString(),
        tipo: "EVENTUAL",
        horasEstimadas: 4
      });
    expect(resTarefa.status).toBe(201);

    const res = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuario));
    expect(res.status).toBe(200);
    expect(res.body.naoLidas).toBe(1);

    const [notificacao] = res.body.itens;
    expect(notificacao.tipo).toBe("TAREFA_ATRIBUIDA");
    expect(notificacao.lida).toBe(false);
    expect(notificacao.link).toBe("/dashboard/tarefas");
  });

  test("reatribuir o responsavel notifica o novo responsavel", async () => {
    const funcionarioAntigo = await criarFuncionario({ email: "notif-reassign-antigo@teste.com" });
    const funcionarioNovo = await criarFuncionario({ email: "notif-reassign-novo@teste.com" });
    const usuarioNovo = await criarUsuario({ email: "notif-reassign-novo-login@teste.com", funcionarioId: funcionarioNovo.id });
    const { codigo } = semanaInfoFromDate(new Date());

    const resTarefa = await request(app)
      .post("/api/tarefas")
      .set("Authorization", authHeader(admin))
      .send({
        titulo: "Tarefa reatribuida",
        responsavelId: funcionarioAntigo.id,
        semana: codigo,
        prazo: daquiADias(10).toISOString(),
        tipo: "EVENTUAL",
        horasEstimadas: 4
      });
    expect(resTarefa.status).toBe(201);

    const resUpdate = await request(app)
      .put(`/api/tarefas/${resTarefa.body.id}`)
      .set("Authorization", authHeader(admin))
      .send({ responsavelId: funcionarioNovo.id });
    expect(resUpdate.status).toBe(200);

    const res = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuarioNovo));
    expect(res.body.itens.some((item) => item.tipo === "TAREFA_ATRIBUIDA")).toBe(true);
  });
});

describe("Notificacao de apoio solicitado", () => {
  test("solicitar apoio notifica a pessoa designada", async () => {
    const responsavel = await criarFuncionario({ email: "notif-apoio-resp@teste.com", capacidade: 40 });
    // Capacidade bem alta para garantir que esta pessoa seja a escolhida mesmo
    // com outros funcionarios sem carga criados pelos testes anteriores.
    const apoio = await criarFuncionario({ email: "notif-apoio-pessoa@teste.com", capacidade: 999 });
    const usuarioApoio = await criarUsuario({ email: "notif-apoio-pessoa-login@teste.com", funcionarioId: apoio.id });

    const { codigo } = semanaInfoFromDate(new Date());
    const semana = await findOrCreateSemana(codigo);

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo: "Tarefa que precisa de apoio",
        responsavelId: responsavel.id,
        semanaId: semana.id,
        prazo: daquiADias(10),
        horasEstimadas: 4,
        status: "PENDENTE"
      }
    });

    const res = await request(app)
      .post("/api/ajuda/solicitar")
      .set("Authorization", authHeader(admin))
      .send({ tarefaId: tarefa.id });
    expect(res.status).toBe(200);
    expect(res.body.ajudante.id).toBe(apoio.id);

    const resNotif = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuarioApoio));
    expect(resNotif.body.itens.some((item) => item.tipo === "APOIO_SOLICITADO")).toBe(true);
  });
});

describe("Notificacoes de prazo (TAREFA_PRAZO)", () => {
  test("tarefas com prazo proximo ou vencido aparecem como notificacao, mas concluidas e distantes nao", async () => {
    const funcionario = await criarFuncionario({ email: "notif-prazo@teste.com" });
    const usuario = await criarUsuario({ email: "notif-prazo-login@teste.com", funcionarioId: funcionario.id });

    const { codigo } = semanaInfoFromDate(new Date());
    const semana = await findOrCreateSemana(codigo);

    await prisma.tarefa.createMany({
      data: [
        { titulo: "Prazo proximo", responsavelId: funcionario.id, semanaId: semana.id, prazo: daquiADias(1), horasEstimadas: 2, status: "PENDENTE" },
        { titulo: "Prazo vencido", responsavelId: funcionario.id, semanaId: semana.id, prazo: daquiADias(-1), horasEstimadas: 2, status: "PENDENTE" },
        { titulo: "Prazo distante", responsavelId: funcionario.id, semanaId: semana.id, prazo: daquiADias(30), horasEstimadas: 2, status: "PENDENTE" },
        { titulo: "Vencida mas concluida", responsavelId: funcionario.id, semanaId: semana.id, prazo: daquiADias(-1), horasEstimadas: 2, status: "CONCLUIDA", concluidaEm: new Date() }
      ]
    });

    const res = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuario));
    expect(res.status).toBe(200);

    const prazos = res.body.itens.filter((item) => item.tipo === "TAREFA_PRAZO");
    expect(prazos).toHaveLength(2);
    expect(prazos.find((item) => item.titulo === "Tarefa com prazo vencido")).toBeDefined();
    expect(prazos.find((item) => item.titulo === "Tarefa com prazo próximo")).toBeDefined();
    expect(res.body.naoLidas).toBeGreaterThanOrEqual(2);
  });
});

describe("Notificacao de alteracao na matriz de permissoes", () => {
  test("PATCH /api/permissoes notifica usuarios ativos dos perfis afetados", async () => {
    const gestor = await criarUsuario({ email: "notif-permissao-gestor@teste.com", papel: "GESTOR" });
    const gestorInativo = await criarUsuario({ email: "notif-permissao-gestor-inativo@teste.com", papel: "GESTOR", ativo: false });
    const colaborador = await criarUsuario({ email: "notif-permissao-colaborador@teste.com", papel: "COLABORADOR" });

    const res = await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({ itens: [{ papel: "GESTOR", chave: "IMPORTAR_DADOS", permitido: true }] });
    expect(res.status).toBe(200);

    const resGestor = await request(app).get("/api/notificacoes").set("Authorization", authHeader(gestor));
    expect(resGestor.body.itens.some((item) => item.tipo === "PERMISSAO_ALTERADA")).toBe(true);

    const resInativo = await request(app).get("/api/notificacoes").set("Authorization", authHeader(gestorInativo));
    expect(resInativo.body.itens.some((item) => item.tipo === "PERMISSAO_ALTERADA")).toBe(false);

    const resColaborador = await request(app).get("/api/notificacoes").set("Authorization", authHeader(colaborador));
    expect(resColaborador.body.itens.some((item) => item.tipo === "PERMISSAO_ALTERADA")).toBe(false);
  });

  test("PATCH sem mudancas efetivas nao gera notificacoes", async () => {
    const gestor = await criarUsuario({ email: "notif-permissao-semmudanca@teste.com", papel: "GESTOR" });

    const res = await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({ itens: [{ papel: "ADMIN", chave: "GERENCIAR_USUARIOS", permitido: true }] });
    expect(res.status).toBe(200);

    const resNotif = await request(app).get("/api/notificacoes").set("Authorization", authHeader(gestor));
    expect(resNotif.body.itens.some((item) => item.tipo === "PERMISSAO_ALTERADA")).toBe(false);
  });
});

describe("Marcar notificacoes como lidas", () => {
  let funcionario, usuario;

  beforeAll(async () => {
    funcionario = await criarFuncionario({ email: "notif-marcar-lida@teste.com" });
    usuario = await criarUsuario({ email: "notif-marcar-lida-login@teste.com", funcionarioId: funcionario.id });
  });

  beforeEach(async () => {
    const { codigo } = semanaInfoFromDate(new Date());
    await request(app)
      .post("/api/tarefas")
      .set("Authorization", authHeader(admin))
      .send({
        titulo: "Tarefa para marcar como lida",
        responsavelId: funcionario.id,
        semana: codigo,
        prazo: daquiADias(10).toISOString(),
        tipo: "EVENTUAL",
        horasEstimadas: 4
      });
  });

  test("PATCH /:id/lida marca uma notificacao como lida", async () => {
    const before = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuario));
    expect(before.body.naoLidas).toBe(1);
    const [notificacao] = before.body.itens;

    const resPatch = await request(app)
      .patch(`/api/notificacoes/${notificacao.id}/lida`)
      .set("Authorization", authHeader(usuario));
    expect(resPatch.status).toBe(200);
    expect(resPatch.body.lida).toBe(true);

    const after = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuario));
    expect(after.body.naoLidas).toBe(0);
  });

  test("PATCH /:id/lida retorna 404 para notificacao de outro usuario", async () => {
    const outro = await criarUsuario({ email: "notif-marcar-lida-outro@teste.com" });
    const before = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuario));
    const [notificacao] = before.body.itens;

    const res = await request(app)
      .patch(`/api/notificacoes/${notificacao.id}/lida`)
      .set("Authorization", authHeader(outro));
    expect(res.status).toBe(404);
  });

  test("POST /marcar-todas-lidas marca todas as notificacoes pendentes", async () => {
    const resPost = await request(app)
      .post("/api/notificacoes/marcar-todas-lidas")
      .set("Authorization", authHeader(usuario));
    expect(resPost.status).toBe(200);

    const after = await request(app).get("/api/notificacoes").set("Authorization", authHeader(usuario));
    expect(after.body.naoLidas).toBe(0);
    expect(after.body.itens.every((item) => item.lida)).toBe(true);
  });
});
