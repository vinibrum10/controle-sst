const STORAGE_KEY = "controle-sst-v1";
const SIDEBAR_STORAGE_KEY = "controle-sst-sidebar";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

let state = loadState();
let filters = {
  status: "ativas",
  owner: "todos",
  type: "todos",
  week: currentWeekValue()
};

document.addEventListener("DOMContentLoaded", () => {
  setInitialFormValues();
  applySidebarState(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed");
  bindEvents();
  render();
});

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return demoState();

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.people) || !Array.isArray(parsed.tasks)) {
      return demoState();
    }
    return parsed;
  } catch {
    return demoState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function demoState() {
  const week = currentWeekValue();
  return {
    people: [
      { id: id(), name: "Ana Paula", role: "Técnica de Segurança", capacity: 32 },
      { id: id(), name: "Bruno Reis", role: "Engenheiro de Segurança", capacity: 30 },
      { id: id(), name: "Carla Nunes", role: "Analista SST", capacity: 28 },
      { id: id(), name: "Diego Martins", role: "Técnico de Segurança", capacity: 32 }
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
  $$(".nav-button").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  $$("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.viewShortcut));
  });

  $("#globalWeekFilter").addEventListener("change", (event) => {
    filters.week = event.target.value || currentWeekValue();
    $("#taskWeek").value = filters.week;
    render();
  });

  $("#statusFilter").addEventListener("change", (event) => {
    filters.status = event.target.value;
    renderTaskList();
  });

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
  $("#sidebarToggle").addEventListener("click", toggleSidebar);
  $("#exportData").addEventListener("click", exportData);
  $("#importDataButton").addEventListener("click", () => $("#importData").click());
  $("#importData").addEventListener("change", importData);
  $("#resetData").addEventListener("click", resetDemo);
}

function setInitialFormValues() {
  hydrateDemoAssignments();
  saveState();

  $("#todayLabel").textContent = formatLongDate(new Date());
  $("#globalWeekFilter").value = filters.week;
  $("#taskWeek").value = filters.week;
  $("#taskDueDate").value = shiftDate(2);
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

function renderTaskList() {
  const tasks = filteredTasks();
  $("#taskList").innerHTML = tasks.map(taskCard).join("") || emptyState("Nenhuma tarefa encontrada para os filtros.");
}

function taskCard(task) {
  const owner = personById(task.ownerId);
  const helper = personById(task.helperId);
  const late = isTaskLate(task);
  const statusBadge = isDone(task)
    ? `<span class="badge done">Concluída</span>`
    : late
      ? `<span class="badge late">Atrasada</span>`
      : `<span class="badge">${statusLabel(task.status)}</span>`;
  const dueLabel = late && !isDone(task) ? "Venceu" : "Prazo";

  return `
    <article class="task-card">
      <div>
        <div class="task-title-row">
          <h3>${escapeHtml(task.title)}</h3>
          ${statusBadge}
          <span class="badge ${task.type}">${typeLabel(task.type)}</span>
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
        <button class="icon-button success" type="button" title="Concluir ou reabrir tarefa" onclick="toggleTaskDone('${task.id}')">
          <svg><use href="#icon-check"></use></svg>
          ${isDone(task) ? "Reabrir" : "Concluir"}
        </button>
        <button class="icon-button help" type="button" title="Pedir ajuda automática" onclick="requestHelp('${task.id}')" ${isDone(task) ? "disabled" : ""}>
          <svg><use href="#icon-help"></use></svg>
          Ajuda
        </button>
        <button class="icon-button" type="button" title="Alternar andamento" onclick="toggleTaskProgress('${task.id}')" ${isDone(task) ? "disabled" : ""}>
          <svg><use href="#icon-clock"></use></svg>
          Andamento
        </button>
        <button class="icon-button danger" type="button" title="Excluir tarefa" onclick="deleteTask('${task.id}')">
          <svg><use href="#icon-trash"></use></svg>
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
          <div>
            <strong>${escapeHtml(person.name)}</strong>
            <span class="muted">${escapeHtml(person.role)}</span>
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
  return `
    <div class="person-task-item ${variant}">
      <span class="badge ${variant === "helping" ? "helping" : task.type}">${label}</span>
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
          <div>
            <strong>${escapeHtml(person.name)}</strong>
            <span class="muted">${escapeHtml(person.role)}</span>
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

  saveState();
  render();
  showToast("Tarefa adicionada ao plano semanal.");
}

function addPerson(event) {
  event.preventDefault();
  const name = $("#personName").value.trim();
  const role = $("#personRole").value.trim();
  const capacity = Number($("#personCapacity").value);

  if (!name || !role || !capacity) {
    showToast("Preencha nome, função e capacidade.");
    return;
  }

  state.people.push({ id: id(), name, role, capacity });
  event.target.reset();
  $("#personCapacity").value = 32;

  saveState();
  render();
  showToast("Pessoa adicionada à equipe.");
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
  showToast("Ajuda atribuída automaticamente.");
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

function switchView(view) {
  $$(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $$("[data-view-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === view));
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
