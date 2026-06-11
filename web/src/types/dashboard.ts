import type { Funcionario } from "./funcionario";

export type { Funcionario };

export interface DashboardMetrics {
  tarefasAtivas: number;
  concluidas: number;
  vencidas: number;
  prazoEm3Dias: number;
  entregasNoPrazoPercent: number;
  pedidosAjuda: number;
}

export interface CargaPorPessoa {
  funcionario: Funcionario;
  carga: number;
  capacidade: number;
  percentual: number;
  livre: number;
}

export interface StatusChartData {
  pendente: number;
  em_andamento: number;
  atrasada: number;
  concluida: number;
}

export interface TypeChartData {
  rotineira: number;
  eventual: number;
}

export interface RankingEntry {
  funcionario: Funcionario;
  valor: number;
}

export interface DashboardRankings {
  maisPedemAjuda: RankingEntry[];
  entregasNoPrazo: RankingEntry[];
  atrasos: RankingEntry[];
}

export interface DashboardData {
  semana: string;
  metrics: DashboardMetrics;
  cargaPorPessoa: CargaPorPessoa[];
  statusChart: StatusChartData;
  typeChart: TypeChartData;
  rankings: DashboardRankings;
}
