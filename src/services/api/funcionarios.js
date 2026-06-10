import { apiFetch } from "./client.js";

export function listarFuncionarios() {
  return apiFetch("/funcionarios");
}

export function criarFuncionario(dados) {
  return apiFetch("/funcionarios", { method: "POST", body: dados });
}

export function atualizarFuncionario(id, dados) {
  return apiFetch(`/funcionarios/${id}`, { method: "PUT", body: dados });
}

export function alternarStatusFuncionario(id, ativo) {
  return apiFetch(`/funcionarios/${id}/status`, { method: "PATCH", body: { ativo } });
}

export function excluirFuncionario(id) {
  return apiFetch(`/funcionarios/${id}`, { method: "DELETE" });
}
