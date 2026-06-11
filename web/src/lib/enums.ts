import type { PeriodoRotina, PrioridadeTarefa, StatusTarefa, TipoTarefa } from "../types/tarefa";

export const STATUS_LABELS: Record<StatusTarefa, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
};

export const TYPE_LABELS: Record<TipoTarefa, string> = {
  ROTINEIRA: "Rotineira",
  EVENTUAL: "Eventual",
};

export const ROUTINE_PERIOD_LABELS: Record<PeriodoRotina, string> = {
  SEMANAL: "Semanal",
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
};

export const PRIORITY_LABELS: Record<PrioridadeTarefa, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const KANBAN_COLUMNS: { status: StatusTarefa; titulo: string }[] = [
  { status: "PENDENTE", titulo: "Pendentes" },
  { status: "EM_ANDAMENTO", titulo: "Em Andamento" },
  { status: "CONCLUIDA", titulo: "Concluídas" },
];

export function typeLabel(tipo: TipoTarefa): string {
  return TYPE_LABELS[tipo] || tipo;
}

export function routinePeriodLabel(periodo?: PeriodoRotina | null): string {
  return periodo ? ROUTINE_PERIOD_LABELS[periodo] : ROUTINE_PERIOD_LABELS.SEMANAL;
}

export function statusLabel(status: StatusTarefa): string {
  return STATUS_LABELS[status] || status;
}

export function priorityLabel(prioridade: PrioridadeTarefa): string {
  return PRIORITY_LABELS[prioridade] || prioridade;
}
