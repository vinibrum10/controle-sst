export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function weekFromDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function currentWeekValue(): string {
  return weekFromDate(toDateInputValue(new Date()));
}

export function weekStartDate(weekCode: string): Date {
  const [yearStr, weekStr] = weekCode.split("-W");
  const year = Number(yearStr);
  const week = Number(weekStr);
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dow + 1 + (week - 1) * 7);
  return monday;
}

export function formatWeekLabel(weekCode: string): string {
  if (!weekCode) return "";
  const monday = weekStartDate(weekCode);
  const weekOfMonth = Math.ceil(monday.getDate() / 7);
  const ordinals = ["1ª", "2ª", "3ª", "4ª", "5ª"];
  const ordinal = ordinals[weekOfMonth - 1] ?? `${weekOfMonth}ª`;
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(monday);
  const year = monday.getFullYear();
  return `${ordinal} semana de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
}

export function weekDayDate(weekCode: string, jsDay: number): string {
  const monday = weekStartDate(weekCode);
  const offset = jsDay === 0 ? 6 : jsDay - 1;
  const date = new Date(monday);
  date.setDate(monday.getDate() + offset);
  return toDateInputValue(date);
}

export function initials(name: string): string {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function shiftDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDate(value: string): Date {
  return new Date(`${value}T23:59:59`);
}

export function dateValue(value?: string | null): number {
  if (!value) return 0;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  return new Date(normalized).getTime();
}
