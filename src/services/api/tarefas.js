import { apiFetch } from "./client.js";

export function listarTarefas(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor && valor !== "todos") params.set(chave, valor);
  });
  const query = params.toString();
  return apiFetch(`/tarefas${query ? `?${query}` : ""}`);
}

export function criarTarefa(dados) {
  return apiFetch("/tarefas", { method: "POST", body: dados });
}

export function atualizarTarefa(id, dados) {
  return apiFetch(`/tarefas/${id}`, { method: "PUT", body: dados });
}

export function atualizarStatusTarefa(id, status) {
  return apiFetch(`/tarefas/${id}/status`, { method: "PATCH", body: { status } });
}

export function excluirTarefa(id) {
  return apiFetch(`/tarefas/${id}`, { method: "DELETE" });
}
