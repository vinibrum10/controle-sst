const express = require("express");

const asyncHandler = require("./asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

// Cria um roteador REST (GET/POST/PUT/DELETE) generico para um model do Prisma.
function createCrudRouter({ model, createSchema, updateSchema, include, orderBy }) {
  const router = express.Router();
  router.use(requireAuth);

  router.get("/", asyncHandler(async (req, res) => {
    const items = await model.findMany({ include, orderBy });
    res.json(items);
  }));

  router.get("/:id", asyncHandler(async (req, res) => {
    const item = await model.findUnique({ where: { id: req.params.id }, include });
    if (!item) return res.status(404).json({ error: "Registro nao encontrado." });
    res.json(item);
  }));

  router.post("/", validateBody(createSchema), asyncHandler(async (req, res) => {
    const item = await model.create({ data: req.body, include });
    res.status(201).json(item);
  }));

  router.put("/:id", validateBody(updateSchema), asyncHandler(async (req, res) => {
    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Registro nao encontrado." });
    const item = await model.update({ where: { id: req.params.id }, data: req.body, include });
    res.json(item);
  }));

  router.delete("/:id", asyncHandler(async (req, res) => {
    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Registro nao encontrado." });
    await model.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}

module.exports = createCrudRouter;
