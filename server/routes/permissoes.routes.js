const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { PAPEIS, CHAVES_PERMISSAO, getMatriz, invalidarMatriz } = require("../utils/permissions");

const router = express.Router();

router.use(requireAuth);

const permissaoUpdateSchema = z.object({
  itens: z
    .array(
      z.object({
        papel: z.enum(PAPEIS),
        chave: z.enum(CHAVES_PERMISSAO),
        permitido: z.boolean()
      })
    )
    .min(1)
});

function toLista(matriz) {
  return PAPEIS.flatMap((papel) =>
    CHAVES_PERMISSAO.map((chave) => ({ papel, chave, permitido: matriz[papel][chave] }))
  );
}

// Qualquer usuario autenticado pode consultar a matriz de permissoes
// (usada para liberar/ocultar acoes na interface).
router.get("/", asyncHandler(async (req, res) => {
  const matriz = await getMatriz();
  res.json(toLista(matriz));
}));

// Apenas ADMIN pode alterar a matriz de permissoes. A verificacao e feita
// diretamente por papel (e nao pela propria matriz) para evitar que um ADMIN
// se bloqueie acidentalmente ao editar essa permissao.
router.patch("/", requireRole("ADMIN"), validateBody(permissaoUpdateSchema), asyncHandler(async (req, res) => {
  const bloqueado = req.body.itens.find(
    (item) => item.papel === "ADMIN" && item.chave === "GERENCIAR_USUARIOS" && item.permitido === false
  );
  if (bloqueado) {
    return res.status(400).json({
      error: "Nao e possivel remover a permissao 'Gerenciar usuarios' do perfil Administrador."
    });
  }

  await prisma.$transaction(
    req.body.itens.map((item) =>
      prisma.permissaoPerfil.upsert({
        where: { papel_chave: { papel: item.papel, chave: item.chave } },
        update: { permitido: item.permitido },
        create: { papel: item.papel, chave: item.chave, permitido: item.permitido }
      })
    )
  );

  invalidarMatriz();
  const matriz = await getMatriz();
  res.json(toLista(matriz));
}));

module.exports = router;
