const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const { requirePermissao } = require("../utils/permissions");
const { tarefaInclude, serializeTarefa } = require("../utils/tarefaSerializer");
const { findOrCreateSemana } = require("../utils/semana");
const { seedFuncionariosDemo, seedTarefasDemo } = require("../utils/seedDemo");

const router = express.Router();

router.use(requireAuth);

const dataValida = (value) => !Number.isNaN(new Date(value).getTime());

const funcionarioImportSchema = z.object({
  id: z.string().optional(),
  nome: z.string().trim().min(2),
  funcao: z.string().trim().min(2),
  email: z.string().trim().email(),
  capacidade: z.number().int().positive(),
  foto: z.string().nullable().optional(),
  ativo: z.boolean().optional()
});

const tarefaImportSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().trim().min(2),
  descricao: z.string().trim().nullable().optional(),
  responsavelId: z.string().min(1),
  apoioId: z.string().nullable().optional(),
  semana: z.string().regex(/^\d{4}-W\d{2}$/),
  prazo: z.string().refine(dataValida),
  tipo: z.enum(["ROTINEIRA", "EVENTUAL"]),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]).default("MEDIA"),
  periodoRotina: z.enum(["SEMANAL", "MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]).nullable().optional(),
  horasEstimadas: z.number().positive().max(168),
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"]).optional(),
  concluidaEm: z.string().nullable().optional()
});

const importSchema = z.object({
  funcionarios: z.array(z.unknown()).optional().default([]),
  tarefas: z.array(z.unknown()).optional().default([])
});

// Exporta uma copia completa dos dados do banco (funcionarios, tarefas e
// pedidos de ajuda), para backup ou migracao.
router.get("/exportar", requirePermissao("EXPORTAR_DADOS"), asyncHandler(async (req, res) => {
  const [funcionarios, tarefas] = await Promise.all([
    prisma.funcionario.findMany({ orderBy: { nome: "asc" } }),
    prisma.tarefa.findMany({ include: tarefaInclude, orderBy: { criadoEm: "asc" } })
  ]);

  res.json({
    exportadoEm: new Date().toISOString(),
    versao: 2,
    funcionarios,
    tarefas: tarefas.map(serializeTarefa)
  });
}));

// Importa funcionarios e tarefas, validando cada registro. Registros
// invalidos sao ignorados e reportados em "erros".
router.post("/importar", requirePermissao("IMPORTAR_DADOS"), asyncHandler(async (req, res) => {
  const parsed = importSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Formato de arquivo invalido." });
  }

  const { funcionarios, tarefas } = parsed.data;
  const erros = [];
  let funcionariosImportados = 0;
  let tarefasImportadas = 0;

  for (let i = 0; i < funcionarios.length; i += 1) {
    const result = funcionarioImportSchema.safeParse(funcionarios[i]);
    if (!result.success) {
      erros.push({ tipo: "funcionario", indice: i, mensagem: result.error.issues[0]?.message });
      continue;
    }

    const { id, ...data } = result.data;
    if (id) {
      await prisma.funcionario.upsert({ where: { id }, update: data, create: { id, ...data } });
    } else {
      await prisma.funcionario.create({ data });
    }
    funcionariosImportados += 1;
  }

  for (let i = 0; i < tarefas.length; i += 1) {
    const result = tarefaImportSchema.safeParse(tarefas[i]);
    if (!result.success) {
      erros.push({ tipo: "tarefa", indice: i, mensagem: result.error.issues[0]?.message });
      continue;
    }

    const { id, semana, concluidaEm, ...data } = result.data;

    const responsavel = await prisma.funcionario.findUnique({ where: { id: data.responsavelId } });
    if (!responsavel) {
      erros.push({ tipo: "tarefa", indice: i, mensagem: "Responsavel nao encontrado no banco." });
      continue;
    }

    const semanaRecord = await findOrCreateSemana(semana);
    const payload = {
      ...data,
      periodoRotina: data.tipo === "ROTINEIRA" ? data.periodoRotina : null,
      semanaId: semanaRecord?.id || null,
      prazo: new Date(data.prazo),
      status: data.status || "PENDENTE",
      concluidaEm: concluidaEm ? new Date(concluidaEm) : null
    };

    if (id) {
      await prisma.tarefa.upsert({ where: { id }, update: payload, create: { id, ...payload } });
    } else {
      await prisma.tarefa.create({ data: payload });
    }
    tarefasImportadas += 1;
  }

  res.json({ funcionariosImportados, tarefasImportadas, erros });
}));

// Restaura os dados de demonstracao: remove tarefas e funcionarios atuais
// e recria o conjunto inicial (apenas ADMIN). Usuarios de login nao sao
// removidos, apenas perdem o vinculo com o funcionario excluido.
router.post("/restaurar-demo", requirePermissao("RESTAURAR_DEMO"), asyncHandler(async (req, res) => {
  await prisma.tarefa.deleteMany();
  await prisma.funcionario.deleteMany();

  const pessoas = await seedFuncionariosDemo(prisma);
  await seedTarefasDemo(prisma, pessoas);

  res.json({ mensagem: "Dados de demonstracao restaurados." });
}));

module.exports = router;
