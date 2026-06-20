const express = require("express");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/analytics
 * Query params:
 *   tipo     = "semanal" | "mensal" | "anual"   (default: "semanal")
 *   periodo  = "2026-W25" | "2026-06" | "2026"  (default: semana atual)
 *   tecnicoId = funcionarioId (opcional)
 */
router.get("/", asyncHandler(async (req, res) => {
  const { tipo = "semanal", periodo, tecnicoId } = req.query;

  // Resolve filtro temporal
  const chaveColuna = tipo === "anual" ? "ano" : tipo === "mensal" ? "monthKey" : "weekKey";

  let periodoFiltro = periodo;
  if (!periodoFiltro) {
    const hoje = new Date();
    if (tipo === "anual") {
      periodoFiltro = String(hoje.getUTCFullYear());
    } else if (tipo === "mensal") {
      periodoFiltro = `${hoje.getUTCFullYear()}-${String(hoje.getUTCMonth() + 1).padStart(2, "0")}`;
    } else {
      const d = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
      const day = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - day);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const numero = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      periodoFiltro = `${d.getUTCFullYear()}-W${String(numero).padStart(2, "0")}`;
    }
  }

  // Converte periodo anual para número para a comparação com campo Int
  const filtroValor = tipo === "anual" ? Number(periodoFiltro) : periodoFiltro;

  // ---- Tarefas ----
  // Tarefas não têm weekKey diretamente; usamos o campo semana.codigo (weekKey) via relação
  const tarefaWhere = {};
  if (tipo === "semanal" && periodoFiltro) {
    tarefaWhere.semana = { codigo: periodoFiltro };
  } else if (tipo === "mensal" && periodoFiltro) {
    // Filtra pelo mês do prazo como proxy (monthKey não existe em Tarefa)
    const [ano, mes] = periodoFiltro.split("-").map(Number);
    const inicio = new Date(Date.UTC(ano, mes - 1, 1));
    const fim = new Date(Date.UTC(ano, mes, 1));
    tarefaWhere.criadoEm = { gte: inicio, lt: fim };
  } else if (tipo === "anual" && periodoFiltro) {
    const ano = Number(periodoFiltro);
    tarefaWhere.criadoEm = {
      gte: new Date(Date.UTC(ano, 0, 1)),
      lt: new Date(Date.UTC(ano + 1, 0, 1))
    };
  }

  if (tecnicoId) {
    tarefaWhere.OR = [{ responsavelId: tecnicoId }, { apoioId: tecnicoId }];
  }

  // ---- Viagens ----
  const viagemWhere = { [chaveColuna]: filtroValor };
  if (tecnicoId) viagemWhere.tecnicoId = tecnicoId;

  // ---- AtendimentoOS ----
  const osWhere = { [chaveColuna]: filtroValor };
  if (tecnicoId) osWhere.responsavelId = tecnicoId;

  // ---- PedidoAjuda ----
  const ajudaWhere = { [chaveColuna]: filtroValor };
  if (tecnicoId) ajudaWhere.solicitanteId = tecnicoId;

  // ---- TarefaApontamento ----
  const apontamentoWhere = { [chaveColuna]: filtroValor };
  if (tecnicoId) apontamentoWhere.funcionarioId = tecnicoId;

  const [tarefas, viagens, atendimentosOS, pedidosAjuda, apontamentos] = await Promise.all([
    prisma.tarefa.findMany({
      where: tarefaWhere,
      select: {
        id: true,
        status: true,
        prioridade: true,
        prazo: true,
        horasEstimadas: true,
        horasRealizadas: true,
        responsavelId: true,
        concluidaEm: true
      }
    }),
    prisma.viagem.findMany({
      where: viagemWhere,
      select: {
        id: true,
        tecnicoId: true,
        duracaoSegundos: true,
        finalizadoEm: true,
        iniciadoEm: true,
        weekKey: true,
        monthKey: true,
        ano: true
      }
    }),
    prisma.atendimentoOS.findMany({
      where: osWhere,
      select: {
        id: true,
        responsavelId: true,
        duracaoSegundos: true,
        finalizadoEm: true,
        weekKey: true,
        monthKey: true,
        ano: true
      }
    }),
    prisma.pedidoAjuda.findMany({
      where: ajudaWhere,
      select: {
        id: true,
        status: true,
        solicitanteId: true,
        atendentePorId: true,
        weekKey: true,
        monthKey: true,
        ano: true
      }
    }),
    prisma.tarefaApontamento.findMany({
      where: apontamentoWhere,
      select: {
        id: true,
        funcionarioId: true,
        duracaoSegundos: true,
        weekKey: true,
        monthKey: true,
        ano: true
      }
    })
  ]);

  // Agregações de tarefas
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const tarefasKpis = {
    total: tarefas.length,
    pendentes: tarefas.filter((t) => t.status === "PENDENTE").length,
    emAndamento: tarefas.filter((t) => t.status === "EM_ANDAMENTO").length,
    concluidas: tarefas.filter((t) => t.status === "CONCLUIDA").length,
    atrasadas: tarefas.filter((t) => t.status !== "CONCLUIDA" && t.prazo < hoje).length,
    criticas: tarefas.filter((t) => t.prioridade === "CRITICA").length,
    horasEstimadas: tarefas.reduce((s, t) => s + (t.horasEstimadas || 0), 0),
    horasRealizadas: tarefas.reduce((s, t) => s + (t.horasRealizadas || 0), 0)
  };

  // Agregações de viagens
  const viagensFinalizadas = viagens.filter((v) => v.finalizadoEm != null);
  const viagensKpis = {
    total: viagens.length,
    ativas: viagens.filter((v) => v.finalizadoEm == null).length,
    finalizadas: viagensFinalizadas.length,
    duracaoTotalSegundos: viagensFinalizadas.reduce((s, v) => s + (v.duracaoSegundos || 0), 0)
  };

  // Agregações de OS
  const osFinalizadas = atendimentosOS.filter((o) => o.finalizadoEm != null);
  const osKpis = {
    total: atendimentosOS.length,
    ativas: atendimentosOS.filter((o) => o.finalizadoEm == null).length,
    finalizadas: osFinalizadas.length,
    duracaoTotalSegundos: osFinalizadas.reduce((s, o) => s + (o.duracaoSegundos || 0), 0)
  };

  // Agregações de pedidos de ajuda
  const ajudaKpis = {
    total: pedidosAjuda.length,
    atendidos: pedidosAjuda.filter((p) => p.status === "ATENDIDO").length,
    cancelados: pedidosAjuda.filter((p) => p.status === "CANCELADO").length
  };

  // Horas trabalhadas por técnico (via apontamentos)
  const horasPorTecnico = {};
  for (const a of apontamentos) {
    if (!a.funcionarioId) continue;
    horasPorTecnico[a.funcionarioId] = (horasPorTecnico[a.funcionarioId] || 0) + (a.duracaoSegundos || 0);
  }

  res.json({
    tipo,
    periodo: periodoFiltro,
    tecnicoId: tecnicoId || null,
    tarefas: tarefasKpis,
    viagens: viagensKpis,
    atendimentosOS: osKpis,
    pedidosAjuda: ajudaKpis,
    horasPorTecnicoSegundos: horasPorTecnico
  });
}));

module.exports = router;
