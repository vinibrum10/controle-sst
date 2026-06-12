import type { Funcionario } from "./funcionario";

export interface RelatorioPeriodo {
  inicio: string;
  fim: string;
}

export interface RelatorioTarefas {
  total: number;
  concluidas: number;
  pendentes: number;
  emAndamento: number;
  atrasadas: number;
  horasEstimadas: number;
  entregasNoPrazoPercent: number;
}

export interface RelatorioFuncionario {
  funcionario: Pick<Funcionario, "id" | "nome" | "funcao" | "ativo">;
  total: number;
  concluidas: number;
  atrasos: number;
  ajudaPedida: number;
}

export interface ContagemPorStatus {
  total: number;
  [status: string]: number;
}

export interface RelatorioProgramasSST {
  treinamentos: ContagemPorStatus;
  inspecoes: ContagemPorStatus;
  auditorias: ContagemPorStatus;
  achados: ContagemPorStatus;
  planosAcao: ContagemPorStatus;
  rotasSeguras: ContagemPorStatus;
}

export interface RelatorioData {
  periodo: RelatorioPeriodo;
  tarefas: RelatorioTarefas;
  porFuncionario: RelatorioFuncionario[];
  programasSST: RelatorioProgramasSST;
}
