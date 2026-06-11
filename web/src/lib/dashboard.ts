import { apiFetch } from "./api";
import type { DashboardData } from "../types/dashboard";

export function obterDashboard(semana: string) {
  return apiFetch<DashboardData>(`/dashboard?semana=${encodeURIComponent(semana)}`);
}
