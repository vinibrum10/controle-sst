import { Link } from "react-router-dom";
import type { Tarefa } from "../../types/tarefa";
import { EmptyState } from "../ui/Panel";
import { Icon } from "../ui/IconSprite";
import { formatDate } from "../../lib/format";

const STATUS_LABELS: Record<string, string> = { PENDENTE: "Pendente", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída" };
const STATUS_COLORS: Record<string, string> = {
  PENDENTE: "bg-[#fff4d8] text-[#7b4a00]",
  EM_ANDAMENTO: "bg-[#e8f0fd] text-blue",
  CONCLUIDA: "bg-[#e2f4e6] text-green-strong",
};

function TaskRow({ tarefa }: { tarefa: Tarefa }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-soft p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.86rem] font-bold">{tarefa.titulo}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.74rem] text-muted">
          <span>{tarefa.responsavel?.nome ?? "Sem responsável"}</span>
          {tarefa.prazo && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatDate(tarefa.prazo)}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${STATUS_COLORS[tarefa.status]}`}>
          {STATUS_LABELS[tarefa.status]}
        </span>
        <Link
          to="/tarefas/executar"
          className="inline-flex items-center gap-1 text-[0.75rem] font-bold text-teal hover:underline"
        >
          Ver
          <Icon id="icon-arrow-right" className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

interface Group {
  label: string;
  accent: string;
  tasks: Tarefa[];
}

interface Props {
  today: Tarefa[];
  tomorrow: Tarefa[];
  in3days: Tarefa[];
  loading?: boolean;
}

export function UpcomingDeliveriesPanel({ today, tomorrow, in3days, loading }: Props) {
  const groups: Group[] = [
    { label: "Hoje", accent: "text-red font-extrabold", tasks: today },
    { label: "Amanhã", accent: "text-[#7b4a00] font-extrabold", tasks: tomorrow },
    { label: "Próximos 3 dias", accent: "text-muted font-bold", tasks: in3days },
  ];

  const totalTasks = today.length + tomorrow.length + in3days.length;

  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-strong" />)}
      </div>
    );
  }

  if (totalTasks === 0) {
    return <EmptyState message="Sem entregas nos próximos 3 dias." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="mb-2 flex items-center gap-2">
            <span className={`text-[0.8rem] ${group.accent}`}>{group.label}</span>
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-strong px-1.5 text-[0.7rem] font-bold text-muted">
              {group.tasks.length}
            </span>
          </div>
          {group.tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-3 text-center text-[0.8rem] text-muted">
              Nenhuma entrega
            </div>
          ) : (
            <div className="grid gap-2">
              {group.tasks.map((t) => <TaskRow key={t.id} tarefa={t} />)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
