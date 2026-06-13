import type { Funcionario } from "./funcionario";
import type { NotificacaoEmail, StatusPedidoAjuda, Tarefa } from "./tarefa";

export interface ResultadoAjuda {
  tarefa: Tarefa;
  ajudante: Funcionario;
  mensagem: string;
  notificacaoEmail?: NotificacaoEmail;
}

export interface Disponibilidade {
  funcionario: Funcionario;
  carga: number;
  livre: number;
}

export interface HistoricoAjudaItem {
  id: string;
  tarefa: { id: string; titulo: string; prazo: string } | null;
  solicitante: { id: string; nome: string; funcao: string } | null;
  atendente: { id: string; nome: string; funcao: string } | null;
  status: StatusPedidoAjuda;
  criadoEm: string;
  atendidoEm: string | null;
}
