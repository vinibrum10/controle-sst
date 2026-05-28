const STORAGE_KEY = "controle-sst-v1";
const SIDEBAR_STORAGE_KEY = "controle-sst-sidebar";
const NAV_GROUP_STORAGE_KEY = "controle-sst-nav-groups";

// =============================================
// MICROSOFT GRAPH API — ONEDRIVE INTEGRATION
// =============================================
const MSAL_CLIENT_ID  = "998ff7bb-ac15-438d-811c-44cf38478de3";
const EXCEL_FILE_PATH = "3.0 Profissional/controle-sst.xlsx";
const GRAPH_BASE      = "https://graph.microsoft.com/v1.0";
const LOGIN_SCOPES    = ["Files.ReadWrite", "User.Read"];

let msalInstance = null;
let graphToken   = null;
let isOnlineMode = false;
let syncTimer    = null;
let currentUser  = null;

function initMSAL() {
  if (typeof msal === "undefined") return null;
  return new msal.PublicClientApplication({
    auth: {
      clientId:    MSAL_CLIENT_ID,
      authority:   "https://login.microsoftonline.com/common",
      redirectUri: window.location.origin
    },
    cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false }
  });
}

async function acquireToken() {
  if (!msalInstance) return null;
  const accounts = msalInstance.getAllAccounts();
  if (!accounts.length) return null;
  try {
    const res = await msalInstance.acquireTokenSilent({ scopes: LOGIN_SCOPES, account: accounts[0] });
    return res.accessToken;
  } catch {
    try {
      const res = await msalInstance.acquireTokenPopup({ scopes: LOGIN_SCOPES });
      return res.accessToken;
    } catch { return null; }
  }
}

function graphUrl(sheetPath) {
  const encoded = EXCEL_FILE_PATH.replace(/ /g, "%20");
  return `${GRAPH_BASE}/me/drive/root:/${encoded}:/workbook/worksheets${sheetPath}`;
}

async function graphGet(url) {
  const token = await acquireToken();
  if (!token) throw new Error("sem token");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Graph GET ${res.status}`);
  return res.json();
}

async function graphPatch(url, body) {
  const token = await acquireToken();
  if (!token) throw new Error("sem token");
  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Graph PATCH ${res.status}`);
  return res.json();
}

function rowToPerson(row) {
  if (!row[0] || String(row[0]).trim() === "") return null;
  return {
    id:       String(row[0]),
    name:     String(row[1] || ""),
    role:     String(row[2] || ""),
    email:    String(row[3] || ""),
    capacity: Number(row[4]) || 32,
    photo:    String(row[10] || "")
  };
}

function rowToTask(row) {
  if (!row[0] || String(row[0]).trim() === "") return null;
  return {
    id:             String(row[0]),
    title:          String(row[1] || ""),
    ownerId:        row[2] ? String(row[2]) : null,
    helperId:       row[4] ? String(row[4]) : null,
    week:           String(row[6] || ""),
    dueDate:        String(row[7] || ""),
    type:           String(row[8] || "eventual"),
    routinePeriod:  String(row[9] || ""),
    priority:       String(row[10] || "media"),
    estimatedHours: Number(row[11]) || 4,
    status:         String(row[12] || "pendente"),
    description:    String(row[13] || ""),
    createdAt:      String(row[14] || ""),
    completedAt:    row[15] ? String(row[15]) : null,
    helpRequestLog: []
  };
}

function personToRow(p) {
  const load = personLoad(p.id, filters.week);
  return [
    p.id, p.name, p.role, p.email, p.capacity,
    tasksForWeek(filters.week).filter(t => t.ownerId === p.id && !isDone(t)).length,
    tasksForWeek(filters.week).filter(t => t.helperId === p.id && !isDone(t)).length,
    completedOnTimeCount(p.id),
    delayedCount(p.id),
    helpRequestCount(p.id),
    p.photo || ""
  ];
}

function taskToRow(t) {
  const owner  = personById(t.ownerId);
  const helper = personById(t.helperId);
  return [
    t.id, t.title,
    t.ownerId || "",  owner  ? owner.name  : "",
    t.helperId || "", helper ? helper.name : "",
    t.week, t.dueDate, t.type, t.routinePeriod || "",
    t.priority, t.estimatedHours, t.status,
    t.description || "", t.createdAt || "", t.completedAt || "",
    getHelpLog(t).length
  ];
}

async function loadFromExcel() {
  setSyncBar("Carregando dados da OneDrive...", "loading");
  try {
    const [pessoasRes, tarefasRes] = await Promise.all([
      graphGet(graphUrl("('Pessoas')/usedRange")),
      graphGet(graphUrl("('Tarefas')/usedRange"))
    ]);

    const people = (pessoasRes.values || []).slice(1).map(rowToPerson).filter(Boolean);
    const tasks  = (tarefasRes.values || []).slice(1).map(rowToTask).filter(Boolean);

    if (people.length > 0 || tasks.length > 0) {
      state.people = people;
      state.tasks  = tasks;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      render();
      setSyncBar(`Dados sincronizados — ${people.length} pessoas, ${tasks.length} tarefas ✓`, "success");
    } else {
      // Planilha vazia, escreve os dados de demo nela
      setSyncBar("Planilha vazia. Salvando dados iniciais na OneDrive...", "loading");
      await writeToExcel();
      setSyncBar("Planilha inicializada na OneDrive ✓", "success");
    }
  } catch (err) {
    console.error("loadFromExcel:", err);
    setSyncBar("Erro ao ler OneDrive. Usando dados locais.", "error");
  }
}

async function writeToExcel() {
  if (!isOnlineMode) return;
  try {
    // Escreve Pessoas (max 100 linhas)
    const pRows = state.people.map(personToRow);
    while (pRows.length < 100) pRows.push(Array(11).fill(""));
    await graphPatch(graphUrl("('Pessoas')/range(address='A2:K101')"), { values: pRows });

    // Escreve Tarefas (max 500 linhas)
    const tRows = state.tasks.map(taskToRow);
    while (tRows.length < 500) tRows.push(Array(17).fill(""));
    await graphPatch(graphUrl("('Tarefas')/range(address='A2:Q501')"), { values: tRows });

    setSyncBar("Salvo no OneDrive ✓", "success");
  } catch (err) {
    console.error("writeToExcel:", err);
    setSyncBar("Erro ao salvar no OneDrive. Dados mantidos localmente.", "error");
  }
}

