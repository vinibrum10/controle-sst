const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const createCrudRouter = require("../utils/crudRouter");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { requirePermissao } = require("../utils/permissions");
const { dataField, dataOpcional } = require("../utils/zodHelpers");
const { MES_REFERENCIA_REGEX, calcularPontuacaoApr, calcularPontosPenalidade } = require("../utils/rotaSegura2026");

const AREAS_EQUIPE = ["LINHAS_LIMPEZA_FAIXA", "EAT", "PCC", "UFV", "OUTRO"];
const TIPOS_CRITERIO = ["PROATIVO", "REATIVO"];
const CATEGORIAS_CRITERIO = ["APR", "VIDEO", "INSPECAO", "DDS", "TREINAMENTO", "TRANSITO", "COMPORTAMENTO", "PENALIDADE", "OUTRO"];
const TIPOS_CONDICAO = ["REQUER_CRITERIO_APROVADO", "BLOQUEADO_PARA_TIPO_APR", "LIMITE_MENSAL_POR_EQUIPE"];

// ---------------------------------------------------------------------
// Helper: roteador REST simples para tabelas de configuracao filtradas por
// edicao (?edicaoId=...). Leitura liberada para qualquer usuario
// autenticado; escrita restrita ao(s) papel(eis) informados.
// ---------------------------------------------------------------------
function createEdicaoScopedRouter({ model, createSchema, updateSchema, orderBy, writePermissao = "CONFIGURAR_ROTA_SEGURA" }) {
  const router = express.Router();
  router.use(requireAuth);

  const requireWriteAccess = requirePermissao(writePermissao);

  router.get("/", asyncHandler(async (req, res) => {
    const where = req.query.edicaoId ? { edicaoId: String(req.query.edicaoId) } : {};
    const items = await model.findMany({ where, orderBy });
    res.json(items);
  }));

  router.get("/:id", asyncHandler(async (req, res) => {
    const item = await model.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Registro nao encontrado." });
    res.json(item);
  }));

  router.post("/", requireWriteAccess, validateBody(createSchema), asyncHandler(async (req, res) => {
    const item = await model.create({ data: req.body });
    res.status(201).json(item);
  }));

  const atualizar = asyncHandler(async (req, res) => {
    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Registro nao encontrado." });
    const item = await model.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  });

  router.put("/:id", requireWriteAccess, validateBody(updateSchema), atualizar);
  router.patch("/:id", requireWriteAccess, validateBody(updateSchema), atualizar);

  router.delete("/:id", requireWriteAccess, asyncHandler(async (req, res) => {
    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Registro nao encontrado." });
    await model.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}

// ---------------------------------------------------------------------
// Edicoes do programa (Rota Segura 2026, 2027, ...)
// ---------------------------------------------------------------------
const edicaoCreate = z.object({
  nome: z.string().trim().min(2, "Informe o nome da edicao."),
  ano: z.number().int().min(2000).max(2100),
  slogan: z.string().trim().nullable().optional(),
  objetivo: z.string().trim().nullable().optional(),
  descricao: z.string().trim().nullable().optional(),
  dataInicio: dataOpcional(),
  dataFim: dataOpcional(),
  ativo: z.boolean().optional(),
  observacoes: z.string().trim().nullable().optional()
});

const edicaoInclude = {
  proposta: true,
  _count: { select: { criterios: true, regras: true, premiacoes: true, avaliacoes: true, penalidades: true } }
};

const edicoes = createCrudRouter({
  model: prisma.rsEdicaoPrograma,
  createSchema: edicaoCreate,
  updateSchema: edicaoCreate.partial(),
  include: edicaoInclude,
  orderBy: { ano: "desc" },
  writePermissao: "CONFIGURAR_ROTA_SEGURA"
});

const clonarEdicaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da nova edicao."),
  ano: z.number().int().min(2000).max(2100)
});

// Clona proposta, criterios, regras condicionais e premiacao de uma edicao
// para uma nova edicao. NAO copia avaliacoes, penalidades, pontuacao
// lancada nem historico do comite.
edicoes.post("/:id/clonar", requirePermissao("CONFIGURAR_ROTA_SEGURA"), validateBody(clonarEdicaoSchema), asyncHandler(async (req, res) => {
  const origem = await prisma.rsEdicaoPrograma.findUnique({
    where: { id: req.params.id },
    include: { proposta: true, criterios: true, regras: true, premiacoes: true }
  });
  if (!origem) return res.status(404).json({ error: "Edicao nao encontrada." });

  const nova = await prisma.$transaction(async (tx) => {
    const edicao = await tx.rsEdicaoPrograma.create({
      data: {
        nome: req.body.nome,
        ano: req.body.ano,
        slogan: origem.slogan,
        objetivo: origem.objetivo,
        descricao: origem.descricao,
        ativo: false,
        observacoes: origem.observacoes
      }
    });

    if (origem.proposta) {
      const { id, edicaoId, criadoEm, atualizadoEm, ...dadosProposta } = origem.proposta;
      await tx.rsProposta.create({ data: { ...dadosProposta, edicaoId: edicao.id } });
    }

    const mapaCriterios = {};
    for (const criterio of origem.criterios) {
      const { id, edicaoId, criadoEm, atualizadoEm, ...dadosCriterio } = criterio;
      const novoCriterio = await tx.rsCriterio.create({ data: { ...dadosCriterio, edicaoId: edicao.id } });
      mapaCriterios[id] = novoCriterio.id;
    }

    for (const regra of origem.regras) {
      const { id, edicaoId, criterioId, criterioDependenteId, criadoEm, atualizadoEm, ...dadosRegra } = regra;
      await tx.rsRegraCondicional.create({
        data: {
          ...dadosRegra,
          edicaoId: edicao.id,
          criterioId: mapaCriterios[criterioId],
          criterioDependenteId: criterioDependenteId ? mapaCriterios[criterioDependenteId] ?? null : null
        }
      });
    }

    for (const premiacao of origem.premiacoes) {
      const { id, edicaoId, criadoEm, atualizadoEm, ...dadosPremiacao } = premiacao;
      await tx.rsPremiacao.create({ data: { ...dadosPremiacao, edicaoId: edicao.id } });
    }

    return tx.rsEdicaoPrograma.findUnique({ where: { id: edicao.id }, include: edicaoInclude });
  });

  res.status(201).json(nova);
}));

// ---------------------------------------------------------------------
// Proposta da edicao (1:1)
// ---------------------------------------------------------------------
const propostaUpsert = z.object({
  titulo: z.string().trim().nullable().optional(),
  slogan: z.string().trim().nullable().optional(),
  mensagemAbertura: z.string().trim().nullable().optional(),
  objetivoGeral: z.string().trim().nullable().optional(),
  justificativa: z.string().trim().nullable().optional(),
  publicoAlvo: z.string().trim().nullable().optional(),
  areasParticipantes: z.string().trim().nullable().optional(),
  regrasGerais: z.string().trim().nullable().optional(),
  criteriosAvaliacao: z.string().trim().nullable().optional(),
  estruturaComite: z.string().trim().nullable().optional(),
  regraPremiacao: z.string().trim().nullable().optional(),
  premios: z.string().trim().nullable().optional(),
  cronograma: z.string().trim().nullable().optional(),
  observacoes: z.string().trim().nullable().optional()
});

const propostas = express.Router();
propostas.use(requireAuth);

propostas.get("/:edicaoId", asyncHandler(async (req, res) => {
  const proposta = await prisma.rsProposta.findUnique({ where: { edicaoId: req.params.edicaoId } });
  if (!proposta) return res.status(404).json({ error: "Proposta nao encontrada para esta edicao." });
  res.json(proposta);
}));

const salvarProposta = asyncHandler(async (req, res) => {
  const edicao = await prisma.rsEdicaoPrograma.findUnique({ where: { id: req.params.edicaoId } });
  if (!edicao) return res.status(404).json({ error: "Edicao nao encontrada." });

  const proposta = await prisma.rsProposta.upsert({
    where: { edicaoId: req.params.edicaoId },
    update: req.body,
    create: { ...req.body, edicaoId: req.params.edicaoId }
  });
  res.json(proposta);
});

propostas.put("/:edicaoId", requirePermissao("CONFIGURAR_ROTA_SEGURA"), validateBody(propostaUpsert), salvarProposta);
propostas.patch("/:edicaoId", requirePermissao("CONFIGURAR_ROTA_SEGURA"), validateBody(propostaUpsert), salvarProposta);

// ---------------------------------------------------------------------
// Criterios de pontuacao
// ---------------------------------------------------------------------
const criterioCreate = z.object({
  edicaoId: z.string().min(1, "Informe a edicao."),
  codigo: z.string().trim().nullable().optional(),
  nome: z.string().trim().min(2, "Informe o nome do criterio."),
  descricao: z.string().trim().nullable().optional(),
  tipo: z.enum(TIPOS_CRITERIO),
  pontuacao: z.number().int(),
  categoria: z.enum(CATEGORIAS_CRITERIO).optional(),
  exigeComite: z.boolean().optional(),
  exigeEvidencia: z.boolean().optional(),
  aplicaAmostral: z.boolean().optional(),
  aplicaForms: z.boolean().optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().optional()
});

const criterios = createEdicaoScopedRouter({
  model: prisma.rsCriterio,
  createSchema: criterioCreate,
  updateSchema: criterioCreate.partial(),
  orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
  writePermissao: "CONFIGURAR_ROTA_SEGURA"
});

// ---------------------------------------------------------------------
// Regras condicionais entre criterios
// ---------------------------------------------------------------------
const regraCreate = z.object({
  edicaoId: z.string().min(1, "Informe a edicao."),
  criterioId: z.string().min(1, "Selecione o criterio."),
  criterioDependenteId: z.string().nullable().optional(),
  tipoCondicao: z.enum(TIPOS_CONDICAO),
  parametros: z.record(z.unknown()).nullable().optional(),
  descricao: z.string().trim().nullable().optional(),
  ativo: z.boolean().optional()
});

const regras = createEdicaoScopedRouter({
  model: prisma.rsRegraCondicional,
  createSchema: regraCreate,
  updateSchema: regraCreate.partial(),
  orderBy: { criadoEm: "asc" },
  writePermissao: "CONFIGURAR_ROTA_SEGURA"
});

// ---------------------------------------------------------------------
// Premiacao por area/especialidade
// ---------------------------------------------------------------------
const premiacaoCreate = z.object({
  edicaoId: z.string().min(1, "Informe a edicao."),
  area: z.enum(AREAS_EQUIPE),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero."),
  posicaoInicial: z.number().int().positive("Posicao inicial deve ser maior que zero."),
  posicaoFinal: z.number().int().positive("Posicao final deve ser maior que zero."),
  descricaoPremio: z.string().trim().min(2, "Descreva o premio."),
  observacoes: z.string().trim().nullable().optional()
});

const premiacoes = createEdicaoScopedRouter({
  model: prisma.rsPremiacao,
  createSchema: premiacaoCreate,
  updateSchema: premiacaoCreate.partial(),
  orderBy: [{ area: "asc" }, { posicaoInicial: "asc" }],
  writePermissao: "CONFIGURAR_ROTA_SEGURA"
});

// ---------------------------------------------------------------------
// Equipes e colaboradores
// ---------------------------------------------------------------------
const equipeCreate = z.object({
  nome: z.string().trim().min(2, "Informe o nome da equipe."),
  area: z.enum(AREAS_EQUIPE).optional(),
  supervisor: z.string().trim().nullable().optional(),
  tst: z.string().trim().nullable().optional(),
  ativo: z.boolean().optional(),
  observacoes: z.string().trim().nullable().optional()
});

const equipes = createCrudRouter({
  model: prisma.rsEquipe,
  createSchema: equipeCreate,
  updateSchema: equipeCreate.partial(),
  include: { colaboradores: { select: { id: true, nome: true, ativo: true } } },
  orderBy: { nome: "asc" },
  writePermissao: "GERENCIAR_EQUIPES_ROTA_SEGURA"
});

const colaboradorCreate = z.object({
  nome: z.string().trim().min(2, "Informe o nome do colaborador."),
  matricula: z.string().trim().nullable().optional(),
  funcao: z.string().trim().nullable().optional(),
  equipeId: z.string().nullable().optional(),
  ativo: z.boolean().optional()
});

const colaboradores = createCrudRouter({
  model: prisma.rsColaborador,
  createSchema: colaboradorCreate,
  updateSchema: colaboradorCreate.partial(),
  include: { equipe: { select: { id: true, nome: true, area: true } } },
  orderBy: { nome: "asc" },
  writePermissao: "GERENCIAR_EQUIPES_ROTA_SEGURA"
});

// ---------------------------------------------------------------------
// Avaliacoes de APR
// ---------------------------------------------------------------------
const aprAvaliacaoBase = z.object({
  edicaoId: z.string().min(1, "Selecione a edicao do programa."),
  mesReferencia: z.string().regex(MES_REFERENCIA_REGEX, "Mes de referencia deve estar no formato AAAA-MM."),
  dataAvaliacao: dataField("Informe a data da avaliacao."),
  equipeId: z.string().min(1, "Selecione a equipe."),
  tipo: z.enum(["AMOSTRAL", "FORMS"]),
  numeroOs: z.string().trim().nullable().optional(),
  numeroApr: z.string().trim().nullable().optional(),
  atividade: z.string().trim().nullable().optional(),
  local: z.string().trim().nullable().optional(),
  avaliador: z.string().trim().nullable().optional(),
  observacoes: z.string().trim().nullable().optional(),
  cabecalhoOk: z.boolean().optional(),
  enderecoOk: z.boolean().optional(),
  assinaturasOk: z.boolean().optional(),
  riscosMinimosOk: z.boolean().optional(),
  medidasMinimasOk: z.boolean().optional(),
  coerenciaOk: z.boolean().optional(),
  arquivadaEam: z.boolean().optional(),
  legivel: z.boolean().optional(),
  aprovacaoBasica: z.boolean().optional(),
  riscosAdicionais: z.boolean().optional(),
  riscosAdicionaisDescricao: z.string().trim().nullable().optional(),
  medidasAdicionais: z.boolean().optional(),
  medidasAdicionaisDescricao: z.string().trim().nullable().optional()
});

const aprAvaliacaoUpdate = aprAvaliacaoBase.partial();

const avaliacaoInclude = {
  equipe: { select: { id: true, nome: true, area: true, supervisor: true, tst: true } },
  edicao: { select: { id: true, nome: true, ano: true } },
  decisoesComite: { orderBy: { dataDecisao: "desc" } }
};

const avaliacoes = express.Router();
avaliacoes.use(requireAuth);

avaliacoes.get("/", asyncHandler(async (req, res) => {
  const { edicaoId, equipeId, mes, tipo } = req.query;
  const where = {};
  if (edicaoId) where.edicaoId = String(edicaoId);
  if (equipeId) where.equipeId = String(equipeId);
  if (mes) where.mesReferencia = String(mes);
  if (tipo) where.tipo = String(tipo);

  const items = await prisma.rsAprAvaliacao.findMany({
    where,
    include: avaliacaoInclude,
    orderBy: [{ mesReferencia: "desc" }, { criadoEm: "desc" }]
  });
  res.json(items);
}));

avaliacoes.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.rsAprAvaliacao.findUnique({ where: { id: req.params.id }, include: avaliacaoInclude });
  if (!item) return res.status(404).json({ error: "Avaliacao nao encontrada." });
  res.json(item);
}));

