const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { calcularDuracaoUtil } = require("../utils/duracaoUtil");

const router = express.Router();
router.use(requireAuth);

const MAX_OS_ATIVAS = 3;

const iniciarSchema = z.object({
  numeroOS: z.string().trim().min(1, "Informe o número da OS.")
});

router.get("/", asyncHandler(async (req, res) => {
  const { data, responsavelId, ativos } = req.query;
  const where = {};

  if (data) {
    const inicio = new Date(`${data}T00:00:00`);
    const fim = new Date(`${data}T23:59:59`);
    where.iniciadoEm = { gte: inicio, lte: fim };
  }
  if (ativos === "true") {
    where.finalizadoEm = null;
  }
  if (responsavelId) where.responsavelId = responsavelId;

  const atendimentos = await prisma.atendimentoOS.findMany({
    where,
    include: { responsavel: { select: { id: true, nome: true } } },
    orderBy: { iniciadoEm: "desc" }
  });
  res.json(atendimentos);
}));

router.post("/", validateBody(iniciarSchema), asyncHandler(async (req, res) => {
  const { numeroOS } = req.body;

  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.sub },
    select: { funcionarioId: true }
  });
  const funcId = usuario?.funcionarioId ?? null;

  if (funcId) {
    const ativas = await prisma.atendimentoOS.count({
      where: { responsavelId: funcId, finalizadoEm: null }
    });
    if (ativas >= MAX_OS_ATIVAS) {
      return res.status(400).json({
        error: `Máximo de ${MAX_OS_ATIVAS} OS em atendimento simultâneo.`
      });
    }
  }

  const atendimento = await prisma.atendimentoOS.create({
    data: {
      numeroOS,
      responsavelId: funcId,
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
  await prisma.atendimentoOS.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

module.exports = router;
