const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { PAPEIS, CHAVES_PERMISSAO, getMatriz, invalidarMatriz } = require("../utils/permissions");
const { NOTIFICACAO_PERMISSAO_ALTERADA } = require("../utils/notificacoesInApp");
const { filtrarPorPreferenciaInApp } = require("../utils/notificacaoPreferencias");

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

  const matrizAtual = await getMatriz();
  const mudancas = req.body.itens.filter((item) => matrizAtual[item.papel][item.chave] !== item.permitido);
  const papeisAfetados = [...new Set(mudancas.map((item) => item.papel))];

  const idsUsuariosComPapelAfetado = papeisAfetados.length > 0
    ? (await prisma.usuario.findMany({ where: { papel: { in: papeisAfetados }, ativo: true }, select: { id: true } })).map((item) => item.id)
    : [];
  const idsUsuariosAfetados = await filtrarPorPreferenciaInApp(idsUsuariosComPapelAfetado, "PERMISSAO_ALTERADA");
  const usuariosAfetados = idsUsuariosAfetados.map((id) => ({ id }));

  await prisma.$transaction([
    ...req.body.itens.map((item) =>
      prisma.permissaoPerfil.upsert({
        where: { papel_chave: { papel: item.papel, chave: item.chave } },
        update: { permitido: item.permitido },
        create: { papel: item.papel, chave: item.chave, permitido: item.permitido }
      })
    ),
    ...mudancas.map((item) =>
      prisma.permissaoHistorico.create({
        data: {
          papel: item.papel,
          chave: item.chave,
          permitidoAntes: matrizAtual[item.papel][item.chave],
          permitidoDepois: item.permitido,
          alteradoPorId: req.user.sub,
          alteradoPorNome: req.user.nome,
          alteradoPorEmail: req.user.email
        }
      })
    ),
    ...(usuariosAfetados.length > 0
      ? [
          prisma.notificacao.createMany({
            data: usuariosAfetados.map((usuario) => ({ usuarioId: usuario.id, ...NOTIFICACAO_PERMISSAO_ALTERADA }))
          })
        ]
      : [])
  ]);

  invalidarMatriz();
  const matriz = await getMatriz();
  res.json(toLista(matriz));
}));

// Historico de alteracoes da matriz de permissoes, restrito ao ADMIN.
router.get("/historico", requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const limite = Math.min(Number(req.query.limite) || 50, 200);
  const historico = await prisma.permissaoHistorico.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite
  });
  res.json(historico);
}));

module.exports = router;
