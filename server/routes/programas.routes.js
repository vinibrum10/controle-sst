const { z } = require("zod");

const prisma = require("../db");
const createCrudRouter = require("../utils/crudRouter");
const { dataField, dataOpcional } = require("../utils/zodHelpers");

const responsavelInclude = { responsavel: { select: { id: true, nome: true, email: true } } };

// ---------------------------------------------------------------------
// Treinamentos
// ---------------------------------------------------------------------
const treinamentoCreate = z.object({
  titulo: z.string().trim().min(2, "Informe o titulo do treinamento."),
  descricao: z.string().trim().nullable().optional(),
  norma: z.string().trim().nullable().optional(),
  cargaHoraria: z.number().int().positive("Carga horaria deve ser maior que zero.").nullable().optional(),
  dataRealizacao: dataOpcional(),
  validade: dataOpcional(),
  status: z.enum(["PLANEJADO", "REALIZADO", "CANCELADO", "VENCIDO"]).optional(),
  responsavelId: z.string().nullable().optional()
});

const treinamentos = createCrudRouter({
  model: prisma.treinamento,
  createSchema: treinamentoCreate,
  updateSchema: treinamentoCreate.partial(),
  include: responsavelInclude,
  orderBy: { criadoEm: "desc" },
  writeRoles: ["ADMIN", "GESTOR"]
});

// ---------------------------------------------------------------------
// Inspecoes
// ---------------------------------------------------------------------
const inspecaoCreate = z.object({
  titulo: z.string().trim().min(2, "Informe o titulo da inspecao."),
  area: z.string().trim().nullable().optional(),
  tipo: z.string().trim().nullable().optional(),
  dataPrevista: dataField("Informe a data prevista da inspecao."),
  dataRealizada: dataOpcional(),
  status: z.enum(["PLANEJADA", "REALIZADA", "CANCELADA"]).optional(),
  observacoes: z.string().trim().nullable().optional(),
  responsavelId: z.string().nullable().optional()
});

const inspecoes = createCrudRouter({
  model: prisma.inspecao,
  createSchema: inspecaoCreate,
  updateSchema: inspecaoCreate.partial(),
  include: { ...responsavelInclude, achados: true },
  orderBy: { dataPrevista: "asc" },
  writeRoles: ["ADMIN", "GESTOR"]
});

// ---------------------------------------------------------------------
// Auditorias
// ---------------------------------------------------------------------
const auditoriaCreate = z.object({
  titulo: z.string().trim().min(2, "Informe o titulo da auditoria."),
  escopo: z.string().trim().nullable().optional(),
  norma: z.string().trim().nullable().optional(),
  dataPrevista: dataField("Informe a data prevista da auditoria."),
  dataRealizada: dataOpcional(),
  status: z.enum(["PLANEJADA", "REALIZADA", "CANCELADA"]).optional(),
  observacoes: z.string().trim().nullable().optional(),
  responsavelId: z.string().nullable().optional()
});

const auditorias = createCrudRouter({
  model: prisma.auditoria,
  createSchema: auditoriaCreate,
  updateSchema: auditoriaCreate.partial(),
  include: { ...responsavelInclude, achados: true },
  orderBy: { dataPrevista: "asc" },
  writeRoles: ["ADMIN", "GESTOR"]
});

// ---------------------------------------------------------------------
// Achados / Desvios
// ---------------------------------------------------------------------
const achadoCreate = z.object({
  descricao: z.string().trim().min(2, "Descreva o achado/desvio."),
  tipo: z.enum(["NAO_CONFORMIDADE", "OBSERVACAO", "OPORTUNIDADE_MELHORIA"]).optional(),
  gravidade: z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]).optional(),
  status: z.enum(["ABERTO", "EM_TRATATIVA", "CONCLUIDO"]).optional(),
  inspecaoId: z.string().nullable().optional(),
  auditoriaId: z.string().nullable().optional(),
  rotaSeguraId: z.string().nullable().optional(),
  responsavelId: z.string().nullable().optional()
});

