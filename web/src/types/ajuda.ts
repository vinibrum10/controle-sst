import type { Funcionario } from "./funcionario";
import type { Tarefa } from "./tarefa";

export interface ResultadoAjuda {
  tarefa: Tarefa;
  ajudante: Funcionario;
  mensagem: string;
}
