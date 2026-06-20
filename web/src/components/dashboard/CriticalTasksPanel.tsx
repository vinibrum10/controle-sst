import { Link } from "react-router-dom";
import type { Tarefa } from "../../types/tarefa";
import { EmptyState } from "../ui/Panel";
import { Icon } from "../ui/IconSprite";
import { formatDate } from "../../lib/format";
import { isLate } from "../../lib/tarefaHelpers";

const PRIORIDADE_LABELS: Record<string, string> = { CRITICA: "Crítica", ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa" };
const PRIORIDADE_COLORS: Record<string, string> = {
  CRITICA: "bg-red/10 text-red",
  ALTA: "bg-[#FFF0E6] text-[#9a3000]",
  MEDIA: "bg-[#fff4d8] text-[#7b4a00]",
  BAIXA: "bg-surface-strong text-muted",
};
const STATUS_LABELS: Record<string, string> = { PENDENTE: "Pendente", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída" };
const STATUS_COLORS: Record<string, string> = {
  PENDENTE: "bg-[#fff4d8] text-[#7b4a00]",
  EM_ANDAMENTO: "bg-[#e8f0fd] text-blue",
  CONCLUIDA: "bg-[#e2f4e6] text-green-strong",
};

interface Props {
  tasks: Tarefa[];
  loading?: boolean;
}

export function CriticalTasksPanel({ tasks, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-2.5">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-strong" />)}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState message="Nenhuma tarefa crítica nesta semana." />;
  }

  return (
    <div className="grid gap-2.5">
      {tasks.map((t) => {
        const late = isLate(t);
        return (
          <article
            key={t.id}
            className={`flex items-start gap-3 rounded-xl border p-3 ${late ? "border-red/20 bg-red/03" : "border-line bg-surface-soft"}`}
          >
            <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${late ? "bg-red" : "bg-amber"}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.88rem] font-extrabold">{t.titulo}</p>
              <p className="mt-0.5 truncate text-[0.74rem] text-muted">{t.responsavel?.nome ?? "Sem responsável"}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${PRIORIDADE_COLORS[t.prioridade]}`}>
                  {PRIORIDADE_LABELS[t.prioridade]}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] ${STATUS_COLORS[t.status]}`}>
                  {STATUS_LABELS[t.status]}
                </span>
                {t.prazo && (
                  <span className="text-[0.72rem] text-muted">Prazo: {formatDate(t.prazo)}</span>
                )}
              </div>
            </div>
            <Link
              to="/tarefas/executar"
              className="inline-flex shrink-0 items-center gap-1 self-center text-[0.78rem] font-bold text-teal hover:underline"
              aria-label={`Ver tarefa ${t.titulo}`}
            >
              Ver
              <Icon id="icon-arrow-right" className="h-3.5 w-3.5" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
