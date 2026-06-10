// Funcoes utilitarias de data, texto e formatacao usadas pelas paginas e
// componentes do Controle SST.

export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(value));
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayValue() {
  return toDateInputValue(new Date());
}

export function shiftDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDate(value) {
  return new Date(`${value}T23:59:59`);
}

export function dateValue(value) {
  if (!value) return 0;
  // Aceita tanto "AAAA-MM-DD" quanto strings ISO completas (vindas do banco).
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  return new Date(normalized).getTime();
}

export function daysUntil(value) {
  const diff = dateValue(value) - startOfToday().getTime();
  return Math.ceil(diff / 86400000);
}

export function currentWeekValue() {
  return weekFromDate(todayValue());
}

export function weekFromDate(value) {
  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

// Converte uma data (string "AAAA-MM-DD" ou ISO) para o valor aceito por
// um <input type="date">.
export function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}
