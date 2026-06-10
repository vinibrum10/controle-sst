// Funcoes auxiliares para classificar tarefas no front-end (status,
// atraso, entrega no prazo). Espelham server/utils/metrics.js.

import { dateValue, startOfToday, endOfDate } from "./format.js";

export function isDone(tarefa) {
  return tarefa.status === "CONCLUIDA";
}

export function isLate(tarefa) {
  return !isDone(tarefa) && dateValue(tarefa.prazo) < startOfToday().getTime();
}

export function wasOnTime(tarefa) {
  if (!tarefa.concluidaEm) return false;
  return dateValue(tarefa.concluidaEm) <= endOfDate(tarefa.prazo.slice(0, 10)).getTime();
}
