// Sprite SVG com os icones usados no layout, portado de index.html (front-end vanilla).
export function IconSprite() {
  return (
    <svg className="hidden" aria-hidden="true" focusable="false">
      <symbol id="icon-dashboard" viewBox="0 0 24 24">
        <path d="M4 13h6v7H4zM14 4h6v16h-6zM4 4h6v5H4z"></path>
      </symbol>
      <symbol id="icon-task" viewBox="0 0 24 24">
        <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"></path>
      </symbol>
      <symbol id="icon-team" viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
        <circle cx="9.5" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
      </symbol>
      <symbol id="icon-help" viewBox="0 0 24 24">
        <path d="M12 18h.01"></path>
        <path d="M9.1 9a3 3 0 1 1 4.9 2.3c-.9.56-1.5 1.24-1.5 2.7"></path>
        <circle cx="12" cy="12" r="10"></circle>
      </symbol>
      <symbol id="icon-plus" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14"></path>
      </symbol>
      <symbol id="icon-check" viewBox="0 0 24 24">
        <path d="m20 6-11 11-5-5"></path>
      </symbol>
      <symbol id="icon-sidebar" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
        <path d="M9 4v16M13 9l3 3-3 3"></path>
      </symbol>
      <symbol id="icon-database" viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="8" ry="3"></ellipse>
        <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"></path>
        <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"></path>
      </symbol>
      <symbol id="icon-moon" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </symbol>
      <symbol id="icon-sun" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5"></circle>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
      </symbol>
      <symbol id="icon-chevron" viewBox="0 0 24 24">
        <path d="m6 9 6 6 6-6"></path>
      </symbol>
      <symbol id="icon-logout" viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <path d="M16 17l5-5-5-5"></path>
        <path d="M21 12H9"></path>
      </symbol>
    </svg>
  );
}

export function Icon({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg
      className={`w-[18px] h-[18px] shrink-0 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
      aria-hidden="true"
    >
      <use href={`#${id}`}></use>
    </svg>
  );
}
