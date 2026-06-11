import { apiFetch } from "./api";
import type { Funcionario } from "../types/funcionario";

export function listarFuncionarios() {
  return apiFetch<Funcionario[]>("/funcionarios");
}
