import { $, $$ } from "../utils/dom.js";
import { escapeHtml } from "../utils/format.js";
import { NAVIGATION_GROUPS } from "../config/navigation.js";

const NAV_GROUP_STORAGE_KEY = "controle-sst-nav-groups";
const SIDEBAR_STORAGE_KEY = "controle-sst-sidebar";

export function renderSidebarNavigation() {
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

export function applyNavGroupState() {
  const saved = readNavGroupState();
  $$(".nav-section").forEach((section) => {
    const group = section.dataset.navGroup;
    const open = Object.prototype.hasOwnProperty.call(saved, group)
      ? saved[group]
      : section.classList.contains("open");
    setNavGroupState(group, open, false);
  });
}

export function toggleNavGroup(group) {
  const section = $(`[data-nav-group="${group}"]`);
  if (!section) return;
  setNavGroupState(group, !section.classList.contains("open"));
}

export function openNavGroup(group) {
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

export function toggleSidebar() {
  const shell = $(".app-shell");
  const collapsed = !shell.classList.contains("sidebar-collapsed");
  applySidebarState(collapsed);
  localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "collapsed" : "expanded");
}

export function applySidebarState(collapsed) {
  $(".app-shell").classList.toggle("sidebar-collapsed", collapsed);
  const button = $("#sidebarToggle");
  button.setAttribute("aria-expanded", String(!collapsed));
  button.setAttribute("aria-label", collapsed ? "Abrir lateral" : "Ocultar lateral");
  button.title = collapsed ? "Abrir lateral" : "Ocultar lateral";
}

export function loadSidebarState() {
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
}