function scheduleSyncToExcel() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(writeToExcel, 2000);
}

function setSyncBar(msg, type) {
  const bar = $("#syncBar");
  if (!bar) return;
  bar.textContent = msg;
  bar.className = `sync-bar show ${type}`;
  if (type === "success") setTimeout(() => bar.classList.remove("show"), 3500);
}

function hideAuthOverlay() {
  const overlay = $("#authOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function updateUserChip(name) {
  const sidebar = $(".sidebar");
  if (!sidebar) return;
  let chip = $("#userChip");
  if (!chip) {
    chip = document.createElement("button");
    chip.id = "userChip";
    chip.className = "auth-user-info";
    chip.title = "Clique para sair da conta";
    sidebar.appendChild(chip);
  }
  chip.innerHTML = `<span class="avatar small">${initials(name)}</span> <span>${escapeHtml(name)}</span>`;
  chip.onclick = async () => {
    if (!confirm(`Sair da conta de ${name}?`)) return;
    await msalInstance.logoutPopup();
    isOnlineMode = false;
    chip.remove();
    $("#authOverlay").classList.remove("hidden");
  };
}


const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const DEFAULT_ROUTE = "/dashboard";
const NAVIGATION_GROUPS = [
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
const NAV_ROUTES = Object.fromEntries(
  NAVIGATION_GROUPS.flatMap((group) => group.items.map((item) => [item.route, { ...item, group: group.id }]))
);

let state = loadState();
let filters = {
  status: "ativas",
  owner: "todos",
  type: "todos",
  week: currentWeekValue()
};
let personPhotoData = "";

document.addEventListener("DOMContentLoaded", async () => {
  // Dark mode
  const savedTheme = localStorage.getItem("sst-theme");
  if (savedTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  const themeBtn = $("#themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("sst-theme", "light");
        themeBtn.querySelector("use").setAttribute("href", "#icon-moon");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("sst-theme", "dark");
        themeBtn.querySelector("use").setAttribute("href", "#icon-sun");
      }
    });
    if (savedTheme === "dark") themeBtn.querySelector("use").setAttribute("href", "#icon-sun");
  }

  // Inicializa o app com dados locais (rápido)
  setInitialFormValues();
  applySidebarState(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed");
  renderSidebarNavigation();
  applyNavGroupState();
  bindEvents();
  render();
  syncRouteFromHash();

  // Inicializa MSAL e verifica se já há sessão ativa
  msalInstance = initMSAL();
  if (!msalInstance) {
    // Biblioteca não carregou (offline?) — modo local
    hideAuthOverlay();
    return;
  }

  try {
    await msalInstance.initialize();
    // Trata possível redirect de login
    await msalInstance.handleRedirectPromise();
  } catch (e) { console.warn("MSAL init:", e); }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    // Já logado — entra direto
    currentUser  = accounts[0];
    isOnlineMode = true;
    hideAuthOverlay();
    updateUserChip(currentUser.name || currentUser.username);
    await loadFromExcel();
  } else {
    // Mostra tela de login
    const loginBtn = $("#loginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", async () => {
        loginBtn.textContent = "Entrando...";
        loginBtn.disabled = true;
        try {
          const res = await msalInstance.loginPopup({ scopes: LOGIN_SCOPES });
          currentUser  = res.account;
          isOnlineMode = true;
          hideAuthOverlay();
          updateUserChip(currentUser.name || currentUser.username);
          await loadFromExcel();
        } catch (err) {
          console.error("Login:", err);
          loginBtn.textContent = "Entrar com conta Microsoft";
          loginBtn.disabled = false;
          setSyncBar("Erro no login. Tente novamente.", "error");
        }
      });
    }

    const offlineBtn = $("#offlineModeBtn");
    if (offlineBtn) {
      offlineBtn.addEventListener("click", () => {
        isOnlineMode = false;
        hideAuthOverlay();
      });
    }
  }
});

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return demoState();

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.people) || !Array.isArray(parsed.tasks)) {
      return demoState();
    }
    return normalizeState(parsed);
  } catch {
    return demoState();
  }
}

function normalizeState(nextState) {
  nextState.people = nextState.people.map((person) => ({
    ...person,
    email: person.email || "",
    photo: person.photo || ""
  }));

  nextState.tasks = nextState.tasks.map((task) => ({
    ...task,
    routinePeriod: task.type === "rotineira" ? task.routinePeriod || "semanal" : "",
    helpRequestLog: getHelpLog(task)
  }));

  return nextState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleSyncToExcel(); // sincroniza com OneDrive em modo online
}

function demoState() {
  const week = currentWeekValue();
  return {
    people: [
      { id: id(), name: "Ana Paula", role: "Técnica de Segurança", email: "ana.paula@empresa.com.br", capacity: 32, photo: "" },
      { id: id(), name: "Bruno Reis", role: "Engenheiro de Segurança", email: "bruno.reis@empresa.com.br", capacity: 30, photo: "" },
      { id: id(), name: "Carla Nunes", role: "Analista SST", email: "carla.nunes@empresa.com.br", capacity: 28, photo: "" },
      { id: id(), name: "Diego Martins", role: "Técnico de Segurança", email: "diego.martins@empresa.com.br", capacity: 32, photo: "" }
    ],
    tasks: [
      {
        id: id(),
        title: "Inspeção semanal da produção",
        ownerId: null,
        helperId: null,
        week,
        dueDate: shiftDate(2),
        type: "rotineira",
        routinePeriod: "semanal",
        priority: "alta",
        estimatedHours: 6,
        status: "em_andamento",
        description: "Checklist de máquinas, sinalização, rotas de fuga e registros fotográficos.",
        createdAt: shiftDate(-2),
        completedAt: null,
        helpRequestLog: []
      },
      {
        id: id(),
        title: "Atualizar matriz de treinamentos",
        ownerId: null,
        helperId: null,
        week,
        dueDate: shiftDate(4),
        type: "rotineira",
        routinePeriod: "mensal",
        priority: "media",
        estimatedHours: 5,
        status: "pendente",
        description: "Conferir vencimentos de NR-35, NR-33, integração e reciclagens.",
        createdAt: shiftDate(-1),
        completedAt: null,
        helpRequestLog: []
      },
      {
        id: id(),
        title: "Investigar quase acidente na expedição",
        ownerId: null,
        helperId: null,
        week,
        dueDate: shiftDate(-1),
        type: "eventual",
        routinePeriod: "",
        priority: "critica",
        estimatedHours: 7,
        status: "em_andamento",
        description: "Levantar causa raiz, ações corretivas e responsáveis por bloqueios.",
        createdAt: shiftDate(-5),
        completedAt: null,
        helpRequestLog: []
      },
      {
        id: id(),
        title: "Enviar indicadores mensais de SST",
        ownerId: null,
        helperId: null,
        week,
        dueDate: shiftDate(-2),
        type: "rotineira",
        routinePeriod: "mensal",
        priority: "media",
        estimatedHours: 4,
        status: "concluida",
        description: "Consolidar taxa de frequência, gravidade, ações vencidas e treinamentos.",
        createdAt: shiftDate(-7),
        completedAt: shiftDate(-2),
        helpRequestLog: []
      },
      {
        id: id(),
        title: "Avaliar mudança de layout do almoxarifado",
        ownerId: null,
        helperId: null,
        week,
        dueDate: shiftDate(5),
        type: "eventual",
        routinePeriod: "",
        priority: "alta",
        estimatedHours: 8,
        status: "pendente",
        description: "Verificar fluxo, empilhamento, extintores, ergonomia e isolamento.",
        createdAt: shiftDate(0),
        completedAt: null,
        helpRequestLog: []
      }
    ]
  };
}