const achados = createCrudRouter({
  model: prisma.achado,
  createSchema: achadoCreate,
  updateSchema: achadoCreate.partial(),
  include: { ...responsavelInclude, planosAcao: true },
  orderBy: { identificadoEm: "desc" },
  writeRoles: ["ADMIN", "GESTOR"]
});

// ---------------------------------------------------------------------
// Planos de Acao
// ---------------------------------------------------------------------
const planoAcaoCreate = z.object({
  achadoId: z.string().min(1, "Selecione o achado relacionado."),
  descricao: z.string().trim().min(2, "Descreva o plano de acao."),
  responsavelId: z.string().nullable().optional(),
  prazo: dataField("Informe o prazo do plano de acao."),
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", "ATRASADO"]).optional()
});

const planosAcao = createCrudRouter({
  model: prisma.planoAcao,
  createSchema: planoAcaoCreate,
  updateSchema: planoAcaoCreate.partial(),
  include: { ...responsavelInclude, achado: true },
  orderBy: { prazo: "asc" },
  writeRoles: ["ADMIN", "GESTOR"]
});

// ---------------------------------------------------------------------
// Rotas Seguras
// ---------------------------------------------------------------------
const rotaSeguraCreate = z.object({
  nome: z.string().trim().min(2, "Informe o nome da rota."),
  descricao: z.string().trim().nullable().optional(),
  area: z.string().trim().nullable().optional(),
  frequencia: z.enum(["DIARIA", "SEMANAL", "QUINZENAL", "MENSAL"]).optional(),
  ultimaVerificacao: dataOpcional(),
  status: z.enum(["ATIVA", "INATIVA"]).optional(),
  responsavelId: z.string().nullable().optional()
});

const rotasSeguras = createCrudRouter({
  model: prisma.rotaSegura,
  createSchema: rotaSeguraCreate,
  updateSchema: rotaSeguraCreate.partial(),
  include: { ...responsavelInclude, achados: true },
  orderBy: { nome: "asc" },
  writeRoles: ["ADMIN", "GESTOR"]
});

// ---------------------------------------------------------------------
// Anexos / Evidencias
// ---------------------------------------------------------------------
const PARENTES_ANEXO = [
  "tarefaId", "treinamentoId", "inspecaoId", "auditoriaId", "achadoId", "planoAcaoId", "rotaSeguraId"
];

const anexoBase = z.object({
  nomeArquivo: z.string().trim().min(1, "Informe o nome do arquivo."),
  url: z.string().trim().min(1, "Informe a URL do arquivo."),
  tipoMime: z.string().trim().nullable().optional(),
  tamanho: z.number().int().nonnegative("Tamanho do arquivo invalido.").nullable().optional(),
  descricao: z.string().trim().nullable().optional(),
  criadoPorId: z.string().nullable().optional(),
  tarefaId: z.string().nullable().optional(),
  treinamentoId: z.string().nullable().optional(),
  inspecaoId: z.string().nullable().optional(),
  auditoriaId: z.string().nullable().optional(),
  achadoId: z.string().nullable().optional(),
  planoAcaoId: z.string().nullable().optional(),
  rotaSeguraId: z.string().nullable().optional()
});

const anexoCreate = anexoBase.refine((data) => PARENTES_ANEXO.some((campo) => data[campo]), {
  message: "Vincule o anexo a um registro (tarefa, treinamento, inspecao, auditoria, achado, plano de acao ou rota segura).",
  path: ["tarefaId"]
});

const anexos = createCrudRouter({
  model: prisma.anexo,
  createSchema: anexoCreate,
  updateSchema: anexoBase.partial(),
  include: { criadoPor: { select: { id: true, nome: true } } },
  orderBy: { criadoEm: "desc" },
  writeRoles: ["ADMIN", "GESTOR"]
});

module.exports = { treinamentos, inspecoes, auditorias, achados, planosAcao, rotasSeguras, anexos };
