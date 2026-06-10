// Estrutura de navegacao da barra lateral. Cada item aponta para uma rota
// (usada no hash da URL) e para uma "view" (painel exibido no conteudo).

export const DEFAULT_ROUTE = "/dashboard";

export const NAVIGATION_GROUPS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "icon-dashboard",
    defaultOpen: true,
    items: [
      { route: "/dashboard", view: "dashboard", label: "Visão geral", title: "Plano semanal da equipe de SST" }
    ]
  },
  {
    id: "tasks",
    label: "Gestão de Tarefas",
    icon: "icon-task",
    defaultOpen: true,
    items: [
      { route: "/tarefas/executar", view: "execution", label: "Execução de tarefas", title: "Execução de tarefas" },
      { route: "/tarefas/criar", view: "create-task", label: "Criação de tarefas", title: "Criação de tarefas" },
      { route: "/tarefas/apoio", view: "help", label: "Apoio e ajuda", title: "Apoio e ajuda" }
    ]
  },
  {
    id: "team",
    label: "Equipe",
    icon: "icon-team",
    defaultOpen: true,
    items: [
      { route: "/equipe/funcionarios", view: "employees", label: "Cadastro de funcionários", title: "Equipe e cadastro" }
    ]
  },
  {
    id: "programs",
    label: "Programas de SST",
    icon: "icon-check",
    defaultOpen: false,
    items: [
      { route: "/programas/rota-segura", view: "program-route", label: "Rota Segura", title: "Rota Segura" },
      { route: "/programas/treinamentos", view: "program-training", label: "Treinamentos", title: "Treinamentos" },
      { route: "/programas/inspecoes", view: "program-inspections", label: "Inspeções e auditorias", title: "Inspeções e auditorias" }
    ]
  },
  {
    id: "admin",
    label: "Administração",
    icon: "icon-database",
    defaultOpen: false,
    items: [
      { route: "/admin/dados", view: "data", label: "Dados do programa", title: "Dados do programa" },
      { route: "/admin/configuracoes", view: "settings", label: "Configurações", title: "Configurações" }
    ]
  }
];

export const NAV_ROUTES = Object.fromEntries(
  NAVIGATION_GROUPS.flatMap((group) => group.items.map((item) => [item.route, { ...item, group: group.id }]))
);
