const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../db");

const SENHA_PADRAO = "Senha@123";

async function criarUsuario({ nome = "Usuario Teste", email, senha = SENHA_PADRAO, papel = "COLABORADOR", ativo = true, funcionarioId = null } = {}) {
  const senhaHash = await bcrypt.hash(senha, 10);
  return prisma.usuario.create({
    data: { nome, email, senhaHash, papel, ativo, funcionarioId }
  });
}

function gerarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function authHeader(usuario) {
  return `Bearer ${gerarToken(usuario)}`;
}

async function criarFuncionario(overrides = {}) {
  return prisma.funcionario.create({
    data: {
      nome: "Funcionario Teste",
      funcao: "Tecnico de Seguranca",
      email: `funcionario-${Date.now()}-${Math.random().toString(36).slice(2)}@teste.com`,
      capacidade: 40,
      ...overrides
    }
  });
}

module.exports = { prisma, SENHA_PADRAO, criarUsuario, gerarToken, authHeader, criarFuncionario };
