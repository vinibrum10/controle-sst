import { $, $$ } from "./utils/dom.js";
import { getState, setState } from "./state/store.js";
import { formatLongDate } from "./utils/format.js";
import { restoreSession } from "./hooks/useAuth.js";
import { initAuthPage } from "./pages/auth.js";
import {
  renderSidebarNavigation,
  applyNavGroupState,
  applySidebarState,
  loadSidebarState,
  toggleSidebar,
  toggleNavGroup
} from "./components/sidebar.js";
import { registerViewRenderer, bindNavigation, syncRouteFromHash } from "./router.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderExecucaoPage } from "./pages/execucao.js";
import { renderCriarTarefaPage } from "./pages/criarTarefa.js";
import { renderFuncionariosPage } from "./pages/funcionarios.js";
import { renderApoioAjudaPage } from "./pages/apoioAjuda.js";
import { renderDadosPage } from "./pages/dadosPrograma.js";
import { renderConfiguracoesPage } from "./pages/configuracoes.js";

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initSidebar();
  registerViewRenderers();
  bindNavigation();
  bindGlobalWeekFilter();

  $("#todayLabel").textContent = formatLongDate(new Date());
  $("#globalWeekFilter").value = getState().filtros.semana;

  const usuario = await restoreSession();
  if (usuario) {
    iniciarApp();
  } else {
    initAuthPage(iniciarApp);
  }
});

function iniciarApp() {
  $("#authOverlay").classList.add("hidden");
  syncRouteFromHash();
}

function initTheme() {
  const savedTheme = localStorage.getItem("sst-theme");
  if (savedTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");

  const themeBtn = $("#themeToggle");
  if (!themeBtn) return;

  if (savedTheme === "dark") themeBtn.querySelector("use").setAttribute("href", "#icon-sun");

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
}

function initSidebar() {
  renderSidebarNavigation();
  applyNavGroupState();
  applySidebarState(loadSidebarState());

  $("#sidebarToggle").addEventListener("click", toggleSidebar);
  $$("[data-nav-group-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleNavGroup(button.dataset.navGroupToggle));
  });
}

function registerViewRenderers() {
  registerViewRenderer("dashboard", renderDashboardPage);
  registerViewRenderer("execution", renderExecucaoPage);
  registerViewRenderer("create-task", renderCriarTarefaPage);
  registerViewRenderer("employees", renderFuncionariosPage);
  registerViewRenderer("help", renderApoioAjudaPage);
  registerViewRenderer("data", renderDadosPage);
  registerViewRenderer("settings", renderConfiguracoesPage);
}

function bindGlobalWeekFilter() {
  $("#globalWeekFilter").addEventListener("change", (event) => {
    const semana = event.target.value || getState().filtros.semana;
    setState({ filtros: { ...getState().filtros, semana } });
    syncRouteFromHash();
  });
}
