import { apiFetch } from "./api";
import type { ImportResultado } from "../types/dados";

export function exportarDados() {
  return apiFetch<unknown>("/dados/exportar");
}

export function importarDados(payload: unknown) {
  return apiFetch<ImportResultado>("/dados/importar", { method: "POST", body: payload });
}

export function restaurarDemo() {
  return apiFetch<{ mensagem: string }>("/dados/restaurar-demo", { method: "POST" });
}
