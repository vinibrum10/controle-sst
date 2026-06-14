const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader } = require("./helpers");

let admin, gestor, colaborador;

beforeAll(async () => {
  admin = await criarUsuario({ email: "auditoria-admin@teste.com", papel: "ADMIN" });
  gestor = await criarUsuario({ email: "auditoria-gestor@teste.com", papel: "GESTOR" });
  colaborador = await criarUsuario({ email: "auditoria-colaborador@teste.com", papel: "COLABORADOR" });
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.cadastroGeral.deleteMany({});
  await prisma.configuracaoSistema.deleteMany({});
  await prisma.logAuditoria.deleteMany({});
});

describe("GET /api/auditoria", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/auditoria");
    expect(res.status).toBe(401);
  });

  test("nao permite acesso a usuario nao-ADMIN", async () => {
    const res = await request(app).get("/api/auditoria").set("Authorization", authHeader(gestor));
    expect(res.status).toBe(403);
  });

  test("registra a criacao, atualizacao e exclusao de um cadastro geral", async () => {
    const criar = await request(app)
      .post("/api/cadastros")
      .set("Authorization", authHeader(admin))
      .send({ categoria: "UNIDADE", nome: "Unidade Auditoria" });
    expect(criar.status).toBe(201);

    await request(app)
      .patch(`/api/cadastros/${criar.body.id}`)
      .set("Authorization", authHeader(admin))
      .send({ ativo: false });

    await request(app).delete(`/api/cadastros/${criar.body.id}`).set("Authorization", authHeader(admin));

    const res = await request(app).get("/api/auditoria").set("Authorization", authHeader(admin));
    expect(res.status).toBe(200);

    const registros = res.body.filter((item) => item.entidade === "CadastroGeral" && item.entidadeId === criar.body.id);
    expect(registros.map((item) => item.acao)).toEqual(["EXCLUIR", "ATUALIZAR", "CRIAR"]);

    const criacao = registros.find((item) => item.acao === "CRIAR");
    expect(criacao.usuarioId).toBe(admin.id);
    expect(criacao.usuarioEmail).toBe(admin.email);
    expect(criacao.detalhes.nome).toBe("Unidade Auditoria");
  });

  test("rejeita exclusao por usuario sem permissao e nao registra log", async () => {
    const criar = await request(app)
      .post("/api/cadastros")
      .set("Authorization", authHeader(admin))
      .send({ categoria: "EQUIPE", nome: "Equipe Auditoria" });

    const excluir = await request(app)
      .delete(`/api/cadastros/${criar.body.id}`)
      .set("Authorization", authHeader(colaborador));
    expect(excluir.status).toBe(403);

    const res = await request(app).get("/api/auditoria").set("Authorization", authHeader(admin));
    const registros = res.body.filter((item) => item.entidade === "CadastroGeral" && item.entidadeId === criar.body.id);
    expect(registros.map((item) => item.acao)).toEqual(["CRIAR"]);
  });

  test("registra alteracoes na configuracao do sistema", async () => {
    const res = await request(app)
      .patch("/api/configuracoes/sistema")
      .set("Authorization", authHeader(admin))
      .send({ nomeEmpresa: "Empresa Auditoria" });
    expect(res.status).toBe(200);

    const logs = await request(app).get("/api/auditoria").set("Authorization", authHeader(admin));
    const registro = logs.body.find((item) => item.entidade === "ConfiguracaoSistema" && item.entidadeId === res.body.id);
    expect(registro).toBeDefined();
    expect(registro.acao).toBe("ATUALIZAR");
    expect(registro.detalhes.nomeEmpresa).toBe("Empresa Auditoria");
  });

  test("respeita o parametro limite", async () => {
    for (let i = 0; i < 3; i += 1) {
      await request(app)
        .post("/api/cadastros")
        .set("Authorization", authHeader(admin))
        .send({ categoria: "UNIDADE", nome: `Unidade ${i}` });
    }

    const res = await request(app).get("/api/auditoria?limite=2").set("Authorization", authHeader(admin));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});
