const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const registerSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo."),
  email: z.string().trim().email("Informe um e-mail valido."),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.")
});

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
  senha: z.string().min(1, "Informe a senha.")
});

function toPublicUser(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    provedor: usuario.provedor,
    funcionarioId: usuario.funcionarioId
  };
}

function signToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Cadastro de novo usuario (login simples por e-mail/senha).
// O primeiro usuario cadastrado no sistema vira ADMIN automaticamente.
router.post("/register", validateBody(registerSchema), asyncHandler(async (req, res) => {
  const { nome, email, senha } = req.body;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ error: "Ja existe uma conta com este e-mail." });
  }

  const totalUsuarios = await prisma.usuario.count();
  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      papel: totalUsuarios === 0 ? "ADMIN" : "COLABORADOR"
    }
  });

  const token = signToken(usuario);
  return res.status(201).json({ token, usuario: toPublicUser(usuario) });
}));

// Login com e-mail e senha.
router.post("/login", validateBody(loginSchema), asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.senhaHash || !usuario.ativo) {
    return res.status(401).json({ error: "E-mail ou senha invalidos." });
  }

  const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaOk) {
    return res.status(401).json({ error: "E-mail ou senha invalidos." });
  }

  const token = signToken(usuario);
  return res.json({ token, usuario: toPublicUser(usuario) });
}));

// Retorna os dados do usuario autenticado (usado para validar o token salvo).
router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.sub } });
  if (!usuario || !usuario.ativo) {
    return res.status(401).json({ error: "Usuario nao encontrado." });
  }
  return res.json({ usuario: toPublicUser(usuario) });
}));

module.exports = router;
