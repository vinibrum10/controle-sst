import { Link } from "react-router-dom";
import type { TarefaPrioridade } from "../../hooks/useTarefasDetalhadas";
import { EmptyState } from "../ui/Panel";
import { Icon } from "../ui/IconSprite";
import { formatDate } from "../../lib/format";

const PRIORIDADE_LABELS: Record<string, string> = { CRITICA: "Crítica", ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa" };
const PRIORIDADE_COLORS: Record<string, string> = {
  CRITICA: "bg-red/10 text-red font-bold",
  ALTA: "bg-[#FFF0E6] text-[#9a3000] font-bold",
  MEDIA: "bg-[#fff4d8] text-[#7b4a00]",
  BAIXA: "bg-surface-strong text-muted",
};

const STATUS_LABELS: Record<string, string> = { PENDENTE: "Pendente", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída" };
const STATUS_COLORS: Record<string, string> = {
  PENDENTE: "bg-[#fff4d8] text-[#7b4a00]",
  EM_ANDAMENTO: "bg-[#e8f0fd] text-blue",
  CONCLUIDA: "bg-[#e2f4e6] text-green-strong",
};

const URGENCIA_COLORS: Record<number, string> = {
  0: "border-red/30 bg-red/08 text-red",
  1: "border-red/20 bg-red/05 text-red",
  2: "border-[#F5A623]/30 bg-[#FFF8EC] text-[#7b4a00]",
  3: "border-amber/20 bg-[#fff4d8] text-[#7b4a00]",
  4: "border-blue/20 bg-[#e8f0fd] text-blue",
  5: "border-line bg-surface-strong text-muted",
  6: "border-line bg-surface-strong text-muted",
};

function urgenciaBg(urgencia: number): string {
  return URGENCIA_COLORS[urgencia] ?? URGENCIA_COLORS[6];
}

interface Props {
  tasks: TarefaPrioridade[];
  loading?: boolean;
}

export function PriorityActionPanel({ tasks, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-2.5">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-strong" />)}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState message="Nenhuma ação crítica no momento." />;
  }

  return (
    <div className="grid gap-2.5">
      {tasks.map((t) => (
        <article key={t.id} className="rounded-xl border border-line bg-surface-soft p-3.5">
          <div className="mb-2">
            <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[0.7rem] font-bold ${urgenciaBg(t.urgencia)}`}>
              {t.motivo}
            </span>
          </div>

          <p className="truncate text-[0.9rem] font-extrabold leading-tight">{t.titulo}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.74rem] text-muted">
            <span>{t.responsavel?.nome ?? "Sem responsável"}</span>
            {t.prazo && (
              <>
                <span aria-hidden="true">·</span>
                <span>Prazo: {formatDate(t.prazo)}</span>
              </>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] ${PRIORIDADE_COLORS[t.prioridade]}`}>
                {PRIORIDADE_LABELS[t.prioridade]}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${STATUS_COLORS[t.status]}`}>
                {STATUS_LABELS[t.status]}
              </span>
            </div>
            <Link
              to="/tarefas/executar"
              className="inline-flex shrink-0 items-center gap-1 text-[0.78rem] font-bold text-teal hover:underline"
            >
              Ver
              <Icon id="icon-arrow-right" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
