const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { findOrCreateSemana } = require("../utils/semana");
const { tarefaInclude: include, serializeTarefa } = require("../utils/tarefaSerializer");
const { enviarNotificacaoTarefaAtribuida } = require("../utils/notificacoes");
const { notificarTarefaAtribuida } = require("../utils/notificacoesInApp");

const router = express.Router();

const dataValida = (value) => !Number.isNaN(new Date(value).getTime());

const tarefaSchema = z.object({
  titulo: z.string().trim().min(2, "Informe o titulo da tarefa."),
  descricao: z.string().trim().optional().nullable(),
  responsavelId: z.string().min(1, "Selecione um responsavel."),
  apoioId: z.string().nullable().optional(),
  semana: z.string().regex(/^\d{4}-W\d{2}$/, "Informe a semana no formato AAAA-Www."),
  prazo: z.string().refine(dataValida, "Informe uma data de prazo valida."),
  tipo: z.enum(["ROTINEIRA", "EVENTUAL"]),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]).default("MEDIA"),
  periodoRotina: z.enum(["SEMANAL", "MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]).nullable().optional(),
  horasEstimadas: z.number({ invalid_type_error: "Informe as horas estimadas." })
    .positive("Horas estimadas devem ser maiores que zero.")
    .max(168, "Horas estimadas nao podem ultrapassar 168h (1 semana)."),
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"]).optional()
}).refine((data) => data.tipo !== "ROTINEIRA" || Boolean(data.periodoRotina), {
  message: "Informe o periodo da rotina para tarefas rotineiras.",
  path: ["periodoRotina"]
});

const tarefaUpdateSchema = z.object({
  titulo: z.string().trim().min(2).optional(),
  descricao: z.string().trim().nullable().optional(),
  responsavelId: z.string().min(1).optional(),
  apoioId: z.string().nullable().optional(),
  semana: z.string().regex(/^\d{4}-W\d{2}$/).optional(),
  prazo: z.string().refine(dataValida, "Informe uma data de prazo valida.").optional(),
  tipo: z.enum(["ROTINEIRA", "EVENTUAL"]).optional(),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]).optional(),
  periodoRotina: z.enum(["SEMANAL", "MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]).nullable().optional(),
  horasEstimadas: z.number().positive("Horas estimadas devem ser maiores que zero.").max(168).optional(),
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"]).optional()
});

const statusSchema = z.object({
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"])
});

router.use(requireAuth);

// Lista tarefas, com filtros opcionais por semana, responsavel, tipo e status.
router.get("/", asyncHandler(async (req, res) => {
  const { semana, responsavelId, tipo, status } = req.query;

  const where = {};
  if (semana) where.semana = { codigo: semana };
  if (responsavelId) where.OR = [{ responsavelId }, { apoioId: responsavelId }];
  if (tipo) where.tipo = tipo;
  if (status) where.status = status;

  const tarefas = await prisma.tarefa.findMany({
    where,
    include,
    orderBy: [{ prazo: "asc" }, { criadoEm: "desc" }]
  });

  res.json(tarefas.map(serializeTarefa));
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const tarefa = await prisma.tarefa.findUnique({ where: { id: req.params.id }, include });
  if (!tarefa) return res.status(404).json({ error: "Tarefa nao encontrada." });
  res.json(serializeTarefa(tarefa));
}));

router.post("/", validateBody(tarefaSchema), asyncHandler(async (req, res) => {
  const { semana, ...body } = req.body;

  const responsavel = await prisma.funcionario.findUnique({ where: { id: body.responsavelId } });
  if (!responsavel) return res.status(400).json({ error: "Responsavel nao encontrado." });
  if (!responsavel.ativo) return res.status(400).json({ error: "Escolha um funcionario ativo para receber a tarefa." });

  const semanaRecord = await findOrCreateSemana(semana);

  const tarefa = await prisma.tarefa.create({
    data: {
      ...body,
      periodoRotina: body.tipo === "ROTINEIRA" ? body.periodoRotina : null,
      semanaId: semanaRecord?.id || null,
      prazo: new Date(body.prazo),
      status: body.status || "PENDENTE"
    },
    include
  });

  const resultadoNotificacao = await notificarTarefaAtribuida(tarefa);
  const notificacaoEmail = resultadoNotificacao && !resultadoNotificacao.preferencia.email
    ? { enviado: false, motivo: "Notificações por e-mail desativadas pelo usuário." }
    : await enviarNotificacaoTarefaAtribuida(tarefa);

  res.status(201).json({ ...serializeTarefa(tarefa), notificacaoEmail });
}));

router.put("/:id", validateBody(tarefaUpdateSchema), asyncHandler(async (req, res) => {
  const existente = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Tarefa nao encontrada." });

  const { semana, ...body } = req.body;
  const data = { ...body };

  if (body.responsavelId) {
    const responsavel = await prisma.funcionario.findUnique({ where: { id: body.responsavelId } });
    if (!responsavel) return res.status(400).json({ error: "Responsavel nao encontrado." });
  }

  if (semana) {
    const semanaRecord = await findOrCreateSemana(semana);
    data.semanaId = semanaRecord?.id || null;
  }

  if (body.prazo) data.prazo = new Date(body.prazo);

  const tipoFinal = body.tipo || existente.tipo;
  if (tipoFinal !== "ROTINEIRA") {
    data.periodoRotina = null;
  }

  if (body.status === "CONCLUIDA" && existente.status !== "CONCLUIDA") {
    data.concluidaEm = new Date();
  } else if (body.status && body.status !== "CONCLUIDA") {
    data.concluidaEm = null;
  }

  const tarefa = await prisma.tarefa.update({ where: { id: req.params.id }, data, include });

  if (body.responsavelId && body.responsavelId !== existente.responsavelId) {
    await notificarTarefaAtribuida(tarefa);
  }

  res.json(serializeTarefa(tarefa));
}));

// Atualiza apenas o status (usado pelo Kanban ao mover um card entre colunas).
router.patch("/:id/status", validateBody(statusSchema), asyncHandler(async (req, res) => {
  const existente = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Tarefa nao encontrada." });

  const { status } = req.body;
  const data = {
    status,
    concluidaEm: status === "CONCLUIDA" ? new Date() : null
  };

  const tarefa = await prisma.tarefa.update({ where: { id: req.params.id }, data, include });
  res.json(serializeTarefa(tarefa));
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const existente = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Tarefa nao encontrada." });

  await prisma.tarefa.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

module.exports = router;
