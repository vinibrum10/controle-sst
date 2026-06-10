// Roteamento simples baseado no hash da URL. Cada view registra uma
// funcao de renderizacao que e chamada sempre que o usuario navega ate ela.

import { $, $$ } from "./utils/dom.js";
import { NAV_ROUTES, DEFAULT_ROUTE } from "./config/navigation.js";
import { openNavGroup } from "./components/sidebar.js";

const renderers = {};

export function registerViewRenderer(view, fn) {
  renderers[view] = fn;
}

export function navigateToRoute(route) {
  const nextRoute = NAV_ROUTES[route] ? route : DEFAULT_ROUTE;
  const nextHash = `#${nextRoute}`;
  if (window.location.hash === nextHash) {
    syncRouteFromHash();
    return;
  }
  window.location.hash = nextHash;
}

export function navigateToView(view) {
  navigateToRoute(routeForView(view));
}

export function syncRouteFromHash() {
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

  const renderer = renderers[view];
  if (renderer) {
    Promise.resolve(renderer()).catch((err) => console.error(`Erro ao carregar a tela "${view}":`, err));
  }
}

function routeForView(view) {
  return Object.entries(NAV_ROUTES).find(([, config]) => config.view === view)?.[0] || DEFAULT_ROUTE;
}

export function bindNavigation() {
  $$(".nav-button[data-route]").forEach((button) => {
    button.addEventListener("click", () => navigateToRoute(button.dataset.route));
  });
  $$("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => navigateToView(button.dataset.viewShortcut));
  });
  window.addEventListener("hashchange", syncRouteFromHash);
}
