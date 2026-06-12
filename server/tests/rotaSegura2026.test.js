const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader } = require("./helpers");
const { seedEdicaoRotaSegura2026 } = require("../utils/seedRotaSegura2026");
const { CODIGO_APR_ERRO_ZERO } = require("../utils/rotaSegura2026");

let admin, gestor, tst, visualizador, colaborador;
let edicao2026;
let criterios2026;

beforeAll(async () => {
  admin = await criarUsuario({ email: "rs-admin@teste.com", papel: "ADMIN" });
  gestor = await criarUsuario({ email: "rs-gestor@teste.com", papel: "GESTOR" });
  tst = await criarUsuario({ email: "rs-tst@teste.com", papel: "TST" });
  visualizador = await criarUsuario({ email: "rs-visualizador@teste.com", papel: "VISUALIZADOR" });
  colaborador = await criarUsuario({ email: "rs-colaborador@teste.com", papel: "COLABORADOR" });

  edicao2026 = await seedEdicaoRotaSegura2026(prisma);
  criterios2026 = await prisma.rsCriterio.findMany({ where: { edicaoId: edicao2026.id } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Edicoes do programa", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/rota-segura/edicoes");
    expect(res.status).toBe(401);
  });

  test("qualquer usuario autenticado pode listar edicoes", async () => {
    const res = await request(app).get("/api/rota-segura/edicoes").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(res.body.some((item) => item.ano === 2026)).toBe(true);
  });

  test("ADMIN pode criar nova edicao", async () => {
    const res = await request(app)
      .post("/api/rota-segura/edicoes")
      .set("Authorization", authHeader(admin))
      .send({ nome: "Rota Segura 2027", ano: 2027, slogan: "Slogan 2027" });
    expect(res.status).toBe(201);
    expect(res.body.ano).toBe(2027);
  });

  test("GESTOR nao pode criar edicao", async () => {
    const res = await request(app)
      .post("/api/rota-segura/edicoes")
      .set("Authorization", authHeader(gestor))
      .send({ nome: "Rota Segura 2028", ano: 2028 });
    expect(res.status).toBe(403);
  });

  test("ADMIN pode clonar a edicao 2026 sem copiar avaliacoes/penalidades", async () => {
    const res = await request(app)
      .post(`/api/rota-segura/edicoes/${edicao2026.id}/clonar`)
      .set("Authorization", authHeader(admin))
      .send({ nome: "Rota Segura 2029 (clone)", ano: 2029 });

    expect(res.status).toBe(201);
    expect(res.body.ano).toBe(2029);
    expect(res.body.ativo).toBe(false);
    expect(res.body._count.criterios).toBe(criterios2026.length);
    expect(res.body._count.avaliacoes).toBe(0);
    expect(res.body._count.penalidades).toBe(0);

    const propostaClone = await prisma.rsProposta.findUnique({ where: { edicaoId: res.body.id } });
    expect(propostaClone).not.toBeNull();
    expect(propostaClone.titulo).toBe("Rota Segura 2026");

    const premiacoesClone = await prisma.rsPremiacao.findMany({ where: { edicaoId: res.body.id } });
    expect(premiacoesClone.length).toBe(4);

    const regrasClone = await prisma.rsRegraCondicional.findMany({ where: { edicaoId: res.body.id } });
    expect(regrasClone.length).toBe(5);
  });

  test("GESTOR nao pode clonar edicao", async () => {
    const res = await request(app)
      .post(`/api/rota-segura/edicoes/${edicao2026.id}/clonar`)
      .set("Authorization", authHeader(gestor))
      .send({ nome: "Rota Segura 2030 (clone)", ano: 2030 });
    expect(res.status).toBe(403);
  });
});

describe("Proposta da edicao", () => {
  test("GET retorna a proposta da edicao 2026", async () => {
    const res = await request(app)
      .get(`/api/rota-segura/propostas/${edicao2026.id}`)
      .set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe("Rota Segura 2026");
  });

  test("404 para edicao sem proposta cadastrada", async () => {
    const res = await request(app)
      .get("/api/rota-segura/propostas/edicao-inexistente")
      .set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(404);
  });

  test("ADMIN pode atualizar a proposta", async () => {
    const res = await request(app)
      .put(`/api/rota-segura/propostas/${edicao2026.id}`)
      .set("Authorization", authHeader(admin))
      .send({ observacoes: "Atualizado via teste." });
    expect(res.status).toBe(200);
    expect(res.body.observacoes).toBe("Atualizado via teste.");
  });

  test("TST nao pode atualizar a proposta", async () => {
    const res = await request(app)
      .put(`/api/rota-segura/propostas/${edicao2026.id}`)
      .set("Authorization", authHeader(tst))
      .send({ observacoes: "Tentativa invalida." });
    expect(res.status).toBe(403);
  });
});

