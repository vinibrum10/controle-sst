import { apiFetch } from "./api";
import type { DashboardData } from "../types/dashboard";
import { DASHBOARD_WIDGETS, VISIBILIDADE_PADRAO, type DashboardWidgetTipo } from "./dashboardWidgets";

export function obterDashboard(semana: string) {
  return apiFetch<DashboardData>(`/dashboard?semana=${encodeURIComponent(semana)}`);
}

export interface PreferenciaDashboardItem {
  id: string;
  titulo: string;
  tipo: DashboardWidgetTipo;
  visivel: boolean;
  ordem: number;
}

export function listarPreferenciasDashboard() {
  return apiFetch<PreferenciaDashboardItem[]>("/dashboard/preferencias");
}

export function atualizarPreferenciasDashboard(itens: { id: string; visivel: boolean; ordem: number }[]) {
  return apiFetch<PreferenciaDashboardItem[]>("/dashboard/preferencias", { method: "PUT", body: { itens } });
}

// Usado como preferencia inicial enquanto o GET /dashboard/preferencias nao retorna,
// para evitar que a pagina Inicio fique vazia durante o carregamento.
export function preferenciasPadraoDashboard(): PreferenciaDashboardItem[] {
  const contadores: Record<string, number> = {};
  return DASHBOARD_WIDGETS.map((widget) => {
    const ordem = contadores[widget.tipo] ?? 0;
    contadores[widget.tipo] = ordem + 1;
    return { id: widget.id, titulo: widget.titulo, tipo: widget.tipo, visivel: VISIBILIDADE_PADRAO[widget.id] ?? true, ordem };
  });
}
