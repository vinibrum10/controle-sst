import type { StatusChartData, TypeChartData } from "../../types/dashboard";

interface StatusChartProps {
  statusChart: StatusChartData;
  typeChart: TypeChartData;
}

const STATUS_LABELS: Record<keyof StatusChartData, string> = {
  pendente: "Pendentes",
  em_andamento: "Em andamento",
  atrasada: "Atrasadas",
  concluida: "Concluídas",
};

const STATUS_COLORS: Record<keyof StatusChartData, string> = {
  pendente: "bg-amber",
  em_andamento: "bg-blue",
  atrasada: "bg-red",
  concluida: "bg-green",
};

export function StatusChart({ statusChart, typeChart }: StatusChartProps) {
  const entries = Object.entries(statusChart) as [keyof StatusChartData, number][];
  const max = Math.max(...entries.map(([, value]) => value), 1);

  return (
    <>
      <div className="mb-4 grid gap-2.5">
        {entries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-[64px_minmax(0,1fr)_28px] items-center gap-2.5 text-[0.86rem] font-extrabold text-muted sm:grid-cols-[112px_minmax(0,1fr)_36px]">
            <span>{STATUS_LABELS[key]}</span>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-[#e7eeec] dark:bg-surface-strong">
              <div className={`h-full rounded-full ${STATUS_COLORS[key]}`} style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <strong className="text-text">{value}</strong>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <article className="min-h-[92px] rounded-[8px] border border-line bg-surface-soft p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-none">
          <span className="inline-flex min-h-[24px] items-center rounded-full bg-[#e4f4ee] px-2 text-[#17643e] dark:bg-[rgba(69,196,98,0.12)] dark:text-green">
            Rotineiras
          </span>
          <strong className="mt-2 block text-[1.8rem]">{typeChart.rotineira}</strong>
          <small className="text-muted">tarefas recorrentes</small>
        </article>
        <article className="min-h-[92px] rounded-[8px] border border-line bg-surface-soft p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-none">
          <span className="inline-flex min-h-[24px] items-center rounded-full bg-[#edf0fb] px-2 text-[#51418d] dark:bg-[rgba(74,155,232,0.12)] dark:text-blue">
            Eventuais
          </span>
          <strong className="mt-2 block text-[1.8rem]">{typeChart.eventual}</strong>
          <small className="text-muted">demandas pontuais</small>
        </article>
      </div>
    </>
  );
}
