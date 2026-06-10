import { apiFetch } from "./client.js";

export function obterDashboard(semana) {
  return apiFetch(`/dashboard?semana=${encodeURIComponent(semana)}`);
}
