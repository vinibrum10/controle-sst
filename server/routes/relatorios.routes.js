const express = require("express");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const { tarefaInclude } = require("../utils/tarefaSerializer");
const { isDone, isLate, wasOnTime, endOfDay } = require("../utils/metrics");

const router = express.Router();

router.use(requireAuth);

const UM_DIA_MS = 24 * 60 * 60 * 1000;

// Resolve o intervalo do relatorio a partir da query (?inicio=AAAA-MM-DD&fim=AAAA-MM-DD).
// Sem parametros, usa os ultimos 30 dias.
function resolverPeriodo(query) {
  const fim = query.fim ? new Date(`${query.fim}T23:59:59`) : new Date();
  const inicio = query.inicio
    ? new Date(`${query.inicio}T00:00:00`)
    : new Date(fim.getTime() - 29 * UM_DIA_MS);

  return { inicio, fim };
}

function contarPorStatus(itens, statusList) {
  const contagem = { total: itens.length };
  statusList.forEach((status) => {
    contagem[status] = itens.filter((item) => item.status === status).length;
  });
  return contagem;
}

router.get("/", asyncHandler(async (req, res) => {
  const { inicio, fim } = resolverPeriodo(req.query);

  const [pessoas, tarefas, treinamentos, inspecoes, auditorias, achados, planosAcao, rotasSeguras] = await Promise.all([
    prisma.funcionario.findMany({ orderBy: { nome: "asc" } }),
    prisma.tarefa.findMany({
      where: { prazo: { gte: inicio, lte: fim } },
      include: tarefaInclude
    }),
    prisma.treinamento.findMany(),
    prisma.inspecao.findMany(),
    prisma.auditoria.findMany(),
    prisma.achado.findMany(),
    prisma.planoAcao.findMany(),
    prisma.rotaSegura.findMany()
  ]);

  // ---- Tarefas no periodo ----
  const concluidas = tarefas.filter(isDone);
  const atrasadas = tarefas.filter((tarefa) => !isDone(tarefa) && isLate(tarefa));
  const pendentes = tarefas.filter((tarefa) => tarefa.status === "PENDENTE");
  const emAndamento = tarefas.filter((tarefa) => tarefa.status === "EM_ANDAMENTO");

  const tarefasResumo = {
    total: tarefas.length,
    concluidas: concluidas.length,
    pendentes: pendentes.length,
    emAndamento: emAndamento.length,
    atrasadas: atrasadas.length,
    horasEstimadas: tarefas.reduce((soma, tarefa) => soma + tarefa.horasEstimadas, 0),
    entregasNoPrazoPercent: concluidas.length
      ? Math.round((concluidas.filter(wasOnTime).length / concluidas.length) * 100)
      : 0
  };

  // ---- Por funcionario (tarefas do periodo onde e responsavel) ----
  const porFuncionario = pessoas.map((pessoa) => {
    const tarefasPessoa = tarefas.filter((tarefa) => tarefa.responsavelId === pessoa.id);
    const concluidasPessoa = tarefasPessoa.filter(isDone);
    const atrasosPessoa = tarefasPessoa.filter((tarefa) => isDone(tarefa) ? !wasOnTime(tarefa) : isLate(tarefa));
    const ajudaPedida = tarefasPessoa.reduce((soma, tarefa) => soma + tarefa.pedidosAjuda.length, 0);

    return {
      funcionario: { id: pessoa.id, nome: pessoa.nome, funcao: pessoa.funcao, ativo: pessoa.ativo },
      total: tarefasPessoa.length,
      concluidas: concluidasPessoa.length,
      atrasos: atrasosPessoa.length,
      ajudaPedida
    };
  });

  // ---- Programas de SST (situacao atual, independente do periodo) ----
  const programasSST = {
    treinamentos: contarPorStatus(treinamentos, ["PLANEJADO", "REALIZADO", "CANCELADO", "VENCIDO"]),
    inspecoes: contarPorStatus(inspecoes, ["PLANEJADA", "REALIZADA", "CANCELADA"]),
    auditorias: contarPorStatus(auditorias, ["PLANEJADA", "REALIZADA", "CANCELADA"]),
    achados: contarPorStatus(achados, ["ABERTO", "EM_TRATATIVA", "CONCLUIDO"]),
    planosAcao: contarPorStatus(planosAcao, ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", "ATRASADO"]),
    rotasSeguras: contarPorStatus(rotasSeguras, ["ATIVA", "INATIVA"])
  };

  res.json({
    periodo: { inicio: inicio.toISOString(), fim: endOfDay(fim).toISOString() },
    tarefas: tarefasResumo,
    porFuncionario,
    programasSST
  });
}));

module.exports = router;
