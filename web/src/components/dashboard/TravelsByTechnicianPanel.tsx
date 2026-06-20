import type { ViagemAgregada } from "../../hooks/useViagensDetalhadas";
import { EmptyState } from "../ui/Panel";
import { formatDateTime } from "../../lib/format";

function formatHoras(horas: number): string {
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}min`;
}

interface Props {
  byTecnico: ViagemAgregada[];
  loading?: boolean;
}

export function TravelsByTechnicianPanel({ byTecnico, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-strong" />)}
      </div>
    );
  }

  if (byTecnico.length === 0) {
    return <EmptyState message="Nenhuma viagem registrada para esta semana." />;
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {byTecnico.map((item) => (
        <article key={item.id} className="rounded-xl border border-line bg-surface-soft p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <strong className="block truncate text-[0.9rem]">{item.nome}</strong>
              <p className="mt-0.5 text-[0.74rem] text-muted">{item.totalSemana} viagem(ns) na semana</p>
            </div>
            {item.ativasCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-teal/10 px-2 py-0.5 text-[0.7rem] font-bold text-teal">
                {item.ativasCount} ativa
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-surface px-2.5 py-2">
              <p className="text-[1rem] font-extrabold">{formatHoras(item.horasTotais)}</p>
              <p className="text-[0.7rem] text-muted">tempo em viagem</p>
            </div>
            <div className="rounded-lg bg-surface px-2.5 py-2">
              <p className="text-[1rem] font-extrabold">{item.totalSemana}</p>
              <p className="text-[0.7rem] text-muted">viagens na semana</p>
            </div>
          </div>

          {item.ultimaViagem && (
            <p className="mt-2 truncate text-[0.72rem] text-muted">
              Última: {item.ultimaViagem.origem} → {item.ultimaViagem.destino}
              {" · "}
              {formatDateTime(item.ultimaViagem.iniciadoEm)}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
