import { apiFetch } from "./client.js";

export function listarDisponibilidade(semana) {
  return apiFetch(`/ajuda/disponibilidade?semana=${encodeURIComponent(semana)}`);
}

export function listarHistoricoAjuda() {
  return apiFetch("/ajuda/historico");
}

export function solicitarAjuda(tarefaId) {
  return apiFetch("/ajuda/solicitar", { method: "POST", body: { tarefaId } });
}
