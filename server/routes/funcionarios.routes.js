const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Cadastrar, editar e ativar/inativar funcionarios e' permitido a ADMIN,
// GESTOR e VISUALIZADOR. Excluir e' restrito a ADMIN e GESTOR. Qualquer
// usuario autenticado pode consultar a lista.
const requireGestao = requireRole("ADMIN", "GESTOR", "VISUALIZADOR");
const requireExclusao = requireRole("ADMIN", "GESTOR");

const funcionarioSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  funcao: z.string().trim().min(2, "Informe a funcao."),
  email: z.string().trim().email("Informe um e-mail valido."),
  capacidade: z.number({ invalid_type_error: "Capacidade deve ser um numero." })
    .int("Capacidade deve ser um numero inteiro.")
    .positive("Capacidade semanal deve ser maior que zero."),
  foto: z.string().nullable().optional(),
  ativo: z.boolean().optional()
});

const funcionarioUpdateSchema = funcionarioSchema.partial();

router.use(requireAuth);

// Lista funcionarios (com indicadores de carga calculados sob demanda).
router.get("/", asyncHandler(async (req, res) => {
  const funcionarios = await prisma.funcionario.findMany({
    orderBy: { nome: "asc" }
  });
  res.json(funcionarios);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const funcionario = await prisma.funcionario.findUnique({ where: { id: req.params.id } });
  if (!funcionario) return res.status(404).json({ error: "Funcionario nao encontrado." });
  res.json(funcionario);
}));

router.post("/", requireGestao, validateBody(funcionarioSchema), asyncHandler(async (req, res) => {
  const funcionario = await prisma.funcionario.create({ data: req.body });
  res.status(201).json(funcionario);
}));

router.put("/:id", requireGestao, validateBody(funcionarioUpdateSchema), asyncHandler(async (req, res) => {
  const funcionario = await prisma.funcionario.findUnique({ where: { id: req.params.id } });
  if (!funcionario) return res.status(404).json({ error: "Funcionario nao encontrado." });

  const atualizado = await prisma.funcionario.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(atualizado);
}));

// Ativar/inativar (preserva historico de tarefas vinculadas).
router.patch("/:id/status", requireGestao, validateBody(z.object({ ativo: z.boolean() })), asyncHandler(async (req, res) => {
  const funcionario = await prisma.funcionario.findUnique({ where: { id: req.params.id } });
  if (!funcionario) return res.status(404).json({ error: "Funcionario nao encontrado." });

  const atualizado = await prisma.funcionario.update({
    where: { id: req.params.id },
    data: { ativo: req.body.ativo }
  });
  res.json(atualizado);
}));

router.delete("/:id", requireExclusao, asyncHandler(async (req, res) => {
  const funcionario = await prisma.funcionario.findUnique({ where: { id: req.params.id } });
  if (!funcionario) return res.status(404).json({ error: "Funcionario nao encontrado." });

  const tarefasVinculadas = await prisma.tarefa.count({
    where: { OR: [{ responsavelId: funcionario.id }, { apoioId: funcionario.id }] }
  });
  const ajudaVinculada = await prisma.pedidoAjuda.count({
    where: { OR: [{ solicitanteId: funcionario.id }, { atendentePorId: funcionario.id }] }
  });

  if (tarefasVinculadas > 0 || ajudaVinculada > 0) {
    return res.status(409).json({
      error: "Existem tarefas ou pedidos de ajuda vinculados a este funcionario. Inative-o para preservar o historico."
    });
  }

  await prisma.funcionario.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

module.exports = router;