avaliacoes.post("/", requirePermissao("LANCAR_AVALIACAO_ROTA_SEGURA"), validateBody(aprAvaliacaoBase), asyncHandler(async (req, res) => {
  const edicao = await prisma.rsEdicaoPrograma.findUnique({ where: { id: req.body.edicaoId } });
  if (!edicao) return res.status(400).json({ error: "Edicao do programa nao encontrada." });

  const [criterios, regras] = await Promise.all([
    prisma.rsCriterio.findMany({ where: { edicaoId: edicao.id } }),
    prisma.rsRegraCondicional.findMany({ where: { edicaoId: edicao.id } })
  ]);

  const dados = { ...req.body };
  const { total } = calcularPontuacaoApr(dados, criterios, regras);

  const item = await prisma.rsAprAvaliacao.create({ data: { ...dados, pontuacao: total }, include: avaliacaoInclude });
  res.status(201).json(item);
}));

const atualizarAvaliacao = asyncHandler(async (req, res) => {
  const existing = await prisma.rsAprAvaliacao.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Avaliacao nao encontrada." });

  if (existing.tipo === "AMOSTRAL" && req.user.papel !== "ADMIN") {
    return res.status(403).json({ error: "Apenas o administrador pode editar uma avaliacao de APR amostral ja registrada." });
  }

  const edicaoId = req.body.edicaoId || existing.edicaoId;
  const merged = { ...existing, ...req.body };

  const [criterios, regras] = await Promise.all([
    prisma.rsCriterio.findMany({ where: { edicaoId } }),
    prisma.rsRegraCondicional.findMany({ where: { edicaoId } })
  ]);

  const { total } = calcularPontuacaoApr(merged, criterios, regras);

  const item = await prisma.rsAprAvaliacao.update({
    where: { id: req.params.id },
    data: { ...req.body, pontuacao: total },
    include: avaliacaoInclude
  });
  res.json(item);
});

