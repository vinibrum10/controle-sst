import { Icon } from "../ui/IconSprite";
import type { DashboardMetrics } from "../../types/dashboard";

interface MetricGridProps {
  metrics: DashboardMetrics;
}

const ACCENT_CLASSES = {
  teal: "bg-[#e3f3f0] text-teal-strong dark:bg-[rgba(18,201,184,0.12)] dark:text-teal",
  red: "bg-red-soft text-red",
  amber: "bg-[#fff4d8] text-[#7b4a00] dark:bg-[rgba(242,169,19,0.14)] dark:text-amber",
  green: "bg-[#e2f4e6] text-green-strong dark:bg-[rgba(69,196,98,0.12)] dark:text-green",
} as const;

interface MetricCard {
  label: string;
  value: string | number;
  hint: string;
  icon: string;
  accent: keyof typeof ACCENT_CLASSES;
}

export function MetricGrid({ metrics }: MetricGridProps) {
  const cards: MetricCard[] = [
    { label: "Tarefas ativas", value: metrics.tarefasAtivas, hint: `${metrics.concluidas} concluídas na semana`, icon: "icon-task", accent: "teal" },
    { label: "Vencidas", value: metrics.vencidas, hint: metrics.vencidas ? "precisam de atenção" : "sem atraso aberto", icon: "icon-alert", accent: "red" },
    { label: "Prazo em 3 dias", value: metrics.prazoEm3Dias, hint: "entregas próximas", icon: "icon-clock", accent: "amber" },
    { label: "Entregas no prazo", value: `${metrics.entregasNoPrazoPercent}%`, hint: `${metrics.pedidosAjuda} pedidos de ajuda`, icon: "icon-check", accent: "green" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="min-h-[112px] rounded-[8px] border border-line bg-surface p-[18px] shadow-card">
          <div className={`mb-3 grid h-9 w-9 place-items-center rounded-[8px] ${ACCENT_CLASSES[card.accent]}`} aria-hidden="true">
            <Icon id={card.icon} />
          </div>
          <span className="block text-eyebrow text-muted">{card.label}</span>
          <strong className="my-1.5 block text-display">{card.value}</strong>
          <small className="text-muted">{card.hint}</small>
        </article>
      ))}
    </div>
  );
}
