const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { calcularDuracaoUtil } = require("../utils/duracaoUtil");
const { semanaInfoFromCodigo } = require("../utils/semana");

const router = express.Router();
router.use(requireAuth);

const MAX_OS_ATIVAS = 3;

const iniciarSchema = z.object({
  numeroOS: z.string().trim().min(1, "Informe o número da OS."),
  solicitante: z.string().trim().min(1, "Informe o nome do solicitante."),
  responsavelFuncId: z.string().optional()
});

/** Retorna o funcionarioId do usuário logado. */
async function getFuncId(userId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { funcionarioId: true }
  });
  return usuario?.funcionarioId ?? null;
}

/** Retorna true se o usuário logado pode operar a OS (criador, responsável ou ADMIN/GESTOR). */
function podeOperar(existente, funcId, userId, papel) {
  if (papel === "ADMIN" || papel === "GESTOR") return true;
  if (existente.criadoPorId && existente.criadoPorId === userId) return true;
  return existente.responsavelId !== null && existente.responsavelId === funcId;
}

router.get("/", asyncHandler(async (req, res) => {
  const { semana, data, responsavelId, criadoPorId, ativos } = req.query;
  const where = {};

  if (semana) {
    const info = semanaInfoFromCodigo(semana);
    if (info) {
      const fim = new Date(info.dataFim.getTime() + 24 * 3600 * 1000);
      where.iniciadoEm = { gte: info.dataInicio, lt: fim };
    }
  } else if (data) {
    const inicio = new Date(`${data}T00:00:00`);
    const fim = new Date(`${data}T23:59:59`);
    where.iniciadoEm = { gte: inicio, lte: fim };
  }

  if (ativos === "true") {
    where.finalizadoEm = null;
  }
  if (criadoPorId) {
    where.criadoPorId = criadoPorId;
  } else if (responsavelId) {
    where.responsavelId = responsavelId;
  }

  const atendimentos = await prisma.atendimentoOS.findMany({
    where,
    include: { responsavel: { select: { id: true, nome: true } } },
    orderBy: { iniciadoEm: "desc" }
  });
  res.json(atendimentos);
}));

router.post("/", validateBody(iniciarSchema), asyncHandler(async (req, res) => {
  const { numeroOS, solicitante, responsavelFuncId } = req.body;
  const userId = req.user.sub;
  const papel = req.user.papel;

  const meuFuncId = await getFuncId(userId);

  // ADMIN/GESTOR pode abrir OS em nome de outro técnico
  let targetFuncId = meuFuncId;
  if (responsavelFuncId && (papel === "ADMIN" || papel === "GESTOR")) {
    targetFuncId = responsavelFuncId;
  }

  // Conta OS ativas para o responsável alvo
  const filtroAtivas = targetFuncId
    ? { finalizadoEm: null, OR: [{ responsavelId: targetFuncId }, { criadoPorId: userId }] }
    : { criadoPorId: userId, finalizadoEm: null };

  const ativas = await prisma.atendimentoOS.count({ where: filtroAtivas });
  if (ativas >= MAX_OS_ATIVAS) {
    return res.status(400).json({
      error: `Máximo de ${MAX_OS_ATIVAS} OS em atendimento simultâneo.`
    });
  }

  const atendimento = await prisma.atendimentoOS.create({
    data: {
      numeroOS,
      solicitante,
      responsavelId: targetFuncId,
      criadoPorId: userId,
      iniciadoEm: new Date()
    },
    include: { responsavel: { select: { id: true, nome: true } } }
  });
  res.status(201).json(atendimento);
}));

router.patch("/:id/finalizar", asyncHandler(async (req, res) => {
  const existente = await prisma.atendimentoOS.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Atendimento não encontrado." });
  if (existente.finalizadoEm) return res.status(400).json({ error: "Atendimento já finalizado." });

  const funcId = await getFuncId(req.user.sub);
  if (!podeOperar(existente, funcId, req.user.sub, req.user.papel)) {
    return res.status(403).json({ error: "Apenas quem abriu a OS pode finalizá-la." });
  }

  const finalizadoEm = new Date();
  const duracaoSegundos = calcularDuracaoUtil(
    existente.iniciadoEm.getTime(),
    finalizadoEm.getTime()
  );

  const atendimento = await prisma.atendimentoOS.update({
    where: { id: req.params.id },
    data: { finalizadoEm, duracaoSegundos },
    include: { responsavel: { select: { id: true, nome: true } } }
  });
  res.json(atendimento);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const existente = await prisma.atendimentoOS.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Atendimento não encontrado." });

  const funcId = await getFuncId(req.user.sub);
  if (!podeOperar(existente, funcId, req.user.sub, req.user.papel)) {
    return res.status(403).json({ error: "Apenas quem abriu a OS pode excluí-la." });
  }

  await prisma.atendimentoOS.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

module.exports = router;
