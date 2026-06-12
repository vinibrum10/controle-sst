import { Avatar } from "../ui/Avatar";
import { formatDate } from "../../lib/format";
import { isLate } from "../../lib/tarefaHelpers";
import type { Funcionario } from "../../types/funcionario";
import type { Tarefa } from "../../types/tarefa";

const badgeBase = "inline-flex min-h-[24px] items-center whitespace-nowrap rounded-full px-2 text-[0.76rem] font-extrabold";

export interface PersonCardInfo {
  carga: number;
  onTime: number;
  atrasos: number;
  ajudaPedida: number;
  tarefasProprias: Tarefa[];
  tarefasApoio: Tarefa[];
  linkedTasks: number;
}

interface PersonCardProps {
  funcionario: Funcionario;
  info: PersonCardInfo;
  canManage: boolean;
  onToggleAtivo: (funcionario: Funcionario) => void;
  onExcluir: (funcionario: Funcionario) => void;
}

export function PersonCard({ funcionario, info, canManage, onToggleAtivo, onExcluir }: PersonCardProps) {
  const { carga, onTime, atrasos, ajudaPedida, tarefasProprias, tarefasApoio, linkedTasks } = info;
  const ativo = funcionario.ativo;
  const percent = Math.min((carga / funcionario.capacidade) * 100, 100);
  const fillClass = carga > funcionario.capacidade ? "bg-red" : carga >= funcionario.capacidade * 0.8 ? "bg-amber" : "bg-teal";
  const cardBg = ativo
    ? "bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfd_100%)] dark:bg-none dark:bg-surface"
    : "bg-[linear-gradient(0deg,rgba(238,240,242,0.54),rgba(238,240,242,0.54)),linear-gradient(180deg,#ffffff_0%,#fbfcfd_100%)] dark:bg-none dark:bg-surface";

  return (
    <article className={`min-w-0 rounded-[8px] border border-line p-3 shadow-[0_8px_18px_rgba(20,33,31,0.05)] ${cardBg}`}>
      <header className="mb-2.5 flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar nome={funcionario.nome} foto={funcionario.foto} size="large" />
          <div className="min-w-0">
            <strong className="block truncate">{funcionario.nome}</strong>
            <span className="block text-[0.85rem] text-muted">{funcionario.funcao}</span>
            <span className="block truncate text-[0.85rem] text-muted">{funcionario.email || "E-mail não cadastrado"}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <span className={`${badgeBase} ${ativo ? "bg-[#e2f4e6] text-green" : "bg-[#eef0f2] text-[#68736f]"}`}>
            {ativo ? "Ativo" : "Inativo"}
          </span>
          <span className={`${badgeBase} bg-surface-strong text-muted`}>
            {carga}/{funcionario.capacidade}h
          </span>
        </div>
      </header>

      <div className="relative mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#e7eeec] dark:bg-surface-strong">
        <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${percent}%` }} />
      </div>

      {canManage && (
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 rounded-[8px] border border-line bg-surface-soft p-2.5">
        <span className="mr-auto text-[0.74rem] font-black uppercase text-muted">Ações do funcionário</span>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="inline-flex min-h-[38px] items-center justify-center gap-[9px] rounded-[8px] border border-line bg-neutral-button px-3 font-extrabold text-text transition-transform duration-150 hover:-translate-y-px active:translate-y-0"
            onClick={() => onToggleAtivo(funcionario)}
          >
            {ativo ? "Inativar funcionário" : "Reativar funcionário"}
          </button>
          <button
            type="button"
            className="inline-flex min-h-[38px] items-center justify-center gap-[9px] rounded-[8px] border border-red/25 bg-red-soft px-3 font-extrabold text-red transition-transform duration-150 hover:-translate-y-px active:translate-y-0"
            title={linkedTasks ? "Existem tarefas vinculadas. Inative para manter o histórico." : "Excluir funcionário"}
            onClick={() => onExcluir(funcionario)}
          >
            Excluir
          </button>
        </div>
      </div>
      )}

      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <StatBox label="Abertas" value={tarefasProprias.length} />
        <StatBox label="Ajudando" value={tarefasApoio.length} />
        <StatBox label="Livre" value={`${Math.max(funcionario.capacidade - carga, 0)}h`} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <StatBox label="No prazo" value={onTime} />
        <StatBox label="Atrasos" value={atrasos} />
        <StatBox label="Ajuda pedida" value={ajudaPedida} />
      </div>

      <div className="mt-3 grid gap-2.5">
        {tarefasProprias.length === 0 && tarefasApoio.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-line p-2.5 text-[0.86rem] text-muted">
            Sem tarefa aberta na semana selecionada.
          </div>
        ) : (
          <>
            {tarefasProprias.length > 0 && <TaskGroup label="Responsável" tarefas={tarefasProprias} variant="responsavel" />}
            {tarefasApoio.length > 0 && <TaskGroup label="Ajudando" tarefas={tarefasApoio} variant="helping" />}
          </>
        )}
      </div>
    </article>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-h-[62px] rounded-[8px] border border-[rgba(96,113,108,0.12)] bg-surface-strong p-2.5">
      <span className="block text-[0.75rem] font-extrabold text-muted">{label}</span>
      <strong className="mt-1 block text-[1.1rem]">{value}</strong>
    </div>
  );
}

function TaskGroup({ label, tarefas, variant }: { label: string; tarefas: Tarefa[]; variant: "responsavel" | "helping" }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-[0.75rem] font-extrabold uppercase text-muted">{label}</span>
      {tarefas.map((tarefa) => (
        <TaskItem key={tarefa.id} tarefa={tarefa} label={label} variant={variant} />
      ))}
    </div>
  );
}

function TaskItem({ tarefa, label, variant }: { tarefa: Tarefa; label: string; variant: "responsavel" | "helping" }) {
  const late = isLate(tarefa);
  const supportText =
    variant === "helping"
      ? `Apoiando: ${tarefa.responsavel?.nome || "responsável"}`
      : tarefa.apoio
        ? `Apoio solicitado: ${tarefa.apoio.nome}`
        : "";
  const typeBadgeClass =
    variant === "helping"
      ? "bg-[#e8f1fb] text-blue"
      : tarefa.tipo === "ROTINEIRA"
        ? "bg-[#e4f4ee] text-[#17643e]"
        : "bg-[#edf0fb] text-[#51418d]";
  const itemBg =
    variant === "helping"
      ? "border-blue/25 bg-[#f1f7ff] dark:border-line dark:bg-surface"
      : "border-line bg-white dark:bg-surface";

  return (
    <div className={`grid gap-1.5 rounded-[8px] border p-2.5 ${itemBg}`}>
      <span className={`${badgeBase} ${typeBadgeClass}`}>{supportText || label}</span>
      <strong className="text-[0.9rem]">{tarefa.titulo}</strong>
      <small className={late ? "font-extrabold text-red" : "text-muted"}>
        {late ? "Venceu" : "Prazo"}: {formatDate(tarefa.prazo)} - {tarefa.horasEstimadas}h
      </small>
    </div>
  );
}
