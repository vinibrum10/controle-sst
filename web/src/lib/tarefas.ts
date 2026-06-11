import { apiFetch } from "./api";
import type { NovaTarefa, StatusTarefa, Tarefa } from "../types/tarefa";

export interface TarefasFiltros {
  semana?: string;
  responsavelId?: string;
  tipo?: string;
  status?: string;
}

export function listarTarefas(filtros: TarefasFiltros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor && valor !== "todos") params.set(chave, valor);
  });
  const query = params.toString();
  return apiFetch<Tarefa[]>(`/tarefas${query ? `?${query}` : ""}`);
}

export function criarTarefa(dados: NovaTarefa) {
  return apiFetch<Tarefa>("/tarefas", { method: "POST", body: dados });
}

export function atualizarStatusTarefa(id: string, status: StatusTarefa) {
  return apiFetch<Tarefa>(`/tarefas/${id}/status`, { method: "PATCH", body: { status } });
}

export function excluirTarefa(id: string) {
  return apiFetch<null>(`/tarefas/${id}`, { method: "DELETE" });
}
