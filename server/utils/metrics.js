const prisma = require("../db");
const { tarefaInclude } = require("./tarefaSerializer");

function isDone(tarefa) {
  return tarefa.status === "CONCLUIDA";
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function isLate(tarefa) {
  if (isDone(tarefa)) return false;
  return new Date(tarefa.prazo).getTime() < startOfToday().getTime();
}

function wasOnTime(tarefa) {
  if (!tarefa.concluidaEm) return false;
  return new Date(tarefa.concluidaEm).getTime() <= endOfDay(tarefa.prazo).getTime();
}

// Todas as tarefas de uma semana (codigo "AAAA-Www"), com responsavel/apoio.
async function tarefasDaSemana(semanaCodigo) {
  if (!semanaCodigo) return [];
  return prisma.tarefa.findMany({
    where: { semana: { codigo: semanaCodigo } },
    include: tarefaInclude
  });
}

// Soma de horas estimadas de tarefas abertas onde a pessoa e responsavel ou apoio.
function cargaPessoa(tarefas, funcionarioId) {
  return tarefas
    .filter((tarefa) => !isDone(tarefa))
    .filter((tarefa) => tarefa.responsavelId === funcionarioId || tarefa.apoioId === funcionarioId)
    .reduce((soma, tarefa) => soma + tarefa.horasEstimadas, 0);
}

module.exports = { isDone, isLate, wasOnTime, startOfToday, endOfDay, tarefasDaSemana, cargaPessoa };