function hydrateDemoAssignments() {
  if (state.people.length < 4) return;
  const [ana, bruno, carla, diego] = state.people;
  const assignments = [ana.id, bruno.id, ana.id, carla.id, bruno.id];
  state.tasks.forEach((task, index) => {
    if (!task.ownerId) task.ownerId = assignments[index] || ana.id;
    if (index === 2 && !task.helperId) {
      task.helperId = diego.id;
      task.helpRequestLog = [
        {
          requestedBy: task.ownerId,
          assignedTo: diego.id,
          requestedAt: shiftDate(-1),
          taskTitle: task.title
        }
      ];
    }
  });
}

function bindEvents() {
  $$("[data-nav-group-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleNavGroup(button.dataset.navGroupToggle));
  });

  $$(".nav-button[data-route]").forEach((button) => {
    button.addEventListener("click", () => navigateToRoute(button.dataset.route));
  });

  $$("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => navigateToView(button.dataset.viewShortcut));
  });

  window.addEventListener("hashchange", syncRouteFromHash);

  $("#globalWeekFilter").addEventListener("change", (event) => {
    filters.week = event.target.value || currentWeekValue();
    $("#taskWeek").value = filters.week;
    render();
  });

  const statusFilterEl = $("#statusFilter");
  if (statusFilterEl) {
    statusFilterEl.addEventListener("change", (event) => {
      filters.status = event.target.value;
      renderTaskList();
    });
  }

  $("#ownerFilter").addEventListener("change", (event) => {
    filters.owner = event.target.value;
    renderTaskList();
  });

  $("#typeFilter").addEventListener("change", (event) => {
    filters.type = event.target.value;
    renderTaskList();
  });

  $("#taskForm").addEventListener("submit", addTask);
  $("#personForm").addEventListener("submit", addPerson);
  $("#helpForm").addEventListener("submit", requestHelpFromForm);
  $("#taskType").addEventListener("change", toggleRoutinePeriodField);
  $("#personPhoto").addEventListener("change", handlePersonPhotoChange);
  $("#sidebarToggle").addEventListener("click", toggleSidebar);
  $("#exportData").addEventListener("click", exportData);
  $("#importDataButton").addEventListener("click", () => $("#importData").click());
  $("#importData").addEventListener("change", importData);
  $("#resetData").addEventListener("click", resetDemo);
}

function renderSidebarNavigation() {
  const nav = $("#sidebarNav");
  if (!nav) return;

  nav.innerHTML = NAVIGATION_GROUPS.map((group) => `
    <div class="nav-section ${group.defaultOpen ? "open" : ""}" data-nav-group="${group.id}">
      <button class="nav-group-toggle" type="button" aria-expanded="${String(group.defaultOpen)}" aria-controls="nav-${group.id}" data-nav-group-toggle="${group.id}">
        <span><svg><use href="#${group.icon}"></use></svg>${escapeHtml(group.label)}</span>
        <svg class="chevron"><use href="#icon-chevron"></use></svg>
      </button>
      <div class="nav-sublist" id="nav-${group.id}">
        ${group.items.map((item) => `
          <button class="nav-button" type="button" data-view="${item.view}" data-route="${item.route}">
            ${escapeHtml(item.label)}
          </button>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function setInitialFormValues() {
  hydrateDemoAssignments();
  saveState();

  $("#todayLabel").textContent = formatLongDate(new Date());
  $("#globalWeekFilter").value = filters.week;
  $("#taskWeek").value = filters.week;
  $("#taskDueDate").value = shiftDate(2);
  toggleRoutinePeriodField();
}

function render() {
  renderPeopleOptions();
  renderMetrics();
  renderWorkload();
  renderCharts();
  renderRankings();
  renderTaskList();
  renderPeople();
  renderHelp();
}

function renderPeopleOptions() {
  const ownerSelect = $("#taskOwner");
  const ownerFilter = $("#ownerFilter");

  ownerSelect.innerHTML = state.people
    .map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`)
    .join("");

  ownerFilter.innerHTML = [
    `<option value="todos">Todos os responsáveis</option>`,
    ...state.people.map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`)
  ].join("");

  ownerFilter.value = filters.owner;
}

