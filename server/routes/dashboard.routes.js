const express = require("express");
const { z } = require("zod");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { tarefaInclude } = require("../utils/tarefaSerializer");
const {
  isDone, isLate, wasOnTime, startOfToday, tarefasDaSemana, cargaPessoa, realizadoPessoa
} = require("../utils/metrics");
const { WIDGET_IDS, serializePreferenciasDashboard } = require("../utils/dashboardWidgets");
const { semanaInfoFromCodigo } = require("../utils/semana");

const router = express.Router();

router.use(requireAuth);

function diasAte(data) {
  const diff = new Date(data).getTime() - startOfToday().getTime();
  return Math.ceil(diff / 86400000);
}

function rankPessoas(pessoas, scoreFn, limite = 5, apenasPositivos = false) {
  return pessoas
    .map((pessoa) => ({ funcionario: pessoa, valor: scoreFn(pessoa.id) }))
    .filter((item) => !apenasPositivos || item.valor > 0)
    .sort((a, b) => b.valor - a.valor || a.funcionario.nome.localeCompare(b.funcionario.nome, "pt-BR"))
    .slice(0, limite);
}

router.get("/", asyncHandler(async (req, res) => {
  const semana = req.query.semana;

  const semanaInfo = semana ? semanaInfoFromCodigo(semana) : null;
  const fimSemana = semanaInfo
    ? new Date(semanaInfo.dataFim.getTime() + 24 * 3600 * 1000)
    : null;

  const [pessoas, tarefasSemana, todasTarefas, todosPedidos, osAtendimentos, viagemAtendimentos] = await Promise.all([
    prisma.funcionario.findMany({ orderBy: { nome: "asc" } }),
    tarefasDaSemana(semana),
    prisma.tarefa.findMany({ include: tarefaInclude }),
    prisma.pedidoAjuda.findMany(),
    semanaInfo
      ? prisma.atendimentoOS.findMany({
          where: {
            iniciadoEm: { gte: semanaInfo.dataInicio, lt: fimSemana },
            finalizadoEm: { not: null },
            responsavelId: { not: null },
            duracaoSegundos: { not: null }
          },
          select: { responsavelId: true, duracaoSegundos: true }
        })
      : Promise.resolve([]),
    semanaInfo
      ? prisma.viagem.findMany({
          where: {
            iniciadoEm: { gte: semanaInfo.dataInicio, lt: fimSemana },
            finalizadoEm: { not: null },
            tecnicoId: { not: null },
            duracaoSegundos: { not: null }
          },
          select: { tecnicoId: true, duracaoSegundos: true }
        })
      : Promise.resolve([])
  ]);

  const osHorasPessoa = (funcionarioId) =>
    osAtendimentos
      .filter((a) => a.responsavelId === funcionarioId)
      .reduce((soma, a) => soma + (a.duracaoSegundos ?? 0) / 3600, 0);

  const viagemHorasPessoa = (funcionarioId) =>
    viagemAtendimentos
      .filter((v) => v.tecnicoId === funcionarioId)
      .reduce((soma, v) => soma + (v.duracaoSegundos ?? 0) / 3600, 0);

  // ---- Cards de metricas (semana selecionada) ----
  const ativas = tarefasSemana.filter((tarefa) => !isDone(tarefa));
  const concluidas = tarefasSemana.filter(isDone);
  const vencidas = ativas.filter(isLate);
  const prazoEm3Dias = ativas.filter((tarefa) => {
    const dias = diasAte(tarefa.prazo);
    return dias >= 0 && dias <= 3;
  });
  const pedidosAjudaSemana = tarefasSemana.reduce((soma, tarefa) => soma + tarefa.pedidosAjuda.length, 0);
  const entregasNoPrazoPercent = concluidas.length
    ? Math.round((concluidas.filter(wasOnTime).length / concluidas.length) * 100)
    : 0;

  // ---- Carga por pessoa (semana selecionada) ----
  const cargaPorPessoa = pessoas
    .filter((pessoa) => pessoa.ativo || cargaPessoa(tarefasSemana, pessoa.id) > 0)
    .map((pessoa) => {
      const carga = cargaPessoa(tarefasSemana, pessoa.id);
      const realizado = Math.round(
        (realizadoPessoa(tarefasSemana, pessoa.id) + osHorasPessoa(pessoa.id) + viagemHorasPessoa(pessoa.id)) * 10
      ) / 10;
      return {
        funcionario: pessoa,
        carga,
        realizado,
        capacidade: pessoa.capacidade,
        percentual: Math.min(Math.round((carga / pessoa.capacidade) * 100), 140),
        livre: Math.max(pessoa.capacidade - carga, 0)
      };
    });

  // ---- Status / tipo das tarefas (semana selecionada) ----
  const statusChart = {
    pendente: tarefasSemana.filter((t) => t.status === "PENDENTE" && !isLate(t)).length,
    em_andamento: tarefasSemana.filter((t) => t.status === "EM_ANDAMENTO" && !isLate(t)).length,
    atrasada: tarefasSemana.filter((t) => !isDone(t) && isLate(t)).length,
    concluida: concluidas.length
  };
  const typeChart = {
    rotineira: tarefasSemana.filter((t) => t.tipo === "ROTINEIRA").length,
    eventual: tarefasSemana.filter((t) => t.tipo === "EVENTUAL").length
  };

  // ---- Rankings (historico completo) ----
  const pedidosPorPessoa = (funcionarioId) => todosPedidos
    .filter((pedido) => pedido.solicitanteId === funcionarioId).length;

  const entregasNoPrazoPorPessoa = (funcionarioId) => todasTarefas
    .filter((tarefa) => tarefa.responsavelId === funcionarioId && isDone(tarefa) && wasOnTime(tarefa)).length;

  const atrasosPorPessoa = (funcionarioId) => todasTarefas.filter((tarefa) => {
    if (tarefa.responsavelId !== funcionarioId) return false;
    if (isDone(tarefa)) return !wasOnTime(tarefa);
    return isLate(tarefa);
  }).length;

  const rankings = {
    maisPedemAjuda: rankPessoas(pessoas, pedidosPorPessoa),
    entregasNoPrazo: rankPessoas(pessoas, entregasNoPrazoPorPessoa),
    atrasos: rankPessoas(pessoas, atrasosPorPessoa, 5, true)
  };

  // ---- Disponibilidade para apoio (semana selecionada) ----
  const disponibilidade = pessoas
    .filter((pessoa) => pessoa.ativo)
    .map((pessoa) => {
      const carga = cargaPessoa(tarefasSemana, pessoa.id);
      const os = osHorasPessoa(pessoa.id);
      const viagem = viagemHorasPessoa(pessoa.id);
      return { funcionario: pessoa, carga, livre: Math.max(pessoa.capacidade - carga - os - viagem, 0) };
    })
    .sort((a, b) => (b.funcionario.capacidade - b.carga) - (a.funcionario.capacidade - a.carga));

  res.json({
    semana,
    metrics: {
      tarefasAtivas: ativas.length,
      concluidas: concluidas.length,
      vencidas: vencidas.length,
      prazoEm3Dias: prazoEm3Dias.length,
      entregasNoPrazoPercent,
      pedidosAjuda: pedidosAjudaSemana
    },
    cargaPorPessoa,
    statusChart,
    typeChart,
    rankings,
    disponibilidade
  });
}));

const preferenciasUpdateSchema = z.object({
  itens: z
    .array(
      z.object({
        id: z.enum(WIDGET_IDS),
        visivel: z.boolean(),
        ordem: z.number().int().min(0)
      })
    )
    .min(1)
});

router.get("/preferencias", asyncHandler(async (req, res) => {
  const registros = await prisma.preferenciaDashboard.findMany({ where: { usuarioId: req.user.sub } });
  res.json(serializePreferenciasDashboard(registros));
}));

router.put("/preferencias", validateBody(preferenciasUpdateSchema), asyncHandler(async (req, res) => {
  await prisma.$transaction(
    req.body.itens.map((item) =>
      prisma.preferenciaDashboard.upsert({
        where: { usuarioId_widget: { usuarioId: req.user.sub, widget: item.id } },
        update: { visivel: item.visivel, ordem: item.ordem },
        create: { usuarioId: req.user.sub, widget: item.id, visivel: item.visivel, ordem: item.ordem }
      })
    )
  );

  const registros = await prisma.preferenciaDashboard.findMany({ where: { usuarioId: req.user.sub } });
  res.json(serializePreferenciasDashboard(registros));
}));

module.exports = router;
