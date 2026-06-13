// Classes compartilhadas pelas telas do Rota Segura (mesmo padrao visual
// usado em TreinamentosPage/RotaSeguraPage: cards, tabelas, filtros, etc.).
export const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";

export const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";

export const selectInlineClasses =
  "min-h-[38px] rounded-[8px] border border-line bg-surface-soft px-2 text-[0.85rem] text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";

export const deleteButtonClasses =
  "inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[8px] border border-red/25 bg-red-soft px-2.5 text-[0.8rem] font-extrabold text-red transition-transform duration-150 hover:-translate-y-px active:translate-y-0";

export const editButtonClasses =
  "inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[8px] border border-teal/25 bg-teal-soft px-2.5 text-[0.8rem] font-extrabold text-teal transition-transform duration-150 hover:-translate-y-px active:translate-y-0";

export const approveButtonClasses =
  "inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[8px] border border-green/25 bg-[#edf8f1] px-2.5 text-[0.8rem] font-extrabold text-green transition-transform duration-150 hover:-translate-y-px active:translate-y-0";

export const twoColLayout = "grid gap-[18px] lg:items-start lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]";

export function tabButtonClasses(active: boolean): string {
  return `inline-flex min-h-[36px] items-center justify-center rounded-[8px] px-3 text-[0.85rem] font-extrabold transition-colors ${
    active ? "bg-teal text-white" : "bg-surface-soft text-muted hover:text-text"
  }`;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "detalhes" in err) {
    const detalhes = (err as { detalhes?: unknown }).detalhes;
    if (Array.isArray(detalhes) && detalhes.length > 0) {
      const primeiro = detalhes[0] as { mensagem?: string };
      if (primeiro?.mensagem) return primeiro.mensagem;
    }
  }
  return err instanceof Error ? err.message : fallback;
}