function renderMetrics() {
  const tasks = tasksForWeek(filters.week);
  const active = tasks.filter((task) => !isDone(task));
  const overdue = active.filter(isTaskLate);
  const done = tasks.filter(isDone);
  const dueSoon = active.filter((task) => daysUntil(task.dueDate) >= 0 && daysUntil(task.dueDate) <= 3);
  const helpRequests = tasks.reduce((sum, task) => sum + getHelpLog(task).length, 0);
  const onTimeRate = done.length
    ? Math.round((done.filter(wasOnTime).length / done.length) * 100)
    : 0;

  const cards = [
    ["Tarefas ativas", active.length, `${done.length} concluídas na semana`],
    ["Vencidas", overdue.length, overdue.length ? "precisam de atenção" : "sem atraso aberto"],
    ["Prazo em 3 dias", dueSoon.length, "entregas próximas"],
    ["Entregas no prazo", `${onTimeRate}%`, `${helpRequests} pedidos de ajuda`]
  ];

  $("#metricGrid").innerHTML = cards
    .map(([label, value, hint]) => `
      <article class="metric-card">
        <span>${label}</span>
        <strong>${value}</strong>
        <small>${hint}</small>
      </article>
    `)
    .join("");
}

function renderWorkload() {
  const rows = state.people.map((person) => {
    const load = personLoad(person.id, filters.week);
    const percent = Math.min(Math.round((load / person.capacity) * 100), 140);
    const fillClass = percent >= 100 ? "danger" : percent >= 80 ? "warn" : "";
    const support = availabilityLabel(person, load);

    return `
      <article class="workload-row">
        <header>
          <div>
            <strong>${escapeHtml(person.name)}</strong>
            <span class="muted">${escapeHtml(person.role)}</span>
          </div>
          <span class="badge">${load}h de ${person.capacity}h</span>
        </header>
        <div class="bar-track" aria-label="Carga de ${escapeHtml(person.name)}">
          <div class="bar-fill ${fillClass}" style="width: ${Math.min(percent, 100)}%"></div>
        </div>
        <small class="muted">${support}</small>
      </article>
    `;
  });

  $("#workloadList").innerHTML = rows.join("") || emptyState("Cadastre pessoas para acompanhar a carga.");
}

function renderCharts() {
  const tasks = tasksForWeek(filters.week);
  const counts = {
    pendente: tasks.filter((task) => task.status === "pendente" && !isTaskLate(task)).length,
    em_andamento: tasks.filter((task) => task.status === "em_andamento" && !isTaskLate(task)).length,
    atrasada: tasks.filter((task) => !isDone(task) && isTaskLate(task)).length,
    concluida: tasks.filter(isDone).length
  };
  const max = Math.max(...Object.values(counts), 1);
  const labels = {
    pendente: "Pendentes",
    em_andamento: "Em andamento",
    atrasada: "Atrasadas",
    concluida: "Concluídas"
  };
  const colors = {
    pendente: "var(--amber)",
    em_andamento: "var(--blue)",
    atrasada: "var(--red)",
    concluida: "var(--green)"
  };

  $("#statusChart").innerHTML = Object.entries(counts)
    .map(([key, value]) => `
      <div class="chart-row">
        <span>${labels[key]}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${(value / max) * 100}%; background: ${colors[key]}"></div>
        </div>
        <strong>${value}</strong>
      </div>
    `)
    .join("");

  const routine = tasks.filter((task) => task.type === "rotineira").length;
  const eventual = tasks.filter((task) => task.type === "eventual").length;
  $("#typeChart").innerHTML = `
    <article class="type-tile">
      <span class="badge rotineira">Rotineiras</span>
      <strong>${routine}</strong>
      <small class="muted">tarefas recorrentes</small>
    </article>
    <article class="type-tile">
      <span class="badge eventual">Eventuais</span>
      <strong>${eventual}</strong>
      <small class="muted">demandas pontuais</small>
    </article>
  `;
}

function renderRankings() {
  renderRanking("#helpRanking", rankByHelpRequests(), "pedido(s)");
  renderRanking("#onTimeRanking", rankByOnTime(), "no prazo");
  renderRanking("#delayRanking", rankByDelay(), "atraso(s)");
}

function renderRanking(selector, ranking, suffix) {
  const html = ranking
    .map(({ person, value }, index) => `
      <article class="ranking-item">
        <span class="badge">${index + 1}</span>
        ${personAvatar(person, "small")}
        <div>
          <strong>${escapeHtml(person.name)}</strong>
          <span class="muted">${escapeHtml(person.role)}</span>
        </div>
        <strong>${value} ${suffix}</strong>
      </article>
    `)
    .join("");

  $(selector).innerHTML = html || emptyState("Sem dados suficientes.");
}

