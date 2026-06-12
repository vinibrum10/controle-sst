const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader, criarFuncionario } = require("./helpers");

let admin, gestor, visualizador, colaborador, tst;

beforeAll(async () => {
  admin = await criarUsuario({ email: "func-admin@teste.com", papel: "ADMIN" });
  gestor = await criarUsuario({ email: "func-gestor@teste.com", papel: "GESTOR" });
  visualizador = await criarUsuario({ email: "func-visualizador@teste.com", papel: "VISUALIZADOR" });
  colaborador = await criarUsuario({ email: "func-colaborador@teste.com", papel: "COLABORADOR" });
  tst = await criarUsuario({ email: "func-tst@teste.com", papel: "TST" });
});

afterAll(async () => {
  await prisma.$disconnect();
});

const novoFuncionario = (sufixo) => ({
  nome: `Funcionario ${sufixo}`,
  funcao: "Tecnico de Seguranca",
  email: `novo-${sufixo}@teste.com`,
  capacidade: 40
});

describe("GET /api/funcionarios", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/funcionarios");
    expect(res.status).toBe(401);
  });

  test("qualquer usuario autenticado pode listar", async () => {
    const res = await request(app).get("/api/funcionarios").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api/funcionarios", () => {
  test("ADMIN pode criar", async () => {
    const res = await request(app)
      .post("/api/funcionarios")
      .set("Authorization", authHeader(admin))
      .send(novoFuncionario("admin"));
    expect(res.status).toBe(201);
  });

  test("GESTOR pode criar", async () => {
    const res = await request(app)
      .post("/api/funcionarios")
      .set("Authorization", authHeader(gestor))
      .send(novoFuncionario("gestor"));
    expect(res.status).toBe(201);
  });

  test("VISUALIZADOR pode criar", async () => {
    const res = await request(app)
      .post("/api/funcionarios")
      .set("Authorization", authHeader(visualizador))
      .send(novoFuncionario("visualizador"));
    expect(res.status).toBe(201);
  });

  test("COLABORADOR nao pode criar", async () => {
    const res = await request(app)
      .post("/api/funcionarios")
      .set("Authorization", authHeader(colaborador))
      .send(novoFuncionario("colaborador"));
    expect(res.status).toBe(403);
  });

  test("TST nao pode criar", async () => {
    const res = await request(app)
      .post("/api/funcionarios")
      .set("Authorization", authHeader(tst))
      .send(novoFuncionario("tst"));
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/funcionarios/:id/status", () => {
  test("VISUALIZADOR pode ativar/inativar", async () => {
    const funcionario = await criarFuncionario({ email: "status-visualizador@teste.com" });

    const res = await request(app)
      .patch(`/api/funcionarios/${funcionario.id}/status`)
      .set("Authorization", authHeader(visualizador))
      .send({ ativo: false });

    expect(res.status).toBe(200);
    expect(res.body.ativo).toBe(false);
  });

  test("COLABORADOR nao pode ativar/inativar", async () => {
    const funcionario = await criarFuncionario({ email: "status-colaborador@teste.com" });

    const res = await request(app)
      .patch(`/api/funcionarios/${funcionario.id}/status`)
      .set("Authorization", authHeader(colaborador))
      .send({ ativo: false });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/funcionarios/:id", () => {
  test("VISUALIZADOR nao pode excluir", async () => {
    const funcionario = await criarFuncionario({ email: "delete-visualizador@teste.com" });

    const res = await request(app)
      .delete(`/api/funcionarios/${funcionario.id}`)
      .set("Authorization", authHeader(visualizador));

    expect(res.status).toBe(403);
  });

  test("GESTOR pode excluir funcionario sem vinculos", async () => {
    const funcionario = await criarFuncionario({ email: "delete-gestor@teste.com" });

    const res = await request(app)
      .delete(`/api/funcionarios/${funcionario.id}`)
      .set("Authorization", authHeader(gestor));

    expect(res.status).toBe(204);
  });

  test("ADMIN nao pode excluir funcionario com tarefas vinculadas", async () => {
    const funcionario = await criarFuncionario({ email: "delete-com-tarefa@teste.com" });
    await prisma.tarefa.create({
      data: {
        titulo: "Tarefa vinculada",
        responsavelId: funcionario.id,
        prazo: new Date(),
        horasEstimadas: 4
      }
    });

    const res = await request(app)
      .delete(`/api/funcionarios/${funcionario.id}`)
      .set("Authorization", authHeader(admin));

    expect(res.status).toBe(409);
  });
});
