import { Link } from "react-router-dom";
import type { Funcionario } from "../../types/funcionario";
import type { PedidoAjuda, Tarefa } from "../../types/tarefa";
import { isDone, isLate } from "../../lib/tarefaHelpers";
import { EmptyState } from "../ui/Panel";
import { Icon } from "../ui/IconSprite";

interface HelpRequestsPanelProps {
  tasks: Tarefa[];
  funcionarios: Funcionario[];
  loading?: boolean;
}

interface HelpEvent extends PedidoAjuda {
  tarefa: Tarefa;
}

function personById(funcionarios: Funcionario[], id?: string | null) {
  return funcionarios.find((funcionario) => funcionario.id === id) ?? null;
}

function countBy(events: HelpEvent[], key: "solicitanteId" | "atendentePorId") {
  const counts = new Map<string, number>();
  events.forEach((event) => {
    const id = event[key];
    if (!id) return;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
}

function topTask(events: HelpEvent[]) {
  const counts = new Map<string, { task: Tarefa; count: number }>();
  events.forEach((event) => {
    const current = counts.get(event.tarefa.id);
    counts.set(event.tarefa.id, { task: event.tarefa, count: (current?.count ?? 0) + 1 });
  });
  return [...counts.values()].sort((a, b) => b.count - a.count)[0] ?? null;
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-xl border border-line bg-surface-soft p-3 text-[0.78rem] font-bold text-muted">
      <strong className="block text-[1.35rem] leading-none text-text">{value}</strong>
      {label}
    </span>
  );
}

function PersonResult({ label, person, value, suffix }: { label: string; person: Funcionario | null; value?: number; suffix: string }) {
  return (
    <article className="rounded-xl border border-line bg-surface-soft p-3">
      <h4 className="mb-2 text-[0.8rem] font-extrabold text-muted">{label}</h4>
      {person ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <strong className="block truncate text-[0.92rem]">{person.nome}</strong>
            <span className="block truncate text-[0.78rem] text-muted">{person.funcao}</span>
          </div>
          <span className="shrink-0 rounded-full bg-surface-strong px-2.5 py-1 text-[0.75rem] font-bold">
            {value ?? 0} {suffix}
          </span>
        </div>
      ) : (
        <p className="text-[0.84rem] text-muted">Sem dados na semana.</p>
      )}
    </article>
  );
}

