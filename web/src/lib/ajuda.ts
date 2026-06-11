import { apiFetch } from "./api";
import type { ResultadoAjuda } from "../types/ajuda";

export function solicitarAjuda(tarefaId: string) {
  return apiFetch<ResultadoAjuda>("/ajuda/solicitar", { method: "POST", body: { tarefaId } });
}
