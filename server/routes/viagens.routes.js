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

const iniciarSchema = z.object({
  origem: z.string().trim().min(1, "Informe a origem."),
  destino: z.string().trim().min(1, "Informe o destino."),
  motivo: z.string().trim().min(1, "Informe o motivo da viagem."),
  tecnicoFuncId: z.string().optional()
});

async function getTecnicoId(userId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { funcionarioId: true }
  });
  return usuario?.funcionarioId ?? null;
}

function podeOperar(viagem, funcId, userId, papel) {
  if (papel === "ADMIN" || papel === "GESTOR") return true;
  if (viagem.criadoPorId && viagem.criadoPorId === userId) return true;
  return viagem.tecnicoId !== null && viagem.tecnicoId === funcId;
}

router.get("/", asyncHandler(async (req, res) => {
  const { semana, data, tecnicoId, criadoPorId, ativos } = req.query;
  const where = {};

  if (semana) {
    const info = semanaInfoFromCodigo(semana);
    if (info) {
      const fim = new Date(info.dataFim.getTime() + 24 * 3600 * 1000);
      where.iniciadoEm = { gte: info.dataInicio, lt: fim };
    }
  } else if (data) {
    where.iniciadoEm = {
      gte: new Date(`${data}T00:00:00`),
      lte: new Date(`${data}T23:59:59`)
    };
  }

  if (ativos === "true") {
    where.finalizadoEm = null;
  }

  if (criadoPorId) {
    where.criadoPorId = criadoPorId;
  } else if (tecnicoId) {
    where.tecnicoId = tecnicoId;
  }

  const viagens = await prisma.viagem.findMany({
    where,
    include: { tecnico: { select: { id: true, nome: true } } },
    orderBy: { iniciadoEm: "desc" }
  });
  res.json(viagens);
}));

router.post("/", validateBody(iniciarSchema), asyncHandler(async (req, res) => {
  const { origem, destino, motivo, tecnicoFuncId } = req.body;
  const userId = req.user.sub;
  const papel = req.user.papel;

  const meuFuncId = await getTecnicoId(userId);

  let targetFuncId = meuFuncId;
  if (tecnicoFuncId && (papel === "ADMIN" || papel === "GESTOR")) {
    targetFuncId = tecnicoFuncId;
  }

  const viagem = await prisma.viagem.create({
    data: {
      origem,
      destino,
      motivo,
      tecnicoId: targetFuncId,
      criadoPorId: userId,
      iniciadoEm: new Date()
    },
    include: { tecnico: { select: { id: true, nome: true } } }
  });
  res.status(201).json(viagem);
}));

router.patch("/:id/finalizar", asyncHandler(async (req, res) => {
  const existente = await prisma.viagem.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Viagem não encontrada." });
  if (existente.finalizadoEm) return res.status(400).json({ error: "Viagem já finalizada." });

  const funcId = await getTecnicoId(req.user.sub);
  if (!podeOperar(existente, funcId, req.user.sub, req.user.papel)) {
    return res.status(403).json({ error: "Apenas quem iniciou a viagem pode finalizá-la." });
  }

  const finalizadoEm = new Date();
  const duracaoSegundos = calcularDuracaoUtil(
    existente.iniciadoEm.getTime(),
    finalizadoEm.getTime()
  );

  const viagem = await prisma.viagem.update({
    where: { id: req.params.id },
    data: { finalizadoEm, duracaoSegundos },
    include: { tecnico: { select: { id: true, nome: true } } }
  });
  res.json(viagem);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const existente = await prisma.viagem.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Viagem não encontrada." });

  const funcId = await getTecnicoId(req.user.sub);
  if (!podeOperar(existente, funcId, req.user.sub, req.user.papel)) {
    return res.status(403).json({ error: "Apenas quem iniciou a viagem pode excluí-la." });
  }

  await prisma.viagem.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

module.exports = router;
