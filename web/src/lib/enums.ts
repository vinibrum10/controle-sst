import type { PeriodoRotina, PrioridadeTarefa, StatusTarefa, TipoTarefa } from "../types/tarefa";
import type { FrequenciaRota, GravidadeAchado, TipoAchado } from "../types/programas";

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

// Rotulos dos status usados nos relatorios e telas dos programas de SST.
export const PROGRAMA_STATUS_LABELS: Record<string, string> = {
  PLANEJADO: "Planejado",
  REALIZADO: "Realizado",
  CANCELADO: "Cancelado",
  VENCIDO: "Vencido",
  PLANEJADA: "Planejada",
  REALIZADA: "Realizada",
  CANCELADA: "Cancelada",
  ABERTO: "Aberto",
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  EM_TRATATIVA: "Em tratativa",
  CONCLUIDO: "Concluído",
  ATRASADO: "Atrasado",
  ATIVA: "Ativa",
  INATIVA: "Inativa",
};

export function programaStatusLabel(status: string): string {
  return PROGRAMA_STATUS_LABELS[status] || status;
}

export const ACHADO_TIPO_LABELS: Record<TipoAchado, string> = {
  NAO_CONFORMIDADE: "Não conformidade",
  OBSERVACAO: "Observação",
  OPORTUNIDADE_MELHORIA: "Oportunidade de melhoria",
};

export function achadoTipoLabel(tipo: TipoAchado): string {
  return ACHADO_TIPO_LABELS[tipo] || tipo;
}

export const GRAVIDADE_LABELS: Record<GravidadeAchado, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export function gravidadeLabel(gravidade: GravidadeAchado): string {
  return GRAVIDADE_LABELS[gravidade] || gravidade;
}

export const FREQUENCIA_ROTA_LABELS: Record<FrequenciaRota, string> = {
  DIARIA: "Diária",
  SEMANAL: "Semanal",
  QUINZENAL: "Quinzenal",
  MENSAL: "Mensal",
};

export function frequenciaRotaLabel(frequencia: FrequenciaRota): string {
  return FREQUENCIA_ROTA_LABELS[frequencia] || frequencia;
}
