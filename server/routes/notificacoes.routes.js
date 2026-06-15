const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { TIPOS_NOTIFICACAO, TIPOS_COM_EMAIL, TIPO_LABELS, getPreferencia } = require("../utils/notificacaoPreferencias");
const { emailHabilitado } = require("../utils/mailer");

const router = express.Router();

const PRAZO_PROXIMO_DIAS = 3;

router.use(requireAuth);

// Itens calculados a partir de tarefas com prazo proximo/vencido do usuario
// (responsavel ou apoio), nao persistidos como Notificacao.
async function notificacoesDePrazo(usuario) {
  if (!usuario.funcionarioId) return [];

  const preferencia = await getPreferencia(usuario.id, "TAREFA_PRAZO");
  if (!preferencia.inApp) return [];

  const limite = new Date();
  limite.setDate(limite.getDate() + PRAZO_PROXIMO_DIAS);

  const tarefas = await prisma.tarefa.findMany({
    where: {
      OR: [{ responsavelId: usuario.funcionarioId }, { apoioId: usuario.funcionarioId }],
      status: { not: "CONCLUIDA" },
      prazo: { lte: limite }
    },
    orderBy: { prazo: "asc" }
  });

  const agora = new Date();
  return tarefas.map((tarefa) => {
    const vencida = tarefa.prazo < agora;
    const prazoFormatado = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(tarefa.prazo);
    return {
      id: `prazo-${tarefa.id}`,
      tipo: "TAREFA_PRAZO",
      titulo: vencida ? "Tarefa com prazo vencido" : "Tarefa com prazo próximo",
      mensagem: `"${tarefa.titulo}" - prazo em ${prazoFormatado}.`,
      link: "/dashboard/tarefas",
      lida: false,
      criadoEm: tarefa.prazo
    };
  });
}

router.get("/", asyncHandler(async (req, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user.sub } });
  if (!usuario) return res.status(404).json({ error: "Usuario nao encontrado." });

  const [persistidas, prazos] = await Promise.all([
    prisma.notificacao.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { criadoEm: "desc" },
      take: 50
    }),
    notificacoesDePrazo(usuario)
  ]);

  const naoLidas = prazos.length + persistidas.filter((item) => !item.lida).length;

  res.json({ itens: [...prazos, ...persistidas], naoLidas });
}));

router.patch("/:id/lida", asyncHandler(async (req, res) => {
  const notificacao = await prisma.notificacao.findUnique({ where: { id: req.params.id } });
  if (!notificacao || notificacao.usuarioId !== req.user.sub) {
    return res.status(404).json({ error: "Notificacao nao encontrada." });
  }

  const atualizada = await prisma.notificacao.update({ where: { id: req.params.id }, data: { lida: true } });
  res.json(atualizada);
}));

router.post("/marcar-todas-lidas", asyncHandler(async (req, res) => {
  await prisma.notificacao.updateMany({
    where: { usuarioId: req.user.sub, lida: false },
    data: { lida: true }
  });
  res.json({ ok: true });
}));

const preferenciasUpdateSchema = z.object({
  itens: z
    .array(
      z.object({
        tipo: z.enum(TIPOS_NOTIFICACAO),
        inApp: z.boolean(),
        email: z.boolean()
      })
    )
    .min(1)
});

// Monta a lista de preferencias efetivas (assumindo o padrao quando nao ha
// registro salvo) a partir dos registros do usuario.
function serializePreferencias(registros) {
  const porTipo = new Map(registros.map((item) => [item.tipo, item]));
  return TIPOS_NOTIFICACAO.map((tipo) => {
    const registro = porTipo.get(tipo);
    return {
      tipo,
      titulo: TIPO_LABELS[tipo],
      inApp: registro ? registro.inApp : true,
      email: registro ? registro.email : true,
      emailDisponivel: TIPOS_COM_EMAIL.has(tipo)
    };
  });
}

// Indica se o servidor esta configurado para enviar e-mails de notificacao
// (variaveis SMTP_*), para a interface poder avisar quando o envio nao
// esta ativo.
router.get("/email-status", asyncHandler(async (req, res) => {
  res.json({ habilitado: emailHabilitado });
}));

router.get("/preferencias", asyncHandler(async (req, res) => {
  const registros = await prisma.preferenciaNotificacao.findMany({ where: { usuarioId: req.user.sub } });
  res.json(serializePreferencias(registros));
}));

router.put("/preferencias", validateBody(preferenciasUpdateSchema), asyncHandler(async (req, res) => {
  await prisma.$transaction(
    req.body.itens.map((item) =>
      prisma.preferenciaNotificacao.upsert({
        where: { usuarioId_tipo: { usuarioId: req.user.sub, tipo: item.tipo } },
        update: { inApp: item.inApp, email: item.email },
        create: { usuarioId: req.user.sub, tipo: item.tipo, inApp: item.inApp, email: item.email }
      })
    )
  );

  const registros = await prisma.preferenciaNotificacao.findMany({ where: { usuarioId: req.user.sub } });
  res.json(serializePreferencias(registros));
}));

module.exports = router;
