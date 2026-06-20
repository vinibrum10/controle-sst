import type { Papel } from "../types";

export interface DashboardPanel {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  enabled: boolean;
  requiredRoles: Papel[];
  order: number;
  moduleKey: string;
}

export const DASHBOARD_PANELS: DashboardPanel[] = [
  {
    id: "atividades",
    title: "Gestão de Atividades",
    description: "Acompanhe atividades da equipe, OS Interliga e execução semanal dos técnicos.",
    route: "/tarefas/executar",
    icon: "icon-task",
    enabled: true,
    requiredRoles: ["ADMIN", "GESTOR", "TST", "COLABORADOR", "VISUALIZADOR"],
    order: 1,
    moduleKey: "atividades"
  },
  {
    id: "viagens",
    title: "Viagens",
    description: "Acompanhe viagens em andamento, deslocamentos finalizados e tempo total consumido.",
    route: "/tarefas/executar",
    icon: "icon-check",
    enabled: true,
    requiredRoles: ["ADMIN", "GESTOR", "TST", "COLABORADOR", "VISUALIZADOR"],
    order: 2,
    moduleKey: "viagens"
  },
  {
    id: "programas",
    title: "Programas de SST",
    description: "Acompanhe programas corporativos e seus indicadores.",
    route: "/programas",
    icon: "icon-shield",
    enabled: false,
    requiredRoles: ["ADMIN", "GESTOR"],
    order: 3,
    moduleKey: "programas"
  },
  {
    id: "capex",
    title: "CAPEX",
    description: "Acompanhe orçamento, execução e pendências de investimentos.",
    route: "/capex",
    icon: "icon-database",
    enabled: false,
    requiredRoles: ["ADMIN", "GESTOR"],
    order: 4,
    moduleKey: "capex"
  }
];

/** Retorna painéis ativos respeitando o papel do usuário. */
export function getPainelsVisiveis(panels: DashboardPanel[], papel: Papel): DashboardPanel[] {
  return panels
    .filter((p) => p.enabled && p.requiredRoles.includes(papel))
    .sort((a, b) => a.order - b.order);
}
