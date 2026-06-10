import { apiFetch } from "./client.js";

export function exportarDados() {
  return apiFetch("/dados/exportar");
}

export function importarDados(payload) {
  return apiFetch("/dados/importar", { method: "POST", body: payload });
}

export function restaurarDemo() {
  return apiFetch("/dados/restaurar-demo", { method: "POST" });
}