avaliacoes.put("/:id", requirePermissao("LANCAR_AVALIACAO_ROTA_SEGURA"), validateBody(aprAvaliacaoUpdate), atualizarAvaliacao);
avaliacoes.patch("/:id", requirePermissao("LANCAR_AVALIACAO_ROTA_SEGURA"), validateBody(aprAvaliacaoUpdate), atualizarAvaliacao);

avaliacoes.delete("/:id", requirePermissao("EXCLUIR_AVALIACAO_ROTA_SEGURA"), asyncHandler(async (req, res) => {
  const existing = await prisma.rsAprAvaliacao.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Avaliacao nao encontrada." });
  await prisma.rsAprAvaliacao.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// ---------------------------------------------------------------------
// Comite de avaliacao (riscos/medidas adicionais)
// ---------------------------------------------------------------------
const comite = express.Router();
comite.use(requireAuth);

comite.get("/pendentes", asyncHandler(async (req, res) => {
  const { edicaoId } = req.query;
  const where = {
    OR: [
      { riscosAdicionais: true, riscosAdicionaisComite: "PENDENTE" },
      { medidasAdicionais: true, medidasAdicionaisComite: "PENDENTE" }
    ]
  };
  if (edicaoId) where.edicaoId = String(edicaoId);

  const items = await prisma.rsAprAvaliacao.findMany({ where, include: avaliacaoInclude, orderBy: { dataAvaliacao: "asc" } });
  res.json(items);
}));

const decisaoComiteSchema = z.object({
  tipo: z.enum(["RISCOS_ADICIONAIS", "MEDIDAS_ADICIONAIS"]),
  decisao: z.enum(["APROVADO", "REPROVADO"]),
  responsavel: z.string().trim().nullable().optional(),
  observacoes: z.string().trim().nullable().optional()
});

comite.post("/:avaliacaoId/decisao", requirePermissao("DECIDIR_COMITE_ROTA_SEGURA"), validateBody(decisaoComiteSchema), asyncHandler(async (req, res) => {
  const avaliacao = await prisma.rsAprAvaliacao.findUnique({ where: { id: req.params.avaliacaoId } });
  if (!avaliacao) return res.status(404).json({ error: "Avaliacao nao encontrada." });

  const campoComite = req.body.tipo === "RISCOS_ADICIONAIS" ? "riscosAdicionaisComite" : "medidasAdicionaisComite";

  await prisma.rsComiteDecisao.create({
    data: {
      avaliacaoId: avaliacao.id,
      tipo: req.body.tipo,
      decisao: req.body.decisao,
      responsavel: req.body.responsavel,
      observacoes: req.body.observacoes
    }
  });

  const avaliacaoAtualizada = { ...avaliacao, [campoComite]: req.body.decisao };

  const [criterios, regras] = await Promise.all([
    prisma.rsCriterio.findMany({ where: { edicaoId: avaliacao.edicaoId } }),
    prisma.rsRegraCondicional.findMany({ where: { edicaoId: avaliacao.edicaoId } })
  ]);

  const { total } = calcularPontuacaoApr(avaliacaoAtualizada, criterios, regras);

  const item = await prisma.rsAprAvaliacao.update({
    where: { id: avaliacao.id },
    data: { [campoComite]: req.body.decisao, pontuacao: total },
    include: avaliacaoInclude
  });

  res.json(item);
}));

// ---------------------------------------------------------------------
// Penalidades
// ---------------------------------------------------------------------
const penalidadeBase = z.object({
  edicaoId: z.string().min(1, "Selecione a edicao do programa."),
  mesReferencia: z.string().regex(MES_REFERENCIA_REGEX, "Mes de referencia deve estar no formato AAAA-MM."),
  equipeId: z.string().min(1, "Selecione a equipe."),
  colaboradorId: z.string().nullable().optional(),
  tipo: z.enum(["LEVE", "GRAVE", "GRAVISSIMA"]),
  descricao: z.string().trim().min(2, "Descreva a penalidade."),
  dataOcorrencia: dataField("Informe a data da ocorrencia."),
  responsavel: z.string().trim().nullable().optional(),
  observacoes: z.string().trim().nullable().optional()
});

const penalidadeUpdate = penalidadeBase.partial();

const penalidadeInclude = {
  equipe: { select: { id: true, nome: true, area: true } },
  colaborador: { select: { id: true, nome: true } },
  edicao: { select: { id: true, nome: true, ano: true } }
};

const penalidades = express.Router();
penalidades.use(requireAuth);

penalidades.get("/", asyncHandler(async (req, res) => {
  const { edicaoId, equipeId, mes } = req.query;
  const where = {};
  if (edicaoId) where.edicaoId = String(edicaoId);
  if (equipeId) where.equipeId = String(equipeId);
  if (mes) where.mesReferencia = String(mes);

  const items = await prisma.rsPenalidade.findMany({ where, include: penalidadeInclude, orderBy: { dataOcorrencia: "desc" } });
  res.json(items);
}));

penalidades.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.rsPenalidade.findUnique({ where: { id: req.params.id }, include: penalidadeInclude });
  if (!item) return res.status(404).json({ error: "Penalidade nao encontrada." });
  res.json(item);
}));