export function HelpRequestsPanel({ tasks, funcionarios, loading }: HelpRequestsPanelProps) {
  if (loading) {
    return (
      <div className="grid gap-2.5">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-20 animate-pulse rounded-xl bg-surface-strong" />
        ))}
      </div>
    );
  }

  const events: HelpEvent[] = tasks.flatMap((task) => (task.pedidosAjuda || []).map((pedido) => ({ ...pedido, tarefa: task })));
  const openEvents = events.filter((event) => event.status === "ABERTO");
  const closedEvents = events.filter((event) => event.status === "ATENDIDO");
  const mostRequested = countBy(events, "solicitanteId");
  const mostSupport = countBy(events, "atendentePorId");
  const taskWithMostHelp = topTask(events);

  const noRequestPeople = funcionarios.filter((funcionario) => !events.some((event) => event.solicitanteId === funcionario.id));
  const alerts = funcionarios.flatMap((funcionario) => {
    const personTasks = tasks.filter((task) => task.responsavelId === funcionario.id);
    const lateTasks = personTasks.filter((task) => !isDone(task) && isLate(task));
    const requested = events.filter((event) => event.solicitanteId === funcionario.id);
    const personAlerts: string[] = [];
    if (lateTasks.length > 0 && requested.length === 0) personAlerts.push(`${funcionario.nome}: verificar necessidade de apoio.`);
    if (requested.length >= 3) personAlerts.push(`${funcionario.nome}: muitos pedidos de ajuda na semana.`);
    return personAlerts;
  });

  tasks.forEach((task) => {
    const pedidosAjuda = task.pedidosAjuda || [];
    if (task.prioridade === "CRITICA" && pedidosAjuda.some((pedido) => pedido.status === "ABERTO")) {
      alerts.push(`Pedido aberto em tarefa crítica: ${task.titulo}.`);
    }
    if (pedidosAjuda.some((pedido) => pedido.status === "ABERTO" && !pedido.atendentePorId)) {
      alerts.push(`Pedido aguardando apoio: ${task.titulo}.`);
    }
    if (pedidosAjuda.length >= 2) alerts.push(`Recorrência de pedidos de ajuda: ${task.titulo}.`);
  });

  return (
    <div className="grid gap-3.5">
      <div className="grid gap-2.5 sm:grid-cols-3">
        <SummaryItem label="Total de pedidos" value={events.length} />
        <SummaryItem label="Pedidos abertos" value={openEvents.length} />
        <SummaryItem label="Pedidos concluídos" value={closedEvents.length} />
      </div>

      <div className="grid gap-2.5 md:grid-cols-2">
        <PersonResult
          label="Quem mais pediu ajuda"
          person={mostRequested ? personById(funcionarios, mostRequested[0]) : null}
          value={mostRequested?.[1]}
          suffix="pedido(s)"
        />
        <PersonResult
          label="Quem mais apoiou"
          person={mostSupport ? personById(funcionarios, mostSupport[0]) : null}
          value={mostSupport?.[1]}
          suffix="apoio(s)"
        />
      </div>

      <article className="rounded-xl border border-line bg-surface-soft p-3">
        <h4 className="mb-2 text-[0.8rem] font-extrabold text-muted">Tarefa com mais pedidos de ajuda</h4>
        {taskWithMostHelp ? (
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-[0.9rem] font-extrabold">{taskWithMostHelp.task.titulo}</span>
            <span className="shrink-0 rounded-full bg-surface-strong px-2.5 py-1 text-[0.75rem] font-bold">
              {taskWithMostHelp.count} pedido(s)
            </span>
          </div>
        ) : (
          <p className="text-[0.84rem] text-muted">Nenhuma tarefa recebeu pedido de ajuda na semana.</p>
        )}
      </article>

      <article className="rounded-xl border border-line bg-surface-soft p-3">
        <h4 className="mb-2 text-[0.8rem] font-extrabold text-muted">Sem pedidos de ajuda na semana</h4>
        {noRequestPeople.length > 0 ? (
          <ul className="grid gap-1.5 text-[0.84rem] text-muted">
            {noRequestPeople.slice(0, 6).map((funcionario) => {
              const hasLateTask = tasks.some((task) => task.responsavelId === funcionario.id && !isDone(task) && isLate(task));
              return (
                <li key={funcionario.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{funcionario.nome}</span>
                  {hasLateTask && <span className="shrink-0 rounded-full bg-red/10 px-2 py-0.5 text-[0.7rem] font-bold text-red">Verificar apoio</span>}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState message="Todos os técnicos filtrados tiveram ao menos um pedido registrado." />
        )}
      </article>

      <article className="rounded-xl border border-line bg-surface-soft p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-[0.8rem] font-extrabold text-muted">Ajuda e Atrasos</h4>
          <Link to="/ajuda" className="inline-flex items-center gap-1 text-[0.76rem] font-bold text-teal hover:underline">
            Ver ajuda
            <Icon id="icon-arrow-right" className="h-3.5 w-3.5" />
          </Link>
        </div>
        {alerts.length > 0 ? (
          <ul className="grid gap-1.5 text-[0.84rem] text-muted">
            {alerts.slice(0, 6).map((alert) => (
              <li key={alert}>{alert}</li>
            ))}
          </ul>
        ) : (
          <EmptyState message="Sem alerta de ajuda e atraso." />
        )}
      </article>
    </div>
  );
}
