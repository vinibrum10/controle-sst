const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader } = require("./helpers");
const { WIDGETS_DASHBOARD } = require("../utils/dashboardWidgets");

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.preferenciaDashboard.deleteMany({});
});

describe("GET /api/dashboard/preferencias", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/dashboard/preferencias");
    expect(res.status).toBe(401);
  });

  test("retorna os padroes para usuario sem preferencias salvas", async () => {
    const usuario = await criarUsuario({ email: "dash-pref-padrao@teste.com" });

    const res = await request(app).get("/api/dashboard/preferencias").set("Authorization", authHeader(usuario));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(WIDGETS_DASHBOARD.length);

    const tarefasAtivas = res.body.find((item) => item.id === "metric_tarefasAtivas");
    expect(tarefasAtivas).toMatchObject({ tipo: "metric", visivel: true, ordem: 0 });

    const prazoEm3Dias = res.body.find((item) => item.id === "metric_prazoEm3Dias");
    expect(prazoEm3Dias.visivel).toBe(false);

    const linkDashboard = res.body.find((item) => item.id === "link_dashboard");
    expect(linkDashboard).toMatchObject({ tipo: "link", visivel: true, ordem: 0 });
  });
});

describe("PUT /api/dashboard/preferencias", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).put("/api/dashboard/preferencias").send({ itens: [] });
    expect(res.status).toBe(401);
  });

  test("rejeita lista vazia ou ids invalidos", async () => {
    const usuario = await criarUsuario({ email: "dash-pref-invalido@teste.com" });

    const resVazio = await request(app)
      .put("/api/dashboard/preferencias")
      .set("Authorization", authHeader(usuario))
      .send({ itens: [] });
    expect(resVazio.status).toBe(400);

    const resInvalido = await request(app)
      .put("/api/dashboard/preferencias")
      .set("Authorization", authHeader(usuario))
      .send({ itens: [{ id: "widget_inexistente", visivel: true, ordem: 0 }] });
    expect(resInvalido.status).toBe(400);
  });

  test("salva visibilidade e ordem, refletindo no GET subsequente", async () => {
    const usuario = await criarUsuario({ email: "dash-pref-salvar@teste.com" });

    const res = await request(app)
      .put("/api/dashboard/preferencias")
      .set("Authorization", authHeader(usuario))
      .send({
        itens: [
          { id: "metric_vencidas", visivel: false, ordem: 0 },
          { id: "metric_pedidosAjuda", visivel: true, ordem: 4 },
          { id: "link_ajuda", visivel: false, ordem: 6 }
        ]
      });
    expect(res.status).toBe(200);

    const vencidas = res.body.find((item) => item.id === "metric_vencidas");
    expect(vencidas.visivel).toBe(false);

    const pedidosAjuda = res.body.find((item) => item.id === "metric_pedidosAjuda");
    expect(pedidosAjuda.visivel).toBe(true);
    expect(pedidosAjuda.ordem).toBe(4);

    const linkAjuda = res.body.find((item) => item.id === "link_ajuda");
    expect(linkAjuda.visivel).toBe(false);

    const recarregado = await request(app).get("/api/dashboard/preferencias").set("Authorization", authHeader(usuario));
    expect(recarregado.body.find((item) => item.id === "metric_vencidas").visivel).toBe(false);
    expect(recarregado.body.find((item) => item.id === "metric_pedidosAjuda").ordem).toBe(4);
  });

  test("preferencias sao isoladas por usuario", async () => {
    const usuarioA = await criarUsuario({ email: "dash-pref-userA@teste.com" });
    const usuarioB = await criarUsuario({ email: "dash-pref-userB@teste.com" });

    await request(app)
      .put("/api/dashboard/preferencias")
      .set("Authorization", authHeader(usuarioA))
      .send({ itens: [{ id: "link_ajuda", visivel: false, ordem: 0 }] });

    const resB = await request(app).get("/api/dashboard/preferencias").set("Authorization", authHeader(usuarioB));
    expect(resB.body.find((item) => item.id === "link_ajuda").visivel).toBe(true);
  });
});
