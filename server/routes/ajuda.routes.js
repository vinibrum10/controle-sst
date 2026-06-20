const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { tarefaInclude, serializeTarefa } = require("../utils/tarefaSerializer");
const { isDone, isLate, tarefasDaSemana, cargaPessoa } = require("../utils/metrics");
const { enviarNotificacaoApoioAtribuido } = require("../utils/notificacoes");
const { notificarApoioSolicitado } = require("../utils/notificacoesInApp");
const { temporalFields } = require("../utils/temporal");
const { registrarAuditoria } = require("../utils/auditoria");

const router = express.Router();

router.use(requireAuth);

// Pessoas disponiveis para apoio em uma semana, ordenadas por capacidade livre.
router.get("/disponibilidade", asyncHandler(async (req, res) => {
  const semana = req.query.semana;
  const [pessoas, tarefas] = await Promise.all([
    prisma.funcionario.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    tarefasDaSemana(semana)
  ]);

  const disponibilidade = pessoas
    .map((pessoa) => {
      const carga = cargaPessoa(tarefas, pessoa.id);
      return {
        funcionario: pessoa,
        carga,
        livre: Math.max(pessoa.capacidade - carga, 0)
      };
    })
    .sort((a, b) => (b.funcionario.capacidade - b.carga) - (a.funcionario.capacidade - a.carga));

  res.json(disponibilidade);
}));

// Historico de pedidos de ajuda (pedidos abertos, atendidos e cancelados).
router.get("/historico", asyncHandler(async (req, res) => {
  const pedidos = await prisma.pedidoAjuda.findMany({
    include: {
      tarefa: { select: { id: true, titulo: true, prazo: true } },
      solicitante: { select: { id: true, nome: true, funcao: true } },
      atendente: { select: { id: true, nome: true, funcao: true } }
    },
    orderBy: { criadoEm: "desc" }
  });

  res.json(pedidos);
}));

// Pede ajuda automatica para uma tarefa: escolhe quem tem capacidade livre
// (priorizando quem esta sem nenhuma tarefa aberta na semana).
router.post("/solicitar", validateBody(z.object({ tarefaId: z.string().min(1) })), asyncHandler(async (req, res) => {
  const tarefa = await prisma.tarefa.findUnique({
    where: { id: req.body.tarefaId },
    include: tarefaInclude
  });

  if (!tarefa) return res.status(404).json({ error: "Tarefa nao encontrada." });
  if (isDone(tarefa)) return res.status(400).json({ error: "Esta tarefa ja foi concluida." });
  if (!tarefa.semana) return res.status(400).json({ error: "Tarefa sem semana definida." });

  const tarefas = await tarefasDaSemana(tarefa.semana.codigo);
  const pessoas = await prisma.funcionario.findMany({ where: { ativo: true } });

  const candidatos = pessoas
    .filter((pessoa) => pessoa.id !== tarefa.responsavelId)
    .map((pessoa) => {
      const carga = cargaPessoa(tarefas, pessoa.id);
      const livre = pessoa.capacidade - carga;
      const atrasado = tarefas.some((item) => (
        item.responsavelId === pessoa.id && !isDone(item) && isLate(item)
      ));
      return { pessoa, carga, livre, atrasado };
    })
    .filter((item) => item.livre > 0 && !item.atrasado);

  const semCarga = candidatos
    .filter((item) => item.carga === 0)
    .sort((a, b) => b.livre - a.livre);

  const escolhido = semCarga[0]
    || candidatos.sort((a, b) => (b.livre - a.livre) || (a.carga - b.carga))[0];

  if (!escolhido) {
    return res.status(404).json({ error: "Nenhuma pessoa com capacidade livre foi encontrada para essa semana." });
  }

  const [tarefaAtualizada] = await prisma.$transaction([
    prisma.tarefa.update({
      where: { id: tarefa.id },
      data: { apoioId: escolhido.pessoa.id, status: "EM_ANDAMENTO" },
      include: tarefaInclude
    }),
    prisma.pedidoAjuda.create({
      data: {
        tarefaId: tarefa.id,
        solicitanteId: tarefa.responsavelId,
        atendentePorId: escolhido.pessoa.id,
        status: "ATENDIDO",
        atendidoEm: new Date(),
        ...temporalFields(new Date())
      }
    })
  ]);

  registrarAuditoria({
    usuario: req.user,
    acao: "pedido_ajuda_criado",
    entidade: "PedidoAjuda",
    entidadeId: tarefa.id,
    detalhes: { tarefaId: tarefa.id, ajudanteId: escolhido.pessoa.id, ajudanteNome: escolhido.pessoa.nome }
  }).catch(() => {});

  const resultadoNotificacao = await notificarApoioSolicitado(escolhido.pessoa.id, tarefaAtualizada);
  const notificacaoEmail = resultadoNotificacao && !resultadoNotificacao.preferencia.email
    ? { enviado: false, motivo: "Notificações por e-mail desativadas pelo usuário." }
    : await enviarNotificacaoApoioAtribuido(serializeTarefa(tarefaAtualizada), escolhido.pessoa);

  res.json({
    tarefa: serializeTarefa(tarefaAtualizada),
    ajudante: escolhido.pessoa,
    mensagem: `${escolhido.pessoa.nome} foi designado(a) para apoiar na tarefa "${tarefa.titulo}".`,
    notificacaoEmail
  });
}));

module.exports = router;