penalidades.post("/", requirePermissao("LANCAR_AVALIACAO_ROTA_SEGURA"), validateBody(penalidadeBase), asyncHandler(async (req, res) => {
  const criterios = await prisma.rsCriterio.findMany({ where: { edicaoId: req.body.edicaoId } });
  const pontos = calcularPontosPenalidade(req.body.tipo, criterios);

  const item = await prisma.rsPenalidade.create({ data: { ...req.body, pontos }, include: penalidadeInclude });
  res.status(201).json(item);
}));

const atualizarPenalidade = asyncHandler(async (req, res) => {
  const existing = await prisma.rsPenalidade.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Penalidade nao encontrada." });

  const dados = { ...req.body };
  if (dados.tipo) {
    const edicaoId = dados.edicaoId || existing.edicaoId;
    const criterios = await prisma.rsCriterio.findMany({ where: { edicaoId } });
    dados.pontos = calcularPontosPenalidade(dados.tipo, criterios);
  }

  const item = await prisma.rsPenalidade.update({ where: { id: req.params.id }, data: dados, include: penalidadeInclude });
  res.json(item);
});

penalidades.put("/:id", requirePermissao("LANCAR_AVALIACAO_ROTA_SEGURA"), validateBody(penalidadeUpdate), atualizarPenalidade);
penalidades.patch("/:id", requirePermissao("LANCAR_AVALIACAO_ROTA_SEGURA"), validateBody(penalidadeUpdate), atualizarPenalidade);

