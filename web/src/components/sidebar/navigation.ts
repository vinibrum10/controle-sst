export interface NavItem {
  path: string;
  label: string;
  title: string;
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
      { path: "/treinamentos", label: "Treinamentos", title: "Treinamentos" },
      { path: "/inspecoes", label: "Inspeções e Auditorias", title: "Inspeções e auditorias" },
    ],
  },
  {
    id: "admin",
    label: "Administração",
    icon: "icon-database",
    defaultOpen: false,
    items: [
      { path: "/dados", label: "Dados do programa", title: "Dados do programa" },
      { path: "/configuracoes", label: "Configurações", title: "Configurações" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAVIGATION_GROUPS.flatMap((group) => group.items);
