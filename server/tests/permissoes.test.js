const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader } = require("./helpers");
const { DEFAULT_PERMISSOES } = require("../utils/permissionsSeed");
const { invalidarMatriz } = require("../utils/permissions");

let admin, gestor, colaborador;

beforeAll(async () => {
  admin = await criarUsuario({ email: "permissoes-admin@teste.com", papel: "ADMIN" });
  gestor = await criarUsuario({ email: "permissoes-gestor@teste.com", papel: "GESTOR" });
  colaborador = await criarUsuario({ email: "permissoes-colaborador@teste.com", papel: "COLABORADOR" });
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Restaura a matriz padrao apos cada teste que a altera.
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
  await prisma.logAuditoria.deleteMany({});
  invalidarMatriz();
});

describe("GET /api/permissoes", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/permissoes");
    expect(res.status).toBe(401);
  });

  test("qualquer usuario autenticado pode consultar a matriz", async () => {
    const res = await request(app).get("/api/permissoes").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(DEFAULT_PERMISSOES.length);
  });

  test("a matriz semeada reflete o comportamento padrao do sistema", async () => {
    const res = await request(app).get("/api/permissoes").set("Authorization", authHeader(admin));
    expect(res.status).toBe(200);

    for (const esperado of DEFAULT_PERMISSOES) {
      const encontrado = res.body.find((item) => item.papel === esperado.papel && item.chave === esperado.chave);
      expect(encontrado).toBeDefined();
      expect(encontrado.permitido).toBe(esperado.permitido);
    }
  });
});

describe("PATCH /api/permissoes", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).patch("/api/permissoes").send({ itens: [] });
    expect(res.status).toBe(401);
  });

  test("nao permite acesso a usuario nao-ADMIN", async () => {
    const res = await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(gestor))
      .send({ itens: [{ papel: "GESTOR", chave: "IMPORTAR_DADOS", permitido: true }] });

    expect(res.status).toBe(403);
  });

  test("rejeita corpo invalido", async () => {
    const res = await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({ itens: [{ papel: "GESTOR", chave: "CHAVE_INEXISTENTE", permitido: true }] });

    expect(res.status).toBe(400);
  });

  test("rejeita remover GERENCIAR_USUARIOS do ADMIN (evita lockout)", async () => {
    const res = await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({ itens: [{ papel: "ADMIN", chave: "GERENCIAR_USUARIOS", permitido: false }] });

    expect(res.status).toBe(400);
  });

  test("ADMIN pode atualizar a matriz e a alteracao passa a valer na hora", async () => {
    const resPatch = await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({ itens: [{ papel: "GESTOR", chave: "IMPORTAR_DADOS", permitido: true }] });

    expect(resPatch.status).toBe(200);
    const atualizado = resPatch.body.find((item) => item.papel === "GESTOR" && item.chave === "IMPORTAR_DADOS");
    expect(atualizado.permitido).toBe(true);

    const resImportar = await request(app)
      .post("/api/dados/importar")
      .set("Authorization", authHeader(gestor))
      .send({ funcionarios: [], tarefas: [] });

    expect(resImportar.status).not.toBe(403);
  });
});

describe("GET /api/permissoes/historico", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/permissoes/historico");
    expect(res.status).toBe(401);
  });

  test("nao permite acesso a usuario nao-ADMIN", async () => {
    const res = await request(app).get("/api/permissoes/historico").set("Authorization", authHeader(gestor));
    expect(res.status).toBe(403);
  });

  test("PATCH registra apenas as chaves que de fato mudaram, com quem alterou", async () => {
    await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({
        itens: [
          { papel: "GESTOR", chave: "IMPORTAR_DADOS", permitido: true }, // muda (era false)
          { papel: "ADMIN", chave: "GERENCIAR_USUARIOS", permitido: true } // nao muda (ja era true)
        ]
      });

    const res = await request(app).get("/api/permissoes/historico").set("Authorization", authHeader(admin));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    const [registro] = res.body;
    expect(registro.papel).toBe("GESTOR");
    expect(registro.chave).toBe("IMPORTAR_DADOS");
    expect(registro.permitidoAntes).toBe(false);
    expect(registro.permitidoDepois).toBe(true);
    expect(registro.alteradoPorId).toBe(admin.id);
    expect(registro.alteradoPorEmail).toBe(admin.email);

    const auditoria = await request(app).get("/api/auditoria").set("Authorization", authHeader(admin));
    const logAlteracao = auditoria.body.find((item) => item.entidade === "PermissaoPerfil");
    expect(logAlteracao).toBeDefined();
    expect(logAlteracao.acao).toBe("ATUALIZAR");
    expect(logAlteracao.usuarioId).toBe(admin.id);
    expect(logAlteracao.detalhes.alteracoes).toHaveLength(1);
    expect(logAlteracao.detalhes.alteracoes[0].papel).toBe("GESTOR");
  });

  test("retorna o historico em ordem do mais recente para o mais antigo", async () => {
    await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({ itens: [{ papel: "GESTOR", chave: "IMPORTAR_DADOS", permitido: true }] });

    await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({ itens: [{ papel: "GESTOR", chave: "IMPORTAR_DADOS", permitido: false }] });

    const res = await request(app).get("/api/permissoes/historico").set("Authorization", authHeader(admin));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].permitidoAntes).toBe(true);
    expect(res.body[0].permitidoDepois).toBe(false);
    expect(res.body[1].permitidoAntes).toBe(false);
    expect(res.body[1].permitidoDepois).toBe(true);
  });
});

describe("Enforcement de uma rota controlada pela matriz", () => {
  test("COLABORADOR nao pode gerenciar usuarios por padrao", async () => {
    const res = await request(app).get("/api/usuarios").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(403);
  });

  test("alterar a matriz reflete imediatamente na rota de usuarios", async () => {
    await request(app)
      .patch("/api/permissoes")
      .set("Authorization", authHeader(admin))
      .send({ itens: [{ papel: "COLABORADOR", chave: "GERENCIAR_USUARIOS", permitido: true }] });

    const res = await request(app).get("/api/usuarios").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
  });
});