penalidades.delete("/:id", requirePermissao("EXCLUIR_AVALIACAO_ROTA_SEGURA"), asyncHandler(async (req, res) => {
  const existing = await prisma.rsPenalidade.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Penalidade nao encontrada." });
  await prisma.rsPenalidade.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// ---------------------------------------------------------------------
// Helpers compartilhados: resolver edicao e calcular ranking
// ---------------------------------------------------------------------
async function resolverEdicao(edicaoId) {
  if (edicaoId) {
    return prisma.rsEdicaoPrograma.findUnique({ where: { id: String(edicaoId) } });
  }
  return prisma.rsEdicaoPrograma.findFirst({ where: { ativo: true }, orderBy: { ano: "desc" } });
}

function criaFiltroPeriodo({ mes, ano }) {
  return (mesReferencia) => {
    if (mes) return mesReferencia === String(mes);
    if (ano) return mesReferencia.startsWith(String(ano));
    return true;
  };
}

async function montarRanking({ edicaoId, mes, ano, area, supervisor, tst }) {
  const equipeWhere = {};
  if (area) equipeWhere.area = String(area);
  if (supervisor) equipeWhere.supervisor = { contains: String(supervisor), mode: "insensitive" };
  if (tst) equipeWhere.tst = { contains: String(tst), mode: "insensitive" };

  const equipes = await prisma.rsEquipe.findMany({
    where: equipeWhere,
    include: {
      avaliacoes: { where: { edicaoId } },
      penalidades: { where: { edicaoId } }
    },
    orderBy: { nome: "asc" }
  });

  const noPeriodo = criaFiltroPeriodo({ mes, ano });

  const linhas = equipes.map((equipe) => {
    const avaliacoes = equipe.avaliacoes.filter((item) => noPeriodo(item.mesReferencia));
    const penalidades = equipe.penalidades.filter((item) => noPeriodo(item.mesReferencia));

    const pontuacaoApr = avaliacoes.reduce((soma, item) => soma + item.pontuacao, 0);
    const pontosPenalidades = penalidades.reduce((soma, item) => soma + item.pontos, 0);

    return {
      equipeId: equipe.id,
      equipe: equipe.nome,
      area: equipe.area,
      supervisor: equipe.supervisor,
      tst: equipe.tst,
      pontuacaoApr,
      pontosPenalidades,
      total: pontuacaoApr + pontosPenalidades,
      qtdAvaliacoes: avaliacoes.length,
      qtdPenalidades: penalidades.length
    };
  });

  linhas.sort((a, b) => b.total - a.total || a.equipe.localeCompare(b.equipe, "pt-BR"));

  return linhas.map((linha, index) => ({ posicao: index + 1, ...linha }));
}

// ---------------------------------------------------------------------
// Ranking (mensal/acumulado, filtros por edicao/mes/ano/area/supervisor/tst)
// ---------------------------------------------------------------------
const ranking = express.Router();
ranking.use(requireAuth);

ranking.get("/", asyncHandler(async (req, res) => {
  const { edicaoId, mes, ano, area, supervisor, tst } = req.query;

  const edicao = await resolverEdicao(edicaoId);
  if (!edicao) return res.json({ edicao: null, ranking: [] });

  const linhas = await montarRanking({ edicaoId: edicao.id, mes, ano, area, supervisor, tst });

  res.json({ edicao: { id: edicao.id, nome: edicao.nome, ano: edicao.ano }, ranking: linhas });
}));

// ---------------------------------------------------------------------
// Dashboard (KPIs da edicao ativa)
// ---------------------------------------------------------------------
const dashboard = express.Router();
dashboard.use(requireAuth);

dashboard.get("/", asyncHandler(async (req, res) => {
  const edicao = await resolverEdicao(req.query.edicaoId);

  if (!edicao) {
    return res.json({
      edicao: null,
      totalEquipes: 0,
      totalColaboradores: 0,
      avaliacoesMes: 0,
      penalidadesMes: 0,
      pendentesComite: 0,
      topRanking: []
    });
  }

  const mesAtual = new Date().toISOString().slice(0, 7);

  const [totalEquipes, totalColaboradores, avaliacoesMes, penalidadesMes, pendentesComite, topRanking] = await Promise.all([
    prisma.rsEquipe.count({ where: { ativo: true } }),
    prisma.rsColaborador.count({ where: { ativo: true } }),
    prisma.rsAprAvaliacao.count({ where: { edicaoId: edicao.id, mesReferencia: mesAtual } }),
    prisma.rsPenalidade.count({ where: { edicaoId: edicao.id, mesReferencia: mesAtual } }),
    prisma.rsAprAvaliacao.count({
      where: {
        edicaoId: edicao.id,
        OR: [
          { riscosAdicionais: true, riscosAdicionaisComite: "PENDENTE" },
          { medidasAdicionais: true, medidasAdicionaisComite: "PENDENTE" }
        ]
      }
    }),
    montarRanking({ edicaoId: edicao.id })
  ]);

  res.json({
    edicao: { id: edicao.id, nome: edicao.nome, ano: edicao.ano, slogan: edicao.slogan },
    mesAtual,
    totalEquipes,
    totalColaboradores,
    avaliacoesMes,
    penalidadesMes,
    pendentesComite,
    topRanking: topRanking.slice(0, 5)
  });
}));

// ---------------------------------------------------------------------
// Relatorios (avaliacoes + penalidades + ranking de um periodo, para export)
// ---------------------------------------------------------------------
const relatorios = express.Router();
relatorios.use(requireAuth);

relatorios.get("/", asyncHandler(async (req, res) => {
  const { mes, ano, area, supervisor, tst } = req.query;

  const edicao = await resolverEdicao(req.query.edicaoId);
  if (!edicao) return res.json({ edicao: null, mes: mes || null, avaliacoes: [], penalidades: [], ranking: [] });

  const where = { edicaoId: edicao.id };
  if (mes) where.mesReferencia = String(mes);
  else if (ano) where.mesReferencia = { startsWith: String(ano) };

  const [avaliacoes, penalidades, rankingLinhas] = await Promise.all([
    prisma.rsAprAvaliacao.findMany({ where, include: avaliacaoInclude, orderBy: [{ mesReferencia: "desc" }, { criadoEm: "desc" }] }),
    prisma.rsPenalidade.findMany({ where, include: penalidadeInclude, orderBy: { dataOcorrencia: "desc" } }),
    montarRanking({ edicaoId: edicao.id, mes, ano, area, supervisor, tst })
  ]);

  res.json({
    edicao: { id: edicao.id, nome: edicao.nome, ano: edicao.ano },
    mes: mes || null,
    ano: ano || null,
    avaliacoes,
    penalidades,
    ranking: rankingLinhas
  });
}));

module.exports = {
  edicoes,
  propostas,
  criterios,
  regras,
  premiacoes,
  equipes,
  colaboradores,
  avaliacoes,
  comite,
  penalidades,
  ranking,
  dashboard,
  relatorios
};