function personAvatar(person, size = "small") {
  const photo = String(person?.photo || "");
  if (photo.startsWith("data:image/")) {
    return `<img class="avatar ${size}" src="${photo}" alt="Foto de ${escapeHtml(person.name)}">`;
  }

  return `<span class="avatar ${size}" aria-hidden="true">${initials(person?.name || "?")}</span>`;
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function renderTaskList() {
  const tasks = filteredTasks();

  // Kanban view
  if ($("#col-pendente")) {
    const byStatus = { pendente: [], em_andamento: [], concluida: [] };
    tasks.forEach(t => {
      const key = isDone(t) ? "concluida" : (t.status === "em_andamento" ? "em_andamento" : "pendente");
      byStatus[key].push(t);
    });
    // Also catch late tasks that are not done
    tasksForWeek(filters.week)
      .filter(t => !isDone(t) && !tasks.includes(t))
      .forEach(t => byStatus[t.status === "em_andamento" ? "em_andamento" : "pendente"].push(t));

    $("#col-pendente").innerHTML    = byStatus.pendente.map(taskCard).join("")    || emptyState("Nenhuma tarefa pendente.");
    $("#col-em_andamento").innerHTML = byStatus.em_andamento.map(taskCard).join("") || emptyState("Nenhuma tarefa em andamento.");
    $("#col-concluida").innerHTML    = byStatus.concluida.map(taskCard).join("")    || emptyState("Nenhuma tarefa concluída.");
    $("#count-pendente").textContent     = byStatus.pendente.length;
    $("#count-em_andamento").textContent  = byStatus.em_andamento.length;
    $("#count-concluida").textContent     = byStatus.concluida.length;
    bindKanbanDnD();
    return;
  }

  // Fallback list view
  $("#taskList").innerHTML = tasks.map(taskCard).join("") || emptyState("Nenhuma tarefa encontrada para os filtros.");
}

function taskCard(task) {
  const owner = personById(task.ownerId);
  const helper = personById(task.helperId);
  const late = isTaskLate(task);
  const progressLabel = task.status === "em_andamento" ? "Pausar" : "Iniciar";
  const statusBadge = isDone(task)
    ? `<span class="badge done">Concluída</span>`
    : late
      ? `<span class="badge late">Atrasada</span>`
      : `<span class="badge">${statusLabel(task.status)}</span>`;
  const dueLabel = late && !isDone(task) ? "Venceu" : "Prazo";
  const routineBadge = task.type === "rotineira"
    ? `<span class="badge routine-period">${routinePeriodLabel(task.routinePeriod)}</span>`
    : "";

  return `
    <article class="task-card" draggable="true" data-task-id="${task.id}">
      <div>
        <div class="task-title-row">
          <h3>${escapeHtml(task.title)}</h3>
          ${statusBadge}
          <span class="badge ${task.type}">${typeLabel(task.type)}</span>
          ${routineBadge}
          <span class="badge ${task.priority}">${priorityLabel(task.priority)}</span>
        </div>
        <div class="task-meta">
          <span class="badge">${escapeHtml(owner?.name || "Sem responsável")}</span>
          <span class="badge due">${dueLabel}: ${formatDate(task.dueDate)}</span>
          <span class="badge">${task.estimatedHours}h</span>
          ${helper ? `<span class="badge">Apoio: ${escapeHtml(helper.name)}</span>` : ""}
        </div>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
      </div>
      <div class="task-actions">
        <button class="icon-button" type="button" title="Alternar andamento" onclick="toggleTaskProgress('${task.id}')" ${isDone(task) ? "disabled" : ""}>
          <svg><use href="#icon-clock"></use></svg>
          ${progressLabel}
        </button>
        <button class="icon-button help" type="button" title="Pedir ajuda automática" onclick="requestHelp('${task.id}')" ${isDone(task) ? "disabled" : ""}>
          <svg><use href="#icon-help"></use></svg>
          Solicitar apoio
        </button>
        <button class="icon-button danger" type="button" title="Excluir tarefa" onclick="deleteTask('${task.id}')">
          <svg><use href="#icon-trash"></use></svg>
          Excluir
        </button>
        <button class="icon-button success" type="button" title="Concluir ou reabrir tarefa" onclick="toggleTaskDone('${task.id}')">
          <svg><use href="#icon-check"></use></svg>
          ${isDone(task) ? "Reabrir tarefa" : "Marcar concluída"}
        </button>
      </div>
    </article>
  `;
}

function renderPeople() {
  const cards = state.people.map((person) => {
    const load = personLoad(person.id, filters.week);
    const onTime = completedOnTimeCount(person.id);
    const delayed = delayedCount(person.id);
    const help = helpRequestCount(person.id);
    const ownedTasks = tasksForWeek(filters.week).filter((task) => task.ownerId === person.id && !isDone(task));
    const helpingTasks = tasksForWeek(filters.week).filter((task) => task.helperId === person.id && !isDone(task));

    return `
      <article class="person-card">
        <header>
          <div class="person-heading">
            ${personAvatar(person, "large")}
            <div>
              <strong>${escapeHtml(person.name)}</strong>
              <span class="muted">${escapeHtml(person.role)}</span>
              <span class="muted">${escapeHtml(person.email || "E-mail não cadastrado")}</span>
            </div>
          </div>
          <span class="badge">${load}/${person.capacity}h</span>
        </header>
        <div class="bar-track">
          <div class="bar-fill ${load > person.capacity ? "danger" : load >= person.capacity * 0.8 ? "warn" : ""}" style="width: ${Math.min((load / person.capacity) * 100, 100)}%"></div>
        </div>
        <div class="person-stats">
          <div><span>Abertas</span><strong>${ownedTasks.length}</strong></div>
          <div><span>Ajudando</span><strong>${helpingTasks.length}</strong></div>
          <div><span>Livre</span><strong>${Math.max(person.capacity - load, 0)}h</strong></div>
        </div>
        <div class="person-stats">
          <div><span>No prazo</span><strong>${onTime}</strong></div>
          <div><span>Atrasos</span><strong>${delayed}</strong></div>
          <div><span>Ajuda pedida</span><strong>${help}</strong></div>
        </div>
        ${renderPersonAssignments(ownedTasks, helpingTasks)}
      </article>
    `;
  });

  $("#peopleGrid").innerHTML = cards.join("") || emptyState("Nenhuma pessoa cadastrada.");
}

function renderPersonAssignments(ownedTasks, helpingTasks) {
  const groups = [];
  if (ownedTasks.length) groups.push(renderPersonTaskGroup("Responsável", ownedTasks, "responsavel"));
  if (helpingTasks.length) groups.push(renderPersonTaskGroup("Ajudando", helpingTasks, "helping"));

  return `
    <div class="person-assignments">
      ${groups.join("") || `<div class="person-task-empty">Sem tarefa aberta na semana selecionada.</div>`}
    </div>
  `;
}

function renderPersonTaskGroup(label, tasks, variant) {
  return `
    <div class="person-task-group">
      <span>${label}</span>
      ${tasks.map((task) => renderPersonTaskItem(task, label, variant)).join("")}
    </div>
  `;
}

function renderPersonTaskItem(task, label, variant) {
  const late = isTaskLate(task);
  const owner = personById(task.ownerId);
  const helper = personById(task.helperId);
  const supportText = variant === "helping"
    ? `Apoiando: ${owner?.name || "responsável"}`
    : helper
      ? `Apoio solicitado: ${helper.name}`
      : "";
  return `
    <div class="person-task-item ${variant}">
      <span class="badge ${variant === "helping" ? "helping" : task.type}">${escapeHtml(supportText ? supportText : label)}</span>
      <strong>${escapeHtml(task.title)}</strong>
      <small class="${late ? "late-text" : "muted"}">${late ? "Venceu" : "Prazo"}: ${formatDate(task.dueDate)} - ${task.estimatedHours}h</small>
    </div>
  `;
}

function renderHelp() {
  const activeTasks = tasksForWeek(filters.week).filter((task) => !isDone(task));
  $("#helpTaskSelect").innerHTML = activeTasks
    .map((task) => {
      const owner = personById(task.ownerId);
      return `<option value="${task.id}">${escapeHtml(task.title)} - ${escapeHtml(owner?.name || "sem responsável")} - ${formatDate(task.dueDate)}</option>`;
    })
    .join("");

  const availability = state.people
    .map((person) => ({ person, load: personLoad(person.id, filters.week) }))
    .sort((a, b) => (b.person.capacity - b.load) - (a.person.capacity - a.load));

  $("#availabilityList").innerHTML = availability.map(({ person, load }) => {
    const free = Math.max(person.capacity - load, 0);
    const label = load === 0 ? "Vazio" : free > 0 ? `${free}h livres` : "Sem folga";
    return `
      <article class="availability-item">
        <header>
          <div class="person-heading compact">
            ${personAvatar(person, "small")}
            <div>
              <strong>${escapeHtml(person.name)}</strong>
              <span class="muted">${escapeHtml(person.role)}</span>
            </div>
          </div>
          <span class="badge">${label}</span>
        </header>
        <div class="bar-track">
          <div class="bar-fill ${load > person.capacity ? "danger" : load >= person.capacity * 0.8 ? "warn" : ""}" style="width: ${Math.min((load / person.capacity) * 100, 100)}%"></div>
        </div>
      </article>
    `;
  }).join("") || emptyState("Cadastre pessoas para distribuir ajuda.");

  const history = allHelpEvents();
  $("#helpHistory").innerHTML = history.map((event) => {
    const requester = personById(event.requestedBy);
    const helper = personById(event.assignedTo);
    return `
      <article class="history-item">
        <header>
          <div>
            <strong>${escapeHtml(event.taskTitle || "Tarefa")}</strong>
            <span class="muted">${formatDate(event.requestedAt)} - ${escapeHtml(requester?.name || "Solicitante")}</span>
          </div>
          <span class="badge">Apoio: ${escapeHtml(helper?.name || "não definido")}</span>
        </header>
      </article>
    `;
  }).join("") || emptyState("Nenhum pedido de ajuda registrado.");
}

function addTask(event) {
  event.preventDefault();
  const title = $("#taskTitle").value.trim();
  const ownerId = $("#taskOwner").value;
  const week = $("#taskWeek").value || filters.week;
  const dueDate = $("#taskDueDate").value;
  const estimatedHours = Number($("#taskHours").value);

  if (!title || !ownerId || !dueDate || !estimatedHours) {
    showToast("Preencha os campos obrigatórios da tarefa.");
    return;
  }

  state.tasks.unshift({
    id: id(),
    title,
    ownerId,
    helperId: null,
    week,
    dueDate,
    type: $("#taskType").value,
    routinePeriod: $("#taskType").value === "rotineira" ? $("#taskRoutinePeriod").value : "",
    priority: $("#taskPriority").value,
    estimatedHours,
    status: "pendente",
    description: $("#taskDescription").value.trim(),
    createdAt: todayValue(),
    completedAt: null,
    helpRequestLog: []
  });

  filters.week = week;
  $("#globalWeekFilter").value = week;
  event.target.reset();
  $("#taskWeek").value = week;
  $("#taskDueDate").value = shiftDate(2);
  $("#taskHours").value = 4;
  toggleRoutinePeriodField();

  saveState();
  render();
  navigateToView("execution");
  notifyTaskAssigned(state.tasks[0]);
  showToast("Tarefa adicionada ao plano semanal.");
}

function addPerson(event) {
  event.preventDefault();
  const name = $("#personName").value.trim();
  const role = $("#personRole").value.trim();
  const email = $("#personEmail").value.trim();
  const capacity = Number($("#personCapacity").value);

  if (!name || !role || !email || !capacity) {
    showToast("Preencha nome, função, e-mail e capacidade.");
    return;
  }

  state.people.push({ id: id(), name, role, email, capacity, photo: personPhotoData });
  event.target.reset();
  $("#personCapacity").value = 32;
  personPhotoData = "";
  renderPhotoPreview();

  saveState();
  render();
  showToast("Pessoa adicionada à equipe.");
}

async function handlePersonPhotoChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    personPhotoData = "";
    renderPhotoPreview();
    return;
  }

  try {
    personPhotoData = await resizePersonPhoto(file);
    renderPhotoPreview();
  } catch {
    personPhotoData = "";
    event.target.value = "";
    renderPhotoPreview();
    showToast("Não consegui carregar essa imagem. Tente outra foto.");
  }
}

