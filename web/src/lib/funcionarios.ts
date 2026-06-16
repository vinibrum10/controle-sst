import { apiFetch } from "./api";
import type { Funcionario } from "../types/funcionario";

export interface NovoFuncionario {
  nome: string;
  funcao: string;
  email: string;
  foto?: string | null;
}

export function listarFuncionarios() {
  return apiFetch<Funcionario[]>("/funcionarios");
}

export function criarFuncionario(dados: NovoFuncionario) {
  return apiFetch<Funcionario>("/funcionarios", { method: "POST", body: dados });
}

export function atualizarFuncionario(id: string, dados: Partial<Funcionario>) {
  return apiFetch<Funcionario>(`/funcionarios/${id}`, { method: "PUT", body: dados });
}

export function alternarAtivoFuncionario(id: string, ativo: boolean) {
  return apiFetch<Funcionario>(`/funcionarios/${id}/status`, { method: "PATCH", body: { ativo } });
}

export function removerFuncionario(id: string) {
  return apiFetch<null>(`/funcionarios/${id}`, { method: "DELETE" });
}
