const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { requirePermissao } = require("../utils/permissions");
const createCrudRouter = require("../utils/crudRouter");
const { registrarAuditoria } = require("../utils/auditoria");

// ---------------------------------------------------------------------
// Configuracao do sistema (singleton: nome do sistema, nome da empresa, logo)
// ---------------------------------------------------------------------
const configuracaoSistemaUpdate = z.object({
  nomeSistema: z.string().trim().min(1, "Informe o nome do sistema.").optional(),
  nomeEmpresa: z.string().trim().nullable().optional(),
  logoUrl: z.string().trim().nullable().optional()
});

const sistema = express.Router();
sistema.use(requireAuth);

sistema.get("/", asyncHandler(async (req, res) => {
  let configuracao = await prisma.configuracaoSistema.findFirst();
  if (!configuracao) configuracao = await prisma.configuracaoSistema.create({ data: {} });
  res.json(configuracao);
}));

sistema.patch("/", requirePermissao("GERENCIAR_CADASTROS"), validateBody(configuracaoSistemaUpdate), asyncHandler(async (req, res) => {
  let configuracao = await prisma.configuracaoSistema.findFirst();
  if (!configuracao) configuracao = await prisma.configuracaoSistema.create({ data: req.body });
  else configuracao = await prisma.configuracaoSistema.update({ where: { id: configuracao.id }, data: req.body });

  await registrarAuditoria({
    usuario: req.user,
    acao: "ATUALIZAR",
    entidade: "ConfiguracaoSistema",
    entidadeId: configuracao.id,
    detalhes: req.body
  });

  res.json(configuracao);
}));

// ---------------------------------------------------------------------
// Cadastros gerais (unidades, areas/setores, cargos/funcoes, equipes,
// tipos de atividade, tipos de inspecao, tipos de treinamento)
// ---------------------------------------------------------------------
const CATEGORIAS_CADASTRO = [
  "UNIDADE", "AREA_SETOR", "CARGO_FUNCAO", "EQUIPE", "TIPO_ATIVIDADE", "TIPO_INSPECAO", "TIPO_TREINAMENTO"
];

const cadastroGeralCreate = z.object({
  categoria: z.enum(CATEGORIAS_CADASTRO),
  nome: z.string().trim().min(1, "Informe o nome."),
  descricao: z.string().trim().nullable().optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().optional()
});

const cadastroGeralUpdate = z.object({
  nome: z.string().trim().min(1, "Informe o nome.").optional(),
  descricao: z.string().trim().nullable().optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().optional()
});

const cadastros = createCrudRouter({
  model: prisma.cadastroGeral,
  createSchema: cadastroGeralCreate,
  updateSchema: cadastroGeralUpdate,
  orderBy: [{ categoria: "asc" }, { ordem: "asc" }, { nome: "asc" }],
  writePermissao: "GERENCIAR_CADASTROS",
  auditoria: { entidade: "CadastroGeral", rotulo: (item) => item.nome }
});

module.exports = { sistema, cadastros };