function renderPhotoPreview() {
  const preview = $("#personPhotoPreview");
  preview.innerHTML = personPhotoData
    ? `<img class="avatar large" src="${personPhotoData}" alt="Prévia da foto"><span>Foto carregada</span>`
    : "<span>Sem foto</span>";
}

function resizePersonPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Arquivo inválido"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const size = 160;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;

        const side = Math.min(image.width, image.height);
        const sourceX = (image.width - side) / 2;
        const sourceY = (image.height - side) / 2;
        context.drawImage(image, sourceX, sourceY, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function requestHelpFromForm(event) {
  event.preventDefault();
  const taskId = $("#helpTaskSelect").value;
  if (taskId) requestHelp(taskId);
}

function requestHelp(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || isDone(task)) return;

  const helper = chooseHelper(task);
  if (!helper) {
    showSupportResult("Nenhuma pessoa com capacidade livre foi encontrada para essa semana.");
    showToast("Sem apoio disponível na semana selecionada.");
    return;
  }

  task.helperId = helper.id;
  task.status = "em_andamento";
  task.helpRequestLog = getHelpLog(task);
  task.helpRequestLog.push({
    requestedBy: task.ownerId,
    assignedTo: helper.id,
    requestedAt: todayValue(),
    taskTitle: task.title
  });

  saveState();
  render();
  const owner = personById(task.ownerId);
  const message = `${helper.name} foi designado para apoiar ${owner?.name || "a pessoa responsável"} na tarefa "${task.title}", com prazo em ${formatDate(task.dueDate)}.`;
  showSupportResult(message);
  notifyHelpAssigned(task, helper, owner);
  showToast("Ajuda atribuída automaticamente.");
}

function notifyTaskAssigned(task) {
  const owner = personById(task.ownerId);
  if (!owner?.email) {
    showToast("Tarefa criada. Cadastre o e-mail do responsável para enviar aviso.");
    return;
  }

  openEmailDraft(
    owner.email,
    `Nova tarefa atribuída: ${task.title}`,
    [
      `Olá, ${owner.name}.`,
      "",
      "Uma tarefa foi atribuída para você no Controle SST.",
      "",
      `Tarefa: ${task.title}`,
      `Tipo: ${typeLabel(task.type)}${task.type === "rotineira" ? ` (${routinePeriodLabel(task.routinePeriod)})` : ""}`,
      `Prazo: ${formatDate(task.dueDate)}`,
      `Horas estimadas: ${task.estimatedHours}h`,
      task.description ? `Observações: ${task.description}` : "",
      "",
      "Acesse o sistema para acompanhar e atualizar o andamento."
    ].filter(Boolean).join("\n")
  );
}

