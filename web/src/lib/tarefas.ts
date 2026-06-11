import { apiFetch } from "./api";
import type { NovaTarefa, Tarefa } from "../types/tarefa";

export function criarTarefa(dados: NovaTarefa) {
  return apiFetch<Tarefa>("/tarefas", { method: "POST", body: dados });
}
