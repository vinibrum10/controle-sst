export function Sidebar({ groups, activeRoute }) {
  return groups.map((group) => `
    <div class="nav-section ${group.defaultOpen ? "open" : ""}" data-nav-group="${group.id}">
      <button class="nav-group-toggle" type="button" aria-expanded="${String(group.defaultOpen)}" aria-controls="nav-${group.id}" data-nav-group-toggle="${group.id}">
        <span><svg><use href="#${group.icon}"></use></svg>${escapeHtml(group.label)}</span>
        <svg class="chevron"><use href="#icon-chevron"></use></svg>
      </button>
      <div class="nav-sublist" id="nav-${group.id}">
        ${group.items.map((item) => SidebarItem({ item, activeRoute })).join("")}
      </div>
    </div>
  `).join("");
}

export function SidebarItem({ item, activeRoute }) {
  return `
    <button class="nav-button ${item.route === activeRoute ? "active" : ""}" type="button" data-view="${item.view}" data-route="${item.route}">
      ${escapeHtml(item.label)}
    </button>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
