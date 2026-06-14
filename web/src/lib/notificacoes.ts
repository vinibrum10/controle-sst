import { apiFetch } from "./api";

export type TipoNotificacao = "TAREFA_ATRIBUIDA" | "APOIO_SOLICITADO" | "PERMISSAO_ALTERADA" | "TAREFA_PRAZO";

export interface NotificacaoItem {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  criadoEm: string;
}

export interface NotificacoesResponse {
  itens: NotificacaoItem[];
  naoLidas: number;
}

export function listarNotificacoes() {
  return apiFetch<NotificacoesResponse>("/notificacoes");
}

export function marcarNotificacaoLida(id: string) {
  return apiFetch<NotificacaoItem>(`/notificacoes/${id}/lida`, { method: "PATCH" });
}

export function marcarTodasNotificacoesLidas() {
  return apiFetch<{ ok: boolean }>("/notificacoes/marcar-todas-lidas", { method: "POST" });
}
