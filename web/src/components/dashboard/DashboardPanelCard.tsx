import { Link } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
import type { DashboardPanel } from "../../lib/dashboardPanels";

export interface PanelMetric {
  label: string;
  value: string | number;
  accent?: "red" | "amber" | "green";
}

interface DashboardPanelCardProps {
  panel: DashboardPanel;
  metrics: PanelMetric[];
  loading?: boolean;
}

const accentClasses: Record<string, string> = {
  red: "text-red",
  amber: "text-amber-700",
  green: "text-green",
};

export function DashboardPanelCard({ panel, metrics, loading }: DashboardPanelCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-card">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-soft text-teal-strong dark:text-teal" aria-hidden="true">
          <Icon id={panel.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-[1rem] font-extrabold tracking-tight">{panel.title}</h3>
          <p className="mt-0.5 text-[0.82rem] text-muted">{panel.description}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-surface-strong px-3 py-2.5 animate-pulse">
                <div className="h-5 w-10 rounded bg-line mb-1" />
                <div className="h-3 w-16 rounded bg-line" />
              </div>
            ))
          : metrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-surface-strong px-3 py-2.5">
                <p className={`m-0 text-[1.2rem] font-extrabold leading-tight ${m.accent ? accentClasses[m.accent] : "text-text"}`}>
                  {m.value}
                </p>
                <p className="m-0 mt-0.5 text-[0.75rem] text-muted">{m.label}</p>
              </div>
            ))}
      </div>

      {/* Action */}
      <div className="mt-auto">
        <Link
          to={panel.route}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] border border-teal bg-teal px-4 text-[0.88rem] font-bold text-white transition-opacity hover:opacity-90"
        >
          Acessar {panel.title}
          <Icon id="icon-arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
