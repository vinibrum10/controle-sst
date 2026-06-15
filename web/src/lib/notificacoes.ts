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

export interface PreferenciaNotificacaoItem {
  tipo: TipoNotificacao;
  titulo: string;
  inApp: boolean;
  email: boolean;
  emailDisponivel: boolean;
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

export interface StatusEmail {
  habilitado: boolean;
}

export function buscarStatusEmailNotificacao() {
  return apiFetch<StatusEmail>("/notificacoes/email-status");
}

export function listarPreferenciasNotificacao() {
  return apiFetch<PreferenciaNotificacaoItem[]>("/notificacoes/preferencias");
}

export function atualizarPreferenciasNotificacao(itens: { tipo: TipoNotificacao; inApp: boolean; email: boolean }[]) {
  return apiFetch<PreferenciaNotificacaoItem[]>("/notificacoes/preferencias", { method: "PUT", body: { itens } });
}