function notifyHelpAssigned(task, helper, owner) {
  if (!helper?.email) {
    showToast("Apoio atribuído. Cadastre o e-mail de quem vai ajudar para enviar aviso.");
    return;
  }

  openEmailDraft(
    helper.email,
    `Pedido de apoio: ${task.title}`,
    [
      `Olá, ${helper.name}.`,
      "",
      `${owner?.name || "Uma pessoa da equipe"} solicitou seu apoio em uma tarefa de SST.`,
      "",
      `Tarefa: ${task.title}`,
      `Responsável: ${owner?.name || "Não informado"}`,
      `Tipo: ${typeLabel(task.type)}${task.type === "rotineira" ? ` (${routinePeriodLabel(task.routinePeriod)})` : ""}`,
      `Prazo: ${formatDate(task.dueDate)}`,
      `Horas estimadas: ${task.estimatedHours}h`,
      "",
      "Acesse o sistema para alinhar a execução do apoio."
    ].join("\n")
  );
}

function openEmailDraft(to, subject, body) {
  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

function chooseHelper(task) {
  const candidates = state.people
    .filter((person) => person.id !== task.ownerId)
    .map((person) => {
      const load = personLoad(person.id, task.week);
      const free = person.capacity - load;
      const overdue = tasksForWeek(task.week).some((item) => item.ownerId === person.id && !isDone(item) && isTaskLate(item));
      return { person, load, free, overdue };
    })
    .filter((item) => item.free > 0 && !item.overdue);

  const empty = candidates
    .filter((item) => item.load === 0)
    .sort((a, b) => b.free - a.free);

  if (empty.length) return empty[0].person;

  return candidates
    .sort((a, b) => b.free - a.free || a.load - b.load)[0]?.person || null;
}

function toggleTaskDone(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  if (isDone(task)) {
    task.status = "em_andamento";
    task.completedAt = null;
    showToast("Tarefa reaberta.");
  } else {
    task.status = "concluida";
    task.completedAt = todayValue();
    showToast("Tarefa concluída.");
  }

  saveState();
  render();
}

function toggleTaskProgress(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || isDone(task)) return;
  task.status = task.status === "em_andamento" ? "pendente" : "em_andamento";
  saveState();
  render();
  showToast("Status da tarefa atualizado.");
}

function deleteTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (!confirm(`Excluir a tarefa "${task.title}"?`)) return;

  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  saveState();
  render();
  showToast("Tarefa excluída.");
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `controle-sst-${todayValue()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.people) || !Array.isArray(parsed.tasks)) {
        throw new Error("Formato inválido");
      }
      state = parsed;
      saveState();
      render();
      showToast("Dados importados.");
    } catch {
      showToast("Arquivo inválido. Exporte um JSON pelo próprio programa.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function resetDemo() {
  if (!confirm("Restaurar os dados de demonstração? Os dados atuais serão substituídos.")) return;
  state = demoState();
  hydrateDemoAssignments();
  saveState();
  render();
  showToast("Dados de demonstração restaurados.");
}

function navigateToRoute(route) {
  const nextRoute = NAV_ROUTES[route] ? route : DEFAULT_ROUTE;
  const nextHash = `#${nextRoute}`;
  if (window.location.hash === nextHash) {
    syncRouteFromHash();
    return;
  }
  window.location.hash = nextHash;
}

function navigateToView(view) {
  navigateToRoute(routeForView(view));
}

function syncRouteFromHash() {
  let route = window.location.hash.replace(/^#/, "") || DEFAULT_ROUTE;
  if (!route.startsWith("/")) route = `/${route}`;
  if (!NAV_ROUTES[route]) route = DEFAULT_ROUTE;

  if (window.location.hash !== `#${route}`) {
    history.replaceState(null, "", `#${route}`);
  }

  switchView(NAV_ROUTES[route].view, route);
}

function switchView(view, route = routeForView(view)) {
  const routeConfig = NAV_ROUTES[route] || NAV_ROUTES[DEFAULT_ROUTE];

  $$(".nav-button[data-route]").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === route);
  });
  $$("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
  $$(".nav-section").forEach((section) => {
    section.classList.toggle("active", Boolean(section.querySelector(".nav-button.active")));
  });

  const pageTitle = $("#pageTitle");
  if (pageTitle) pageTitle.textContent = routeConfig.title;
  openNavGroup(routeConfig.group);
}

function routeForView(view) {
  return Object.entries(NAV_ROUTES).find(([, config]) => config.view === view)?.[0] || DEFAULT_ROUTE;
}

function applyNavGroupState() {
  const saved = readNavGroupState();
  $$(".nav-section").forEach((section) => {
    const group = section.dataset.navGroup;
    const open = Object.prototype.hasOwnProperty.call(saved, group)
      ? saved[group]
      : section.classList.contains("open");
    setNavGroupState(group, open, false);
  });
}

function toggleNavGroup(group) {
  const section = $(`[data-nav-group="${group}"]`);
  if (!section) return;
  setNavGroupState(group, !section.classList.contains("open"));
}

function openNavGroup(group) {
  setNavGroupState(group, true);
}

function setNavGroupState(group, open, persist = true) {
  const section = $(`[data-nav-group="${group}"]`);
  if (!section) return;
  section.classList.toggle("open", open);
  const button = section.querySelector("[data-nav-group-toggle]");
  if (button) button.setAttribute("aria-expanded", String(open));

  if (persist) {
    const nextState = readNavGroupState();
    nextState[group] = open;
    localStorage.setItem(NAV_GROUP_STORAGE_KEY, JSON.stringify(nextState));
  }
}

