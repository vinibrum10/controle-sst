import type { Papel } from "../../types";

export interface NavItem {
  path: string;
  label: string;
  title: string;
  roles?: Papel[];
}

export interface NavGroup {
  id: string;
  label: string;
  icon: string;
  defaultOpen: boolean;
  items: NavItem[];
}

export const DEFAULT_PATH = "/dashboard";

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "icon-dashboard",
    defaultOpen: true,
    items: [{ path: "/dashboard", label: "Visão geral", title: "Plano semanal da equipe de SST" }],
  },
  {
    id: "tasks",
    label: "Gestão de Tarefas",
    icon: "icon-task",
    defaultOpen: true,
    items: [
      { path: "/tarefas/criar", label: "Criar tarefa", title: "Criação de tarefas" },
      { path: "/tarefas/executar", label: "Execução / Kanban", title: "Execução de tarefas" },
    ],
  },
  {
    id: "team",
    label: "Equipe",
    icon: "icon-team",
    defaultOpen: true,
    items: [
      { path: "/funcionarios", label: "Cadastro de funcionários", title: "Equipe e cadastro" },
      { path: "/ajuda", label: "Apoio / Ajuda", title: "Apoio e ajuda" },
    ],
  },
  {
    id: "programs",
    label: "Programas de SST",
    icon: "icon-check",
    defaultOpen: false,
    items: [
      { path: "/programas/rota-segura", label: "Rota Segura", title: "Rota Segura" },
      { path: "/treinamentos", label: "Treinamentos", title: "Treinamentos" },
      { path: "/inspecoes", label: "Inspeções e Auditorias", title: "Inspeções e auditorias" },
    ],
  },
  {
    id: "rota-segura-2026",
    label: "Rota Segura 2026",
    icon: "icon-check",
    defaultOpen: false,
    items: [
      { path: "/programas/rota-segura-2026", label: "Dashboard", title: "Rota Segura 2026 - Dashboard" },
      {
        path: "/programas/rota-segura-2026/configuracao",
        label: "Configuração da edição",
        title: "Rota Segura 2026 - Configuração da edição",
        roles: ["ADMIN"],
      },
      { path: "/programas/rota-segura-2026/equipes", label: "Equipes e colaboradores", title: "Rota Segura 2026 - Equipes e colaboradores" },
      { path: "/programas/rota-segura-2026/avaliacoes", label: "Avaliação de APR", title: "Rota Segura 2026 - Avaliação de APR" },
      { path: "/programas/rota-segura-2026/penalidades", label: "Penalidades", title: "Rota Segura 2026 - Penalidades" },
      { path: "/programas/rota-segura-2026/ranking", label: "Ranking", title: "Rota Segura 2026 - Ranking" },
    ],
  },
  {
    id: "admin",
    label: "Administração",
    icon: "icon-database",
    defaultOpen: false,
    items: [
      { path: "/relatorios", label: "Relatórios", title: "Relatórios" },
      { path: "/dados", label: "Dados do programa", title: "Dados do programa" },
      { path: "/usuarios", label: "Usuários", title: "Usuários", roles: ["ADMIN"] },
      { path: "/configuracoes", label: "Configurações", title: "Configurações" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAVIGATION_GROUPS.flatMap((group) => group.items);
