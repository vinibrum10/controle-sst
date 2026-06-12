const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader, criarFuncionario } = require("./helpers");

let usuario, funcionario;

// Datas fixas em 2000 evitam colisao com tarefas criadas por outras suites
// (que usam `new Date()`, sempre dentro do periodo padrao dos ultimos 30 dias).
const dentroDoPeriodo = new Date("2000-01-15T00:00:00Z");
const foraDoPeriodo = new Date("1999-01-15T00:00:00Z");

beforeAll(async () => {
  usuario = await criarUsuario({ email: "relatorios-usuario@teste.com", papel: "GESTOR" });
  funcionario = await criarFuncionario({ email: "relatorios-funcionario@teste.com" });

  await prisma.tarefa.create({
    data: {
      titulo: "Tarefa concluida no prazo",
      responsavelId: funcionario.id,
      prazo: dentroDoPeriodo,
      horasEstimadas: 8,
      status: "CONCLUIDA",
      concluidaEm: dentroDoPeriodo
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: "Tarefa pendente",
      responsavelId: funcionario.id,
      prazo: dentroDoPeriodo,
      horasEstimadas: 4,
      status: "PENDENTE"
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: "Tarefa fora do periodo",
      responsavelId: funcionario.id,
      prazo: foraDoPeriodo,
      horasEstimadas: 2,
      status: "PENDENTE"
    }
  });

  await prisma.treinamento.create({ data: { titulo: "Treinamento NR-35", status: "PLANEJADO" } });
  await prisma.treinamento.create({ data: { titulo: "Treinamento NR-33", status: "REALIZADO" } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/relatorios", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/relatorios");
    expect(res.status).toBe(401);
  });

  test("retorna o resumo dos ultimos 30 dias por padrao", async () => {
    const res = await request(app).get("/api/relatorios").set("Authorization", authHeader(usuario));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("periodo");
    expect(res.body).toHaveProperty("tarefas");
    expect(res.body).toHaveProperty("porFuncionario");
    expect(res.body).toHaveProperty("programasSST");
  });

  test("filtra tarefas por periodo customizado", async () => {
    const res = await request(app)
      .get("/api/relatorios?inicio=2000-01-01&fim=2000-01-31")
      .set("Authorization", authHeader(usuario));

    expect(res.status).toBe(200);
    expect(res.body.periodo.inicio.slice(0, 10)).toBe("2000-01-01");
    expect(res.body.tarefas.total).toBe(2);
    expect(res.body.tarefas.concluidas).toBe(1);
    expect(res.body.tarefas.pendentes).toBe(1);
    expect(res.body.tarefas.horasEstimadas).toBe(12);
    expect(res.body.tarefas.entregasNoPrazoPercent).toBe(100);
  });

  test("nao inclui tarefas fora do periodo informado", async () => {
    const res = await request(app)
      .get("/api/relatorios?inicio=1999-01-01&fim=1999-01-31")
      .set("Authorization", authHeader(usuario));

    expect(res.status).toBe(200);
    expect(res.body.tarefas.total).toBe(1);
  });

  test("inclui o desempenho por funcionario no periodo informado", async () => {
    const res = await request(app)
      .get("/api/relatorios?inicio=2000-01-01&fim=2000-01-31")
      .set("Authorization", authHeader(usuario));

    const item = res.body.porFuncionario.find((p) => p.funcionario.id === funcionario.id);
    expect(item).toBeTruthy();
    expect(item.total).toBe(2);
    expect(item.concluidas).toBe(1);
  });

  test("inclui a contagem de programas de SST", async () => {
    const res = await request(app).get("/api/relatorios").set("Authorization", authHeader(usuario));

    expect(res.body.programasSST.treinamentos.total).toBeGreaterThanOrEqual(2);
    expect(res.body.programasSST.treinamentos.PLANEJADO).toBeGreaterThanOrEqual(1);
    expect(res.body.programasSST.treinamentos.REALIZADO).toBeGreaterThanOrEqual(1);
  });
});
