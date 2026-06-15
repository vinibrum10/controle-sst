import type { DashboardMetrics } from "../types/dashboard";
import type { QuickAccessLink } from "../components/home/QuickAccessCard";

export type DashboardWidgetTipo = "metric" | "link";

export interface DashboardWidgetInfo {
  id: string;
  titulo: string;
  tipo: DashboardWidgetTipo;
}

// Lista de widgets configuraveis da pagina Inicio. Deve refletir
// server/utils/dashboardWidgets.js (titulos e ids).
export const DASHBOARD_WIDGETS: DashboardWidgetInfo[] = [
  { id: "metric_tarefasAtivas", titulo: "Tarefas ativas", tipo: "metric" },
  { id: "metric_concluidas", titulo: "Concluídas na semana", tipo: "metric" },
  { id: "metric_vencidas", titulo: "Vencidas", tipo: "metric" },
  { id: "metric_entregasNoPrazoPercent", titulo: "Entregas no prazo", tipo: "metric" },
  { id: "metric_prazoEm3Dias", titulo: "Vencem em até 3 dias", tipo: "metric" },
  { id: "metric_pedidosAjuda", titulo: "Pedidos de apoio na semana", tipo: "metric" },
  { id: "link_dashboard", titulo: "Dashboard", tipo: "link" },
  { id: "link_tarefas", titulo: "Tarefas da Equipe", tipo: "link" },
  { id: "link_rotaSegura", titulo: "Rota Segura", tipo: "link" },
  { id: "link_treinamentos", titulo: "Treinamentos", tipo: "link" },
  { id: "link_inspecoes", titulo: "Inspeções", tipo: "link" },
  { id: "link_funcionarios", titulo: "Funcionários", tipo: "link" },
  { id: "link_ajuda", titulo: "Apoio / Ajuda", tipo: "link" }
];

// Visibilidade assumida quando o usuario nao salvou preferencias (mesmos
// valores de "visivelPadrao" em server/utils/dashboardWidgets.js).
export const VISIBILIDADE_PADRAO: Record<string, boolean> = {
  metric_tarefasAtivas: true,
  metric_concluidas: true,
  metric_vencidas: true,
  metric_entregasNoPrazoPercent: true,
  metric_prazoEm3Dias: false,
  metric_pedidosAjuda: false,
  link_dashboard: true,
  link_tarefas: true,
  link_rotaSegura: true,
  link_treinamentos: true,
  link_inspecoes: true,
  link_funcionarios: true,
  link_ajuda: true
};

export interface SummaryCardData {
  label: string;
  value: string | number;
  hint: string;
}

// Converte um widget do tipo "metric" nos dados exibidos pelo SummaryCard,
// usando os indicadores da semana retornados por /api/dashboard.
export function buildSummaryCard(id: string, metrics: DashboardMetrics): SummaryCardData | null {
  switch (id) {
    case "metric_tarefasAtivas":
      return { label: "Tarefas ativas", value: metrics.tarefasAtivas, hint: "pendentes ou em andamento" };
    case "metric_concluidas":
      return { label: "Concluídas na semana", value: metrics.concluidas, hint: "entregas registradas" };
    case "metric_vencidas":
      return {
        label: "Vencidas",
        value: metrics.vencidas,
        hint: metrics.vencidas ? "precisam de atenção" : "sem atraso aberto"
      };
    case "metric_entregasNoPrazoPercent":
      return { label: "Entregas no prazo", value: `${metrics.entregasNoPrazoPercent}%`, hint: "da semana atual" };
    case "metric_prazoEm3Dias":
      return { label: "Vencem em até 3 dias", value: metrics.prazoEm3Dias, hint: "fique atento aos prazos" };
    case "metric_pedidosAjuda":
      return { label: "Pedidos de apoio", value: metrics.pedidosAjuda, hint: "registrados na semana" };
    default:
      return null;
  }
}

export const QUICK_LINKS_BY_ID: Record<string, QuickAccessLink> = {
  link_dashboard: { to: "/dashboard", label: "Dashboard", description: "Indicadores gerais de todos os programas de SST.", icon: "icon-dashboard" },
  link_tarefas: { to: "/dashboard/tarefas", label: "Tarefas da Equipe", description: "Plano semanal, carga por pessoa e status das tarefas.", icon: "icon-task" },
  link_rotaSegura: { to: "/dashboard/rota-segura", label: "Rota Segura", description: "Ranking, avaliações de APR e penalidades das equipes.", icon: "icon-shield" },
  link_treinamentos: { to: "/dashboard/treinamentos", label: "Treinamentos", description: "Status, vencimentos e indicadores de treinamentos.", icon: "icon-graduation-cap" },
  link_inspecoes: { to: "/dashboard/inspecoes", label: "Inspeções", description: "Inspeções, auditorias e achados em aberto.", icon: "icon-alert" },
  link_funcionarios: { to: "/funcionarios", label: "Funcionários", description: "Cadastro, carga de trabalho e gestão da equipe.", icon: "icon-team" },
  link_ajuda: { to: "/ajuda", label: "Apoio / Ajuda", description: "Solicitações de apoio entre os membros da equipe.", icon: "icon-help" }
};
