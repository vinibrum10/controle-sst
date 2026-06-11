import type { Funcionario } from "./funcionario";

export type TipoTarefa = "ROTINEIRA" | "EVENTUAL";
export type PrioridadeTarefa = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
export type PeriodoRotina = "SEMANAL" | "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
export type StatusTarefa = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
export type StatusPedidoAjuda = "ABERTO" | "ATENDIDO" | "CANCELADO";

export interface PedidoAjuda {
  id: string;
  tarefaId: string;
  solicitanteId: string | null;
  atendentePorId: string | null;
  status: StatusPedidoAjuda;
  criadoEm: string;
  atendidoEm: string | null;
}

export interface NovaTarefa {
  titulo: string;
  responsavelId: string;
  apoioId?: string | null;
  semana: string;
  prazo: string;
  tipo: TipoTarefa;
  prioridade: PrioridadeTarefa;
  periodoRotina?: PeriodoRotina | null;
  horasEstimadas: number;
  descricao?: string;
}

export interface Tarefa extends NovaTarefa {
  id: string;
  status: StatusTarefa;
  criadoEm: string;
  concluidaEm: string | null;
  responsavel: Funcionario | null;
  apoio: Funcionario | null;
  pedidosAjuda: PedidoAjuda[];
}
