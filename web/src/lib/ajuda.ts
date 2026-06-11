import { apiFetch } from "./api";
import type { Disponibilidade, HistoricoAjudaItem, ResultadoAjuda } from "../types/ajuda";

export function solicitarAjuda(tarefaId: string) {
  return apiFetch<ResultadoAjuda>("/ajuda/solicitar", { method: "POST", body: { tarefaId } });
}

export function listarDisponibilidade(semana: string) {
  const params = new URLSearchParams();
  if (semana) params.set("semana", semana);
  const query = params.toString();
  return apiFetch<Disponibilidade[]>(`/ajuda/disponibilidade${query ? `?${query}` : ""}`);
}

export function listarHistoricoAjuda() {
  return apiFetch<HistoricoAjudaItem[]>("/ajuda/historico");
}
