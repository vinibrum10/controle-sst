const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Gestao de usuarios (alterar papel/ativar-inativar conta) e' restrita a ADMIN.
router.use(requireAuth, requireRole("ADMIN"));

const PAPEIS = ["ADMIN", "GESTOR", "TST", "VISUALIZADOR", "COLABORADOR"];

const usuarioUpdateSchema = z
  .object({
    papel: z.enum(PAPEIS).optional(),
    ativo: z.boolean().optional()
  })
  .refine((data) => data.papel !== undefined || data.ativo !== undefined, {
    message: "Informe o papel ou o status do usuario."
  });

function toUsuarioAdmin(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    ativo: usuario.ativo,
    provedor: usuario.provedor,
    criadoEm: usuario.criadoEm
  };
}

router.get("/", asyncHandler(async (req, res) => {
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: "asc" } });
  res.json(usuarios.map(toUsuarioAdmin));
}));

// Altera o papel e/ou o status (ativo) de um usuario. Um ADMIN nao pode
// alterar o proprio papel/status por aqui, para evitar perda de acesso.
router.patch("/:id", validateBody(usuarioUpdateSchema), asyncHandler(async (req, res) => {
  if (req.params.id === req.user.sub) {
    return res.status(400).json({ error: "Nao e possivel alterar seu proprio papel ou status." });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: req.params.id } });
  if (!usuario) return res.status(404).json({ error: "Usuario nao encontrado." });

  const atualizado = await prisma.usuario.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(toUsuarioAdmin(atualizado));
}));

module.exports = router;
