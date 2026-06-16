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

// Tarefas da semana selecionada + tarefas atrasadas nao concluidas de semanas anteriores.
async function tarefasDaSemana(semanaCodigo) {
  if (!semanaCodigo) return [];
  const hoje = startOfToday();
  const [daSemana, atrasadas] = await Promise.all([
    prisma.tarefa.findMany({
      where: { semana: { codigo: semanaCodigo } },
      include: tarefaInclude
    }),
    prisma.tarefa.findMany({
      where: {
        status: { not: "CONCLUIDA" },
        prazo: { lt: hoje },
        NOT: { semana: { codigo: semanaCodigo } }
      },
      include: tarefaInclude
    })
  ]);
  const ids = new Set(daSemana.map((t) => t.id));
  return [...daSemana, ...atrasadas.filter((t) => !ids.has(t.id))];
}

// Soma de horas estimadas de todas as tarefas da semana da pessoa (ativas e concluídas),
// pois horas planejadas consumem capacidade independentemente do status.
function cargaPessoa(tarefas, funcionarioId) {
  return tarefas
    .filter((tarefa) => tarefa.responsavelId === funcionarioId || tarefa.apoioId === funcionarioId)
    .reduce((soma, tarefa) => soma + tarefa.horasEstimadas, 0);
}

// Soma de horas realizadas (via timer) em tarefas da semana onde a pessoa e responsavel ou apoio.
function realizadoPessoa(tarefas, funcionarioId) {
  return tarefas
    .filter((tarefa) => tarefa.responsavelId === funcionarioId || tarefa.apoioId === funcionarioId)
    .reduce((soma, tarefa) => soma + (tarefa.horasRealizadas || 0), 0);
}

module.exports = { isDone, isLate, wasOnTime, startOfToday, endOfDay, tarefasDaSemana, cargaPessoa, realizadoPessoa };
