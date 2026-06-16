const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const iniciarSchema = z.object({
  numeroOS: z.string().trim().min(1, "Informe o número da OS."),
  responsavelId: z.string().optional().nullable()
});

router.get("/", asyncHandler(async (req, res) => {
  const { data, responsavelId } = req.query;
  const where = {};
  if (data) {
    const inicio = new Date(`${data}T00:00:00`);
    const fim = new Date(`${data}T23:59:59`);
    where.iniciadoEm = { gte: inicio, lte: fim };
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
  const { numeroOS, responsavelId } = req.body;
  const atendimento = await prisma.atendimentoOS.create({
    data: {
      numeroOS,
      responsavelId: responsavelId || null,
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
  const duracaoSegundos = Math.round((finalizadoEm.getTime() - existente.iniciadoEm.getTime()) / 1000);

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
