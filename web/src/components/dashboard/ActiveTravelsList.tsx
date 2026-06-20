import type { Viagem } from "../../lib/viagens";
import { EmptyState } from "../ui/Panel";
import { formatDateTime } from "../../lib/format";

function formatElapsed(iniciadoEm: string): string {
  const ms = Date.now() - new Date(iniciadoEm).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h${m > 0 ? `${String(m).padStart(2, "0")}min` : ""}`;
  return `${m}min`;
}

function isAlertaTempo(iniciadoEm: string): boolean {
  return Date.now() - new Date(iniciadoEm).getTime() > 8 * 3600000;
}

interface Props {
  viagens: Viagem[];
  loading?: boolean;
}

export function ActiveTravelsList({ viagens, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-2.5">
        {[1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-strong" />)}
      </div>
    );
  }

  if (viagens.length === 0) {
    return <EmptyState message="Nenhuma viagem em andamento." />;
  }

  return (
    <div className="grid gap-2.5">
      {viagens.map((v) => {
        const alerta = isAlertaTempo(v.iniciadoEm);
        return (
          <article
            key={v.id}
            className={`rounded-xl border p-3.5 ${alerta ? "border-amber/30 bg-[#FFFBEE]" : "border-teal/20 bg-teal-soft/30"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                  <strong className="truncate text-[0.88rem]">{v.tecnico?.nome ?? "—"}</strong>
                </div>
                <p className="mt-1.5 text-[0.82rem] text-muted">
                  {v.origem} → {v.destino}
                </p>
                <p className="mt-0.5 truncate text-[0.8rem] text-muted">{v.motivo}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className={`block text-[0.82rem] font-bold ${alerta ? "text-amber" : "text-teal"}`}>
                  {formatElapsed(v.iniciadoEm)}
                </span>
                {alerta && (
                  <span className="block text-[0.7rem] font-bold text-amber">⚠ Alerta</span>
                )}
              </div>
            </div>
            <p className="mt-2 text-[0.72rem] text-muted">
              Iniciada em {formatDateTime(v.iniciadoEm)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
