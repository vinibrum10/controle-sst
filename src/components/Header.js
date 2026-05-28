export function Header({ title, todayLabel }) {
  return `
    <header class="topbar">
      <div class="topbar-title">
        <button class="icon-button sidebar-toggle" type="button" id="sidebarToggle" aria-label="Ocultar lateral" aria-expanded="true" title="Ocultar lateral">
          <svg><use href="#icon-sidebar"></use></svg>
        </button>
        <div>
          <p class="eyebrow" id="todayLabel">${todayLabel || ""}</p>
          <h1 id="pageTitle">${title}</h1>
        </div>
      </div>
    </header>
  `;
}