describe("Criterios de pontuacao", () => {
  test("lista criterios filtrados por edicao", async () => {
    const res = await request(app)
      .get(`/api/rota-segura/criterios?edicaoId=${edicao2026.id}`)
      .set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(6);
    expect(res.body.some((item) => item.codigo === CODIGO_APR_ERRO_ZERO && item.pontuacao === 5)).toBe(true);
  });

  test("ADMIN pode criar, atualizar e remover um criterio", async () => {
    const criar = await request(app)
      .post("/api/rota-segura/criterios")
      .set("Authorization", authHeader(admin))
      .send({
        edicaoId: edicao2026.id,
        nome: "Participacao em DDS",
        tipo: "PROATIVO",
        pontuacao: 1,
        categoria: "DDS"
      });
    expect(criar.status).toBe(201);

    const atualizar = await request(app)
      .patch(`/api/rota-segura/criterios/${criar.body.id}`)
      .set("Authorization", authHeader(admin))
      .send({ pontuacao: 3 });
    expect(atualizar.status).toBe(200);
    expect(atualizar.body.pontuacao).toBe(3);

    const remover = await request(app)
      .delete(`/api/rota-segura/criterios/${criar.body.id}`)
      .set("Authorization", authHeader(admin));
    expect(remover.status).toBe(204);
  });

  test("TST nao pode criar criterio", async () => {
    const res = await request(app)
      .post("/api/rota-segura/criterios")
      .set("Authorization", authHeader(tst))
      .send({ edicaoId: edicao2026.id, nome: "Criterio invalido", tipo: "PROATIVO", pontuacao: 1 });
    expect(res.status).toBe(403);
  });
});

describe("Regras condicionais", () => {
  test("lista regras da edicao 2026", async () => {
    const res = await request(app)
      .get(`/api/rota-segura/regras?edicaoId=${edicao2026.id}`)
      .set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(5);
  });
});

describe("Premiacao", () => {
  test("lista premiacoes da edicao 2026", async () => {
    const res = await request(app)
      .get(`/api/rota-segura/premiacoes?edicaoId=${edicao2026.id}`)
      .set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(4);
    expect(res.body.find((item) => item.area === "EAT").quantidade).toBe(10);
  });

  test("ADMIN pode atualizar uma premiacao", async () => {
    const premiacaoEat = await prisma.rsPremiacao.findFirst({ where: { edicaoId: edicao2026.id, area: "EAT" } });
    const res = await request(app)
      .patch(`/api/rota-segura/premiacoes/${premiacaoEat.id}`)
      .set("Authorization", authHeader(admin))
      .send({ observacoes: "Premiacao revisada via teste." });
    expect(res.status).toBe(200);
    expect(res.body.observacoes).toBe("Premiacao revisada via teste.");
  });
});

