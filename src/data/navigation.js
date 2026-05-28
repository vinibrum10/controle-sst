export const defaultRoute = "/dashboard";

export const navigationGroups = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "icon-dashboard",
    defaultOpen: true,
    items: [
      { route: "/dashboard", view: "dashboard", label: "Visao geral", title: "Plano semanal da equipe de SST" }
    ]
  },
  {
    id: "tasks",
    label: "Gestao de Tarefas",
    icon: "icon-task",
    defaultOpen: true,
    items: [
      { route: "/tarefas/executar", view: "execution", label: "Execucao de tarefas", title: "Execucao de tarefas" },
      { route: "/tarefas/criar", view: "create-task", label: "Criacao de tarefas", title: "Criacao de tarefas" },
      { route: "/tarefas/apoio", view: "help", label: "Apoio e ajuda", title: "Apoio e ajuda" }
    ]
  },
  {
    id: "team",
    label: "Equipe",
    icon: "icon-team",
    defaultOpen: true,
    items: [
      { route: "/equipe/funcionarios", view: "employees", label: "Cadastro de funcionarios", title: "Equipe e cadastro" }
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
      { route: "/programas/inspecoes", view: "program-inspections", label: "Inspecoes e auditorias", title: "Inspecoes e auditorias" }
    ]
  },
  {
    id: "admin",
    label: "Administracao",
    icon: "icon-database",
    defaultOpen: false,
    items: [
      { route: "/admin/dados", view: "data", label: "Dados do programa", title: "Dados do programa" },
      { route: "/admin/configuracoes", view: "settings", label: "Configuracoes", title: "Configuracoes" }
    ]
  }
];

export const routeMap = Object.fromEntries(
  navigationGroups.flatMap((group) => group.items.map((item) => [item.route, { ...item, group: group.id }]))
);
