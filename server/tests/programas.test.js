const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader } = require("./helpers");

let admin, gestor, tst, visualizador, colaborador;

beforeAll(async () => {
  admin = await criarUsuario({ email: "prog-admin@teste.com", papel: "ADMIN" });
  gestor = await criarUsuario({ email: "prog-gestor@teste.com", papel: "GESTOR" });
  tst = await criarUsuario({ email: "prog-tst@teste.com", papel: "TST" });
  visualizador = await criarUsuario({ email: "prog-visualizador@teste.com", papel: "VISUALIZADOR" });
  colaborador = await criarUsuario({ email: "prog-colaborador@teste.com", papel: "COLABORADOR" });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/treinamentos", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/treinamentos");
    expect(res.status).toBe(401);
  });

  test("qualquer usuario autenticado pode listar", async () => {
    const res = await request(app).get("/api/treinamentos").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
  });
});

describe("POST /api/treinamentos", () => {
  const treinamento = { titulo: "Treinamento NR-35", norma: "NR-35" };

  test("ADMIN pode criar", async () => {
    const res = await request(app)
      .post("/api/treinamentos")
      .set("Authorization", authHeader(admin))
      .send(treinamento);
    expect(res.status).toBe(201);
  });

  test("GESTOR pode criar", async () => {
    const res = await request(app)
      .post("/api/treinamentos")
      .set("Authorization", authHeader(gestor))
      .send(treinamento);
    expect(res.status).toBe(201);
  });

  test("TST pode criar", async () => {
    const res = await request(app)
      .post("/api/treinamentos")
      .set("Authorization", authHeader(tst))
      .send(treinamento);
    expect(res.status).toBe(201);
  });

  test("VISUALIZADOR nao pode criar", async () => {
    const res = await request(app)
      .post("/api/treinamentos")
      .set("Authorization", authHeader(visualizador))
      .send(treinamento);
    expect(res.status).toBe(403);
  });

  test("COLABORADOR nao pode criar", async () => {
    const res = await request(app)
      .post("/api/treinamentos")
      .set("Authorization", authHeader(colaborador))
      .send(treinamento);
    expect(res.status).toBe(403);
  });
});

describe("PUT/DELETE em programas SST (TST)", () => {
  test("TST pode editar e excluir uma inspecao", async () => {
    const criar = await request(app)
      .post("/api/inspecoes")
      .set("Authorization", authHeader(tst))
      .send({ titulo: "Inspecao de rotina", dataPrevista: new Date().toISOString() });
    expect(criar.status).toBe(201);

    const editar = await request(app)
      .put(`/api/inspecoes/${criar.body.id}`)
      .set("Authorization", authHeader(tst))
      .send({ status: "REALIZADA" });
    expect(editar.status).toBe(200);
    expect(editar.body.status).toBe("REALIZADA");

    const excluir = await request(app)
      .delete(`/api/inspecoes/${criar.body.id}`)
      .set("Authorization", authHeader(tst));
    expect(excluir.status).toBe(204);
  });

  test("VISUALIZADOR nao pode editar rotas seguras", async () => {
    const criar = await request(app)
      .post("/api/rotas-seguras")
      .set("Authorization", authHeader(admin))
      .send({ nome: "Rota A" });
    expect(criar.status).toBe(201);

    const editar = await request(app)
      .put(`/api/rotas-seguras/${criar.body.id}`)
      .set("Authorization", authHeader(visualizador))
      .send({ status: "INATIVA" });
    expect(editar.status).toBe(403);
  });
});