describe("Equipes e colaboradores", () => {
  let equipe;

  test("ADMIN pode criar equipe", async () => {
    const res = await request(app)
      .post("/api/rota-segura/equipes")
      .set("Authorization", authHeader(admin))
      .send({ nome: "Equipe Linha Norte", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Supervisor A", tst: "TST A" });
    expect(res.status).toBe(201);
    equipe = res.body;
  });

  test("VISUALIZADOR nao pode criar equipe", async () => {
    const res = await request(app)
      .post("/api/rota-segura/equipes")
      .set("Authorization", authHeader(visualizador))
      .send({ nome: "Equipe Invalida", area: "EAT" });
    expect(res.status).toBe(403);
  });

  test("TST pode criar colaborador vinculado a equipe", async () => {
    const res = await request(app)
      .post("/api/rota-segura/colaboradores")
      .set("Authorization", authHeader(tst))
      .send({ nome: "Colaborador Teste", equipeId: equipe.id, funcao: "Operador" });
    expect(res.status).toBe(201);
    expect(res.body.equipe.id).toBe(equipe.id);
  });
});

describe("Avaliacoes de APR - motor de pontuacao dinamico", () => {
  let equipeLinhas;

  beforeAll(async () => {
    equipeLinhas = await prisma.rsEquipe.create({
      data: { nome: "Equipe Avaliacao", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Sup. Avaliacao", tst: "TST Avaliacao" }
    });
  });

  test("APR amostral sem erros (erro zero) pontua +5", async () => {
    const res = await request(app)
      .post("/api/rota-segura/avaliacoes")
      .set("Authorization", authHeader(tst))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-01",
        dataAvaliacao: "2026-01-10",
        equipeId: equipeLinhas.id,
        tipo: "AMOSTRAL",
        cabecalhoOk: true,
        enderecoOk: true,
        assinaturasOk: true,
        riscosMinimosOk: true,
        medidasMinimasOk: true,
        coerenciaOk: true,
        arquivadaEam: true,
        legivel: true,
        aprovacaoBasica: true
      });

    expect(res.status).toBe(201);
    expect(res.body.pontuacao).toBe(5);
  });

  test("riscos/medidas adicionais so pontuam apos aprovacao do comite", async () => {
    const criar = await request(app)
      .post("/api/rota-segura/avaliacoes")
      .set("Authorization", authHeader(tst))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-02",
        dataAvaliacao: "2026-02-10",
        equipeId: equipeLinhas.id,
        tipo: "AMOSTRAL",
        aprovacaoBasica: true,
        riscosAdicionais: true,
        riscosAdicionaisDescricao: "Risco adicional identificado em campo.",
        medidasAdicionais: true,
        medidasAdicionaisDescricao: "Medida adicional proposta."
      });

    expect(criar.status).toBe(201);
    // riscos/medidas ainda pendentes de aprovacao do comite -> so os +5 do erro zero
    expect(criar.body.pontuacao).toBe(5);

    const pendentes = await request(app)
      .get(`/api/rota-segura/comite/pendentes?edicaoId=${edicao2026.id}`)
      .set("Authorization", authHeader(gestor));
    expect(pendentes.status).toBe(200);
    expect(pendentes.body.some((item) => item.id === criar.body.id)).toBe(true);

    const decisaoRiscos = await request(app)
      .post(`/api/rota-segura/comite/${criar.body.id}/decisao`)
      .set("Authorization", authHeader(gestor))
      .send({ tipo: "RISCOS_ADICIONAIS", decisao: "APROVADO", responsavel: "Comite Teste" });
    expect(decisaoRiscos.status).toBe(200);
    expect(decisaoRiscos.body.pontuacao).toBe(7);

    const decisaoMedidas = await request(app)
      .post(`/api/rota-segura/comite/${criar.body.id}/decisao`)
      .set("Authorization", authHeader(gestor))
      .send({ tipo: "MEDIDAS_ADICIONAIS", decisao: "APROVADO", responsavel: "Comite Teste" });
    expect(decisaoMedidas.status).toBe(200);
    expect(decisaoMedidas.body.pontuacao).toBe(9);
  });

  test("APR via Forms nunca recebe os +5 do erro zero, mesmo sem erros", async () => {
    const res = await request(app)
      .post("/api/rota-segura/avaliacoes")
      .set("Authorization", authHeader(tst))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-01",
        dataAvaliacao: "2026-01-15",
        equipeId: equipeLinhas.id,
        tipo: "FORMS",
        aprovacaoBasica: true
      });

    expect(res.status).toBe(201);
    expect(res.body.pontuacao).toBe(0);
  });

  test("APR via Forms pode receber riscos adicionais aprovados pelo comite", async () => {
    const criar = await request(app)
      .post("/api/rota-segura/avaliacoes")
      .set("Authorization", authHeader(tst))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-03",
        dataAvaliacao: "2026-03-05",
        equipeId: equipeLinhas.id,
        tipo: "FORMS",
        aprovacaoBasica: true,
        riscosAdicionais: true,
        riscosAdicionaisDescricao: "Risco adicional via Forms."
      });
    expect(criar.status).toBe(201);
    expect(criar.body.pontuacao).toBe(0);

    const decisao = await request(app)
      .post(`/api/rota-segura/comite/${criar.body.id}/decisao`)
      .set("Authorization", authHeader(gestor))
      .send({ tipo: "RISCOS_ADICIONAIS", decisao: "APROVADO" });
    expect(decisao.status).toBe(200);
    expect(decisao.body.pontuacao).toBe(2);
  });

  test("apenas 1 APR amostral por equipe/mes (conflito 409)", async () => {
    const res = await request(app)
      .post("/api/rota-segura/avaliacoes")
      .set("Authorization", authHeader(tst))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-01",
        dataAvaliacao: "2026-01-20",
        equipeId: equipeLinhas.id,
        tipo: "AMOSTRAL",
        aprovacaoBasica: true
      });
    expect(res.status).toBe(409);
  });

  test("apenas ADMIN pode editar avaliacao amostral ja registrada", async () => {
    const existente = await prisma.rsAprAvaliacao.findFirst({
      where: { edicaoId: edicao2026.id, equipeId: equipeLinhas.id, mesReferencia: "2026-01", tipo: "AMOSTRAL" }
    });

    const tentativaTst = await request(app)
      .patch(`/api/rota-segura/avaliacoes/${existente.id}`)
      .set("Authorization", authHeader(tst))
      .send({ observacoes: "Tentativa de edicao pelo TST." });
    expect(tentativaTst.status).toBe(403);

    const tentativaAdmin = await request(app)
      .patch(`/api/rota-segura/avaliacoes/${existente.id}`)
      .set("Authorization", authHeader(admin))
      .send({ observacoes: "Editado pelo ADMIN." });
    expect(tentativaAdmin.status).toBe(200);
    expect(tentativaAdmin.body.observacoes).toBe("Editado pelo ADMIN.");
  });
});

