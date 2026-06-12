const request = require("supertest");

const app = require("../app");
const { prisma, criarUsuario, authHeader, SENHA_PADRAO } = require("./helpers");

// Garante que o cenario do "primeiro usuario" seja testavel mesmo que outras
// suites ja tenham criado usuarios antes desta rodar.
beforeAll(async () => {
  await prisma.usuario.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  test("o primeiro usuario cadastrado no sistema vira ADMIN", async () => {
    const res = await request(app).post("/api/auth/register").send({
      nome: "Primeiro Usuario",
      email: "primeiro@teste.com",
      senha: SENHA_PADRAO
    });

    expect(res.status).toBe(201);
    expect(res.body.usuario.papel).toBe("ADMIN");
    expect(res.body.token).toBeTruthy();
  });

  test("o segundo usuario cadastrado vira COLABORADOR", async () => {
    const res = await request(app).post("/api/auth/register").send({
      nome: "Segundo Usuario",
      email: "segundo@teste.com",
      senha: SENHA_PADRAO
    });

    expect(res.status).toBe(201);
    expect(res.body.usuario.papel).toBe("COLABORADOR");
  });

  test("rejeita e-mail duplicado", async () => {
    const res = await request(app).post("/api/auth/register").send({
      nome: "Duplicado",
      email: "primeiro@teste.com",
      senha: SENHA_PADRAO
    });

    expect(res.status).toBe(409);
  });

  test("rejeita dados invalidos", async () => {
    const res = await request(app).post("/api/auth/register").send({
      nome: "X",
      email: "nao-e-email",
      senha: "123"
    });

    expect(res.status).toBe(400);
    expect(res.body.detalhes).toBeInstanceOf(Array);
  });
});

describe("POST /api/auth/login", () => {
  test("autentica com credenciais corretas", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "primeiro@teste.com",
      senha: SENHA_PADRAO
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.usuario.email).toBe("primeiro@teste.com");
  });

  test("rejeita senha incorreta", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "primeiro@teste.com",
      senha: "senha-errada"
    });

    expect(res.status).toBe(401);
  });

  test("rejeita usuario inexistente", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "inexistente@teste.com",
      senha: SENHA_PADRAO
    });

    expect(res.status).toBe(401);
  });

  test("rejeita usuario inativo", async () => {
    const inativo = await criarUsuario({ email: "inativo@teste.com", ativo: false });

    const res = await request(app).post("/api/auth/login").send({
      email: inativo.email,
      senha: SENHA_PADRAO
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  test("retorna 401 sem token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("retorna 401 com token invalido", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer token-invalido");
    expect(res.status).toBe(401);
  });

  test("retorna os dados do usuario autenticado", async () => {
    const usuario = await criarUsuario({ email: "me@teste.com" });

    const res = await request(app).get("/api/auth/me").set("Authorization", authHeader(usuario));

    expect(res.status).toBe(200);
    expect(res.body.usuario.email).toBe("me@teste.com");
  });
});

describe("POST /api/auth/senha", () => {
  test("altera a senha com a senha atual correta", async () => {
    const usuario = await criarUsuario({ email: "trocasenha@teste.com" });

    const res = await request(app)
      .post("/api/auth/senha")
      .set("Authorization", authHeader(usuario))
      .send({ senhaAtual: SENHA_PADRAO, novaSenha: "NovaSenha@123" });

    expect(res.status).toBe(200);

    const login = await request(app).post("/api/auth/login").send({
      email: usuario.email,
      senha: "NovaSenha@123"
    });
    expect(login.status).toBe(200);
  });

  test("rejeita troca de senha com senha atual incorreta", async () => {
    const usuario = await criarUsuario({ email: "trocaerrada@teste.com" });

    const res = await request(app)
      .post("/api/auth/senha")
      .set("Authorization", authHeader(usuario))
      .send({ senhaAtual: "senha-errada", novaSenha: "NovaSenha@123" });

    expect(res.status).toBe(401);
  });
});
