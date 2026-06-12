const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader } = require("./helpers");

let admin, outroAdmin, gestor, colaborador;

beforeAll(async () => {
  admin = await criarUsuario({ email: "usuarios-admin@teste.com", papel: "ADMIN" });
  outroAdmin = await criarUsuario({ email: "usuarios-outro-admin@teste.com", papel: "ADMIN" });
  gestor = await criarUsuario({ email: "usuarios-gestor@teste.com", papel: "GESTOR" });
  colaborador = await criarUsuario({ email: "usuarios-colaborador@teste.com", papel: "COLABORADOR" });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/usuarios", () => {
  test("requer autenticacao", async () => {
    const res = await request(app).get("/api/usuarios");
    expect(res.status).toBe(401);
  });

  test("nao permite acesso a GESTOR", async () => {
    const res = await request(app).get("/api/usuarios").set("Authorization", authHeader(gestor));
    expect(res.status).toBe(403);
  });

  test("nao permite acesso a COLABORADOR", async () => {
    const res = await request(app).get("/api/usuarios").set("Authorization", authHeader(colaborador));
    expect(res.status).toBe(403);
  });

  test("ADMIN pode listar usuarios", async () => {
    const res = await request(app).get("/api/usuarios").set("Authorization", authHeader(admin));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u) => u.email === colaborador.email)).toBe(true);
    expect(res.body[0]).not.toHaveProperty("senhaHash");
  });
});

describe("PATCH /api/usuarios/:id", () => {
  test("ADMIN pode alterar o papel de outro usuario", async () => {
    const res = await request(app)
      .patch(`/api/usuarios/${colaborador.id}`)
      .set("Authorization", authHeader(admin))
      .send({ papel: "TST" });

    expect(res.status).toBe(200);
    expect(res.body.papel).toBe("TST");
  });

  test("ADMIN pode inativar outro usuario", async () => {
    const res = await request(app)
      .patch(`/api/usuarios/${gestor.id}`)
      .set("Authorization", authHeader(admin))
      .send({ ativo: false });

    expect(res.status).toBe(200);
    expect(res.body.ativo).toBe(false);
  });

  test("ADMIN nao pode alterar o proprio papel/status", async () => {
    const res = await request(app)
      .patch(`/api/usuarios/${admin.id}`)
      .set("Authorization", authHeader(admin))
      .send({ papel: "COLABORADOR" });

    expect(res.status).toBe(400);
  });

  test("rejeita corpo sem papel ou ativo", async () => {
    const res = await request(app)
      .patch(`/api/usuarios/${outroAdmin.id}`)
      .set("Authorization", authHeader(admin))
      .send({});

    expect(res.status).toBe(400);
  });

  test("retorna 404 para usuario inexistente", async () => {
    const res = await request(app)
      .patch("/api/usuarios/00000000-0000-0000-0000-000000000000")
      .set("Authorization", authHeader(admin))
      .send({ ativo: false });

    expect(res.status).toBe(404);
  });

  test("nao permite acesso a usuario nao-ADMIN", async () => {
    const res = await request(app)
      .patch(`/api/usuarios/${colaborador.id}`)
      .set("Authorization", authHeader(gestor))
      .send({ papel: "GESTOR" });

    expect(res.status).toBe(403);
  });
});
