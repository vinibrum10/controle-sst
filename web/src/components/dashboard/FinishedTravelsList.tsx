import type { Viagem } from "../../lib/viagens";
import { EmptyState } from "../ui/Panel";
import { formatDateTime } from "../../lib/format";

function formatDuracao(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m > 0 ? `${String(m).padStart(2, "0")}min` : ""}`;
  return `${m}min`;
}

interface Props {
  viagens: Viagem[];
  loading?: boolean;
}

export function FinishedTravelsList({ viagens, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-2.5">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-strong" />)}
      </div>
    );
  }

  if (viagens.length === 0) {
    return <EmptyState message="Nenhuma viagem finalizada nesta semana." />;
  }

  const sorted = [...viagens].sort((a, b) => (b.finalizadoEm ?? "").localeCompare(a.finalizadoEm ?? ""));

  return (
    <div className="grid gap-2.5">
      {sorted.map((v) => (
        <article key={v.id} className="rounded-xl border border-line bg-surface-soft p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <strong className="truncate text-[0.88rem]">{v.tecnico?.nome ?? "—"}</strong>
              <p className="mt-1 text-[0.8rem] text-muted">{v.origem} → {v.destino}</p>
              <p className="mt-0.5 truncate text-[0.78rem] text-muted">{v.motivo}</p>
            </div>
            {v.duracaoSegundos != null && (
              <span className="shrink-0 rounded-lg bg-[#e2f4e6] px-2 py-0.5 text-[0.78rem] font-bold text-green-strong">
                {formatDuracao(v.duracaoSegundos)}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.72rem] text-muted">
            <span>Início: {formatDateTime(v.iniciadoEm)}</span>
            {v.finalizadoEm && <span>Fim: {formatDateTime(v.finalizadoEm)}</span>}
          </div>
        </article>
      ))}
    </div>
  );
}