describe("Penalidades", () => {
  let equipePenalidade;

  beforeAll(async () => {
    equipePenalidade = await prisma.rsEquipe.create({
      data: { nome: "Equipe Penalidade", area: "EAT", supervisor: "Sup. Penalidade", tst: "TST Penalidade" }
    });
  });

  test("ADMIN/TST podem registrar penalidade e os pontos sao calculados pela edicao", async () => {
    const leve = await request(app)
      .post("/api/rota-segura/penalidades")
      .set("Authorization", authHeader(tst))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-01",
        equipeId: equipePenalidade.id,
        tipo: "LEVE",
        descricao: "Uso incorreto de EPI.",
        dataOcorrencia: "2026-01-12"
      });
    expect(leve.status).toBe(201);
    expect(leve.body.pontos).toBe(-1);

    const grave = await request(app)
      .post("/api/rota-segura/penalidades")
      .set("Authorization", authHeader(tst))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-01",
        equipeId: equipePenalidade.id,
        tipo: "GRAVE",
        descricao: "Procedimento inseguro.",
        dataOcorrencia: "2026-01-15"
      });
    expect(grave.status).toBe(201);
    expect(grave.body.pontos).toBe(-3);

    const gravissima = await request(app)
      .post("/api/rota-segura/penalidades")
      .set("Authorization", authHeader(tst))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-01",
        equipeId: equipePenalidade.id,
        tipo: "GRAVISSIMA",
        descricao: "Infracao gravissima de seguranca.",
        dataOcorrencia: "2026-01-20"
      });
    expect(gravissima.status).toBe(201);
    expect(gravissima.body.pontos).toBe(-5);
  });

  test("VISUALIZADOR nao pode registrar penalidade", async () => {
    const res = await request(app)
      .post("/api/rota-segura/penalidades")
      .set("Authorization", authHeader(visualizador))
      .send({
        edicaoId: edicao2026.id,
        mesReferencia: "2026-01",
        equipeId: equipePenalidade.id,
        tipo: "LEVE",
        descricao: "Tentativa invalida.",
        dataOcorrencia: "2026-01-12"
      });
    expect(res.status).toBe(403);
  });

  test("ranking soma pontuacao de APR e penalidades por equipe", async () => {
    const res = await request(app)
      .get(`/api/rota-segura/ranking?edicaoId=${edicao2026.id}&mes=2026-01`)
      .set("Authorization", authHeader(colaborador));

    expect(res.status).toBe(200);
    expect(res.body.edicao.ano).toBe(2026);

    const linhaPenalidade = res.body.ranking.find((item) => item.equipeId === equipePenalidade.id);
    expect(linhaPenalidade.pontosPenalidades).toBe(-9);
    expect(linhaPenalidade.total).toBe(-9);

    const linhaLinhas = res.body.ranking.find((item) => item.equipe === "Equipe Avaliacao");
    expect(linhaLinhas.pontuacaoApr).toBe(5);
  });
});

describe("Dashboard e relatorios", () => {
  test("dashboard retorna KPIs da edicao ativa", async () => {
    const res = await request(app)
      .get(`/api/rota-segura/dashboard?edicaoId=${edicao2026.id}`)
      .set("Authorization", authHeader(colaborador));

    expect(res.status).toBe(200);
    expect(res.body.edicao.ano).toBe(2026);
    expect(Array.isArray(res.body.topRanking)).toBe(true);
  });

  test("relatorios retornam avaliacoes, penalidades e ranking do periodo", async () => {
    const res = await request(app)
      .get(`/api/rota-segura/relatorios?edicaoId=${edicao2026.id}&mes=2026-01`)
      .set("Authorization", authHeader(colaborador));

    expect(res.status).toBe(200);
    expect(res.body.edicao.ano).toBe(2026);
    expect(res.body.avaliacoes.length).toBeGreaterThan(0);
    expect(res.body.penalidades.length).toBe(3);
    expect(res.body.ranking.length).toBeGreaterThan(0);
  });
});
