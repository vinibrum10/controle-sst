import { dateValue, endOfDate, startOfToday } from "./format";
import type { Tarefa } from "../types/tarefa";

export function isDone(tarefa: Tarefa): boolean {
  return tarefa.status === "CONCLUIDA";
}

export function isLate(tarefa: Tarefa): boolean {
  return !isDone(tarefa) && dateValue(tarefa.prazo) < startOfToday().getTime();
}

export function wasOnTime(tarefa: Tarefa): boolean {
  if (!tarefa.concluidaEm) return false;
  return dateValue(tarefa.concluidaEm) <= endOfDate(tarefa.prazo.slice(0, 10)).getTime();
}
