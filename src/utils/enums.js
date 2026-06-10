// Rotulos em portugues para os enums vindos do banco de dados.

export const STATUS_LABELS = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída"
};

export const TYPE_LABELS = {
  ROTINEIRA: "Rotineira",
  EVENTUAL: "Eventual"
};

export const ROUTINE_PERIOD_LABELS = {
  SEMANAL: "Semanal",
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual"
};

export const PRIORITY_LABELS = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica"
};

export const KANBAN_COLUMNS = [
  { status: "PENDENTE", domId: "pendente" },
  { status: "EM_ANDAMENTO", domId: "em_andamento" },
  { status: "CONCLUIDA", domId: "concluida" }
];

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function typeLabel(tipo) {
  return TYPE_LABELS[tipo] || tipo;
}

export function routinePeriodLabel(periodo) {
  return ROUTINE_PERIOD_LABELS[periodo] || "Semanal";
}

export function priorityLabel(prioridade) {
  return PRIORITY_LABELS[prioridade] || prioridade;
}
