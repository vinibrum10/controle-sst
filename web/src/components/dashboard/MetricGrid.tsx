import type { DashboardMetrics } from "../../types/dashboard";

interface MetricGridProps {
  metrics: DashboardMetrics;
}

export function MetricGrid({ metrics }: MetricGridProps) {
  const cards: [string, string | number, string][] = [
    ["Tarefas ativas", metrics.tarefasAtivas, `${metrics.concluidas} concluídas na semana`],
    ["Vencidas", metrics.vencidas, metrics.vencidas ? "precisam de atenção" : "sem atraso aberto"],
    ["Prazo em 3 dias", metrics.prazoEm3Dias, "entregas próximas"],
    ["Entregas no prazo", `${metrics.entregasNoPrazoPercent}%`, `${metrics.pedidosAjuda} pedidos de ajuda`],
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {cards.map(([label, value, hint]) => (
        <article
          key={label}
          className="min-h-[112px] rounded-[8px] border border-[rgba(15,130,120,0.12)] bg-gradient-to-b from-white to-surface-soft p-[18px] shadow-[0_12px_30px_rgba(20,33,31,0.08)] dark:from-surface dark:to-surface"
        >
          <span className="mb-3 block h-[3px] w-[38px] rounded-full bg-teal" aria-hidden="true" />
          <span className="block text-[0.82rem] font-bold text-muted">{label}</span>
          <strong className="my-2 block text-[2rem] leading-none">{value}</strong>
          <small className="text-muted">{hint}</small>
        </article>
      ))}
    </div>
  );
}
