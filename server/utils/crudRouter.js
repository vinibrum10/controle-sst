const express = require("express");

const asyncHandler = require("./asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { requirePermissao } = require("./permissions");
const { registrarAuditoria } = require("./auditoria");

// Cria um roteador REST (GET/POST/PUT/DELETE) generico para um model do Prisma.
// "writePermissao" restringe POST/PUT/DELETE aos perfis com a permissao
// informada na matriz (leitura continua liberada para qualquer usuario
// autenticado).
// "auditoria", quando informado, registra um LogAuditoria a cada
// criacao/edicao/exclusao (ex.: { entidade: "CadastroGeral", rotulo: (item) => item.nome }).
function createCrudRouter({ model, createSchema, updateSchema, include, orderBy, writePermissao, auditoria }) {
  const router = express.Router();
  router.use(requireAuth);

  const requireWriteAccess = writePermissao ? [requirePermissao(writePermissao)] : [];

  async function registrar(req, acao, item) {
    if (!auditoria) return;
    await registrarAuditoria({
      usuario: req.user,
      acao,
      entidade: auditoria.entidade,
      entidadeId: item.id,
      detalhes: { nome: auditoria.rotulo ? auditoria.rotulo(item) : undefined, ...req.body }
    });
  }

  router.get("/", asyncHandler(async (req, res) => {
    const items = await model.findMany({ include, orderBy });
    res.json(items);
  }));

  router.get("/:id", asyncHandler(async (req, res) => {
    const item = await model.findUnique({ where: { id: req.params.id }, include });
    if (!item) return res.status(404).json({ error: "Registro nao encontrado." });
    res.json(item);
  }));

  router.post("/", ...requireWriteAccess, validateBody(createSchema), asyncHandler(async (req, res) => {
    const item = await model.create({ data: req.body, include });
    await registrar(req, "CRIAR", item);
    res.status(201).json(item);
  }));

  const atualizar = asyncHandler(async (req, res) => {
    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Registro nao encontrado." });
    const item = await model.update({ where: { id: req.params.id }, data: req.body, include });
    await registrar(req, "ATUALIZAR", item);
    res.json(item);
  });

  router.put("/:id", ...requireWriteAccess, validateBody(updateSchema), atualizar);
  router.patch("/:id", ...requireWriteAccess, validateBody(updateSchema), atualizar);

  router.delete("/:id", ...requireWriteAccess, asyncHandler(async (req, res) => {
    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Registro nao encontrado." });
    await model.delete({ where: { id: req.params.id } });
    await registrar(req, "EXCLUIR", existing);
    res.status(204).send();
  }));

  return router;
}

module.exports = createCrudRouter;
