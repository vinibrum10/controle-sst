const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader } = require("./helpers");
const { DEFAULT_PERMISSOES } = require("../utils/permissionsSeed");
const { invalidarMatriz } = require("../utils/permissions");

let admin, gestor, colaborador;

beforeAll(async () => {
  admin = await criarUsuario({ email: "config-admin@teste.com", papel: "ADMIN" });
  gestor = await criarUsuario({ email: "config-gestor@teste.com", papel: "GESTOR" });
  colaborador = await criarUsuario({ email: "config-colaborador@teste.com", papel: "COLABORADOR" });
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.cadastroGeral.deleteMany({});
  await prisma.configuracaoSistema.deleteMany({});

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

describe("GET /api/configuracoes/sistema", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/configuracoes/sistema");
    expect(res.status).toBe(401);
  });

  test("qualquer usuario autenticado pode consultar e o registro e criado automaticamente", async () => {
    const res = await request(app).get("/api/configuracoes/sistema").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(res.body.nomeSistema).toBe("SGEPI");
  });
});

describe("PATCH /api/configuracoes/sistema", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).patch("/api/configuracoes/sistema").send({ nomeSistema: "Outro" });
    expect(res.status).toBe(401);
  });

  test("COLABORADOR nao pode atualizar", async () => {
    const res = await request(app)
      .patch("/api/configuracoes/sistema")
      .set("Authorization", authHeader(colaborador))
      .send({ nomeSistema: "Outro" });
    expect(res.status).toBe(403);
  });

  test("ADMIN pode atualizar nome do sistema, nome da empresa e logo", async () => {
    const res = await request(app)
      .patch("/api/configuracoes/sistema")
      .set("Authorization", authHeader(admin))
      .send({ nomeSistema: "Meu Sistema", nomeEmpresa: "Minha Empresa", logoUrl: "data:image/png;base64,abc" });

    expect(res.status).toBe(200);
    expect(res.body.nomeSistema).toBe("Meu Sistema");
    expect(res.body.nomeEmpresa).toBe("Minha Empresa");
    expect(res.body.logoUrl).toBe("data:image/png;base64,abc");
  });

  test("GESTOR pode atualizar", async () => {
    const res = await request(app)
      .patch("/api/configuracoes/sistema")
      .set("Authorization", authHeader(gestor))
      .send({ nomeEmpresa: "Empresa Gestor" });

    expect(res.status).toBe(200);
    expect(res.body.nomeEmpresa).toBe("Empresa Gestor");
  });

  test("rejeita nome do sistema vazio", async () => {
    const res = await request(app)
      .patch("/api/configuracoes/sistema")
      .set("Authorization", authHeader(admin))
      .send({ nomeSistema: "" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/cadastros", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/cadastros");
    expect(res.status).toBe(401);
  });

  test("qualquer usuario autenticado pode listar", async () => {
    const res = await request(app).get("/api/cadastros").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api/cadastros", () => {
  const item = { categoria: "UNIDADE", nome: "Unidade Central", descricao: "Sede administrativa" };

  test("COLABORADOR nao pode criar", async () => {
    const res = await request(app).post("/api/cadastros").set("Authorization", authHeader(colaborador)).send(item);
    expect(res.status).toBe(403);
  });

  test("ADMIN pode criar", async () => {
    const res = await request(app).post("/api/cadastros").set("Authorization", authHeader(admin)).send(item);
    expect(res.status).toBe(201);
    expect(res.body.categoria).toBe("UNIDADE");
    expect(res.body.nome).toBe("Unidade Central");
    expect(res.body.ativo).toBe(true);
  });

  test("GESTOR pode criar", async () => {
    const res = await request(app)
      .post("/api/cadastros")
      .set("Authorization", authHeader(gestor))
      .send({ categoria: "EQUIPE", nome: "Equipe Manutencao" });
    expect(res.status).toBe(201);
  });

  test("rejeita categoria invalida", async () => {
    const res = await request(app)
      .post("/api/cadastros")
      .set("Authorization", authHeader(admin))
      .send({ categoria: "INVALIDA", nome: "Teste" });
    expect(res.status).toBe(400);
  });

  test("rejeita nome duplicado na mesma categoria", async () => {
    await request(app).post("/api/cadastros").set("Authorization", authHeader(admin)).send(item);
    const res = await request(app).post("/api/cadastros").set("Authorization", authHeader(admin)).send(item);
    expect(res.status).toBe(409);
  });
});

describe("PATCH /api/cadastros/:id", () => {
  let criado;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/cadastros")
      .set("Authorization", authHeader(admin))
      .send({ categoria: "TIPO_TREINAMENTO", nome: "NR-35" });
    criado = res.body;
  });

  test("COLABORADOR nao pode atualizar", async () => {
    const res = await request(app)
      .patch(`/api/cadastros/${criado.id}`)
      .set("Authorization", authHeader(colaborador))
      .send({ ativo: false });
    expect(res.status).toBe(403);
  });

  test("ADMIN pode inativar e editar", async () => {
    const res = await request(app)
      .patch(`/api/cadastros/${criado.id}`)
      .set("Authorization", authHeader(admin))
      .send({ ativo: false, nome: "NR-35 Atualizado" });

    expect(res.status).toBe(200);
    expect(res.body.ativo).toBe(false);
    expect(res.body.nome).toBe("NR-35 Atualizado");
  });
});

describe("DELETE /api/cadastros/:id", () => {
  test("ADMIN pode excluir", async () => {
    const criar = await request(app)
      .post("/api/cadastros")
      .set("Authorization", authHeader(admin))
      .send({ categoria: "AREA_SETOR", nome: "Producao" });

    const res = await request(app).delete(`/api/cadastros/${criar.body.id}`).set("Authorization", authHeader(admin));
    expect(res.status).toBe(204);
  });

  test("COLABORADOR nao pode excluir", async () => {
    const criar = await request(app)
      .post("/api/cadastros")
      .set("Authorization", authHeader(admin))
      .send({ categoria: "AREA_SETOR", nome: "Logistica" });

    const res = await request(app)
      .delete(`/api/cadastros/${criar.body.id}`)
      .set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(403);
  });
});