function readNavGroupState() {
  try {
    return JSON.parse(localStorage.getItem(NAV_GROUP_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function toggleRoutinePeriodField() {
  const isRoutine = $("#taskType").value === "rotineira";
  $("#routinePeriodField").classList.toggle("hidden", !isRoutine);
  $("#taskRoutinePeriod").disabled = !isRoutine;
}

function toggleSidebar() {
  const shell = $(".app-shell");
  const collapsed = !shell.classList.contains("sidebar-collapsed");
  applySidebarState(collapsed);
  localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "collapsed" : "expanded");
}

function applySidebarState(collapsed) {
  $(".app-shell").classList.toggle("sidebar-collapsed", collapsed);
  const button = $("#sidebarToggle");
  button.setAttribute("aria-expanded", String(!collapsed));
  button.setAttribute("aria-label", collapsed ? "Abrir lateral" : "Ocultar lateral");
  button.title = collapsed ? "Abrir lateral" : "Ocultar lateral";
}

function filteredTasks() {
  return tasksForWeek(filters.week)
    .filter((task) => {
      if (filters.status === "ativas" && isDone(task)) return false;
      if (filters.status === "atrasada" && (!isTaskLate(task) || isDone(task))) return false;
      if (!["ativas", "todas", "atrasada"].includes(filters.status) && task.status !== filters.status) return false;
      if (filters.owner !== "todos" && task.ownerId !== filters.owner) return false;
      if (filters.type !== "todos" && task.type !== filters.type) return false;
      return true;
    })
    .sort((a, b) => {
      if (isTaskLate(a) !== isTaskLate(b)) return isTaskLate(a) ? -1 : 1;
      return dateValue(a.dueDate) - dateValue(b.dueDate);
    });
}

function tasksForWeek(week) {
  return state.tasks.filter((task) => (task.week || weekFromDate(task.dueDate)) === week);
}

function personLoad(personId, week) {
  return tasksForWeek(week)
    .filter((task) => !isDone(task))
    .filter((task) => task.ownerId === personId || task.helperId === personId)
    .reduce((sum, task) => sum + Number(task.estimatedHours || 0), 0);
}

function rankByHelpRequests() {
  return rankPeople((personId) => helpRequestCount(personId));
}

function rankByOnTime() {
  return rankPeople((personId) => completedOnTimeCount(personId));
}

function rankByDelay() {
  return rankPeople((personId) => delayedCount(personId));
}

function rankPeople(scoreFn) {
  return state.people
    .map((person) => ({ person, value: scoreFn(person.id) }))
    .sort((a, b) => b.value - a.value || a.person.name.localeCompare(b.person.name, "pt-BR"))
    .slice(0, 5);
}

function completedOnTimeCount(personId) {
  return state.tasks.filter((task) => task.ownerId === personId && isDone(task) && wasOnTime(task)).length;
}

function delayedCount(personId) {
  return state.tasks.filter((task) => {
    if (task.ownerId !== personId) return false;
    if (isDone(task)) return !wasOnTime(task);
    return isTaskLate(task);
  }).length;
}

function helpRequestCount(personId) {
  return state.tasks.reduce((sum, task) => (
    sum + getHelpLog(task).filter((event) => event.requestedBy === personId).length
  ), 0);
}

function allHelpEvents() {
  return state.tasks
    .flatMap((task) => getHelpLog(task).map((event) => ({ ...event, taskTitle: event.taskTitle || task.title })))
    .sort((a, b) => dateValue(b.requestedAt) - dateValue(a.requestedAt));
}

function getHelpLog(task) {
  return Array.isArray(task.helpRequestLog) ? task.helpRequestLog : [];
}

function personById(personId) {
  return state.people.find((person) => person.id === personId);
}

function isDone(task) {
  return task.status === "concluida";
}

function isTaskLate(task) {
  return !isDone(task) && dateValue(task.dueDate) < startOfToday().getTime();
}

function wasOnTime(task) {
  if (!task.completedAt) return false;
  return dateValue(task.completedAt) <= endOfDate(task.dueDate).getTime();
}

function daysUntil(date) {
  const diff = dateValue(date) - startOfToday().getTime();
  return Math.ceil(diff / 86400000);
}

function availabilityLabel(person, load) {
  if (load === 0) return "Sem tarefa aberta na semana selecionada.";
  const free = person.capacity - load;
  if (free > 0) return `${free}h livres para apoio.`;
  return "Capacidade semanal comprometida.";
}

function statusLabel(status) {
  return {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    concluida: "Concluída"
  }[status] || status;
}

function typeLabel(type) {
  return type === "rotineira" ? "Rotineira" : "Eventual";
}

function routinePeriodLabel(period) {
  return {
    semanal: "Semanal",
    mensal: "Mensal",
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual"
  }[period] || "Semanal";
}

function priorityLabel(priority) {
  return {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    critica: "Crítica"
  }[priority] || priority;
}

function showSupportResult(message) {
  const element = $("#supportResult");
  element.textContent = message;
  element.classList.add("active");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function emptyState(message) {
  return `<div class="empty-state">${message}</div>`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function currentWeekValue() {
  return weekFromDate(todayValue());
}

function weekFromDate(value) {
  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function todayValue() {
  return toDateInputValue(new Date());
}

function shiftDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDate(value) {
  const date = new Date(`${value}T23:59:59`);
  return date;
}

function dateValue(value) {
  return new Date(`${value}T12:00:00`).getTime();
}

function id() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.requestHelp = requestHelp;
window.toggleTaskDone = toggleTaskDone;
window.toggleTaskProgress = toggleTaskProgress;
window.deleteTask = deleteTask;

// =============================================
// KANBAN DRAG AND DROP
// =============================================
let _draggedTaskId = null;

function bindKanbanDnD() {
  $$(".task-card[draggable]").forEach(card => {
    card.addEventListener("dragstart", (e) => {
      _draggedTaskId = card.dataset.taskId;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      _draggedTaskId = null;
      $$(".kanban-column").forEach(c => c.classList.remove("drag-over"));
    });
  });

  $$(".kanban-column").forEach(col => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");
      if (!_draggedTaskId) return;
      const newStatus = col.dataset.status;
      const task = state.tasks.find(t => t.id === _draggedTaskId);
      if (task && task.status !== newStatus) {
        task.status = newStatus;
        task.completedAt = newStatus === "concluida" ? todayValue() : null;
        saveState();
        render();
        showToast("Tarefa movida para " + statusLabel(newStatus) + ".");
      }
    });
  });
}
