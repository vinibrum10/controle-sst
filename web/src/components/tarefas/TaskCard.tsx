import type { DragEvent } from "react";
import { Icon } from "../ui/IconSprite";
import { priorityLabel, routinePeriodLabel, statusLabel, typeLabel } from "../../lib/enums";
import { formatDate } from "../../lib/format";
import { isDone, isLate } from "../../lib/tarefaHelpers";
import type { Tarefa } from "../../types/tarefa";

const badgeBase = "inline-flex min-h-[24px] items-center whitespace-nowrap rounded-full px-2 text-[0.76rem] font-extrabold";
const badgeDefault = `${badgeBase} bg-surface-strong text-muted`;

const iconButtonBase =
  "inline-flex min-h-[42px] min-w-0 items-center justify-center gap-[9px] rounded-[8px] border px-2.5 text-[0.8rem] font-black transition-transform duration-150 hover:-translate-y-px hover:shadow-[0_10px_20px_rgba(20,33,31,0.1)] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-[0.58]";
const iconButtonNeutral = "border-line bg-neutral-button text-text";
const iconButtonHelp = "border-blue/25 bg-[#eef6ff] text-blue";
const iconButtonDanger = "border-red/25 bg-red-soft text-red";
const iconButtonSuccess = "border-green/25 bg-[#edf8f1] text-green";

interface TaskCardProps {
  tarefa: Tarefa;
  onToggleProgresso: (tarefa: Tarefa) => void;
  onToggleConcluida: (tarefa: Tarefa) => void;
  onExcluir: (tarefa: Tarefa) => void;
  onSolicitarAjuda: (tarefa: Tarefa) => void;
  onDragStart?: (event: DragEvent<HTMLElement>, tarefa: Tarefa) => void;
  onDragEnd?: (event: DragEvent<HTMLElement>) => void;
  dragging?: boolean;
}

export function TaskCard({
  tarefa,
  onToggleProgresso,
  onToggleConcluida,
  onExcluir,
  onSolicitarAjuda,
  onDragStart,
  onDragEnd,
  dragging,
}: TaskCardProps) {
  const late = isLate(tarefa);
  const done = isDone(tarefa);
  const progressLabel = tarefa.status === "EM_ANDAMENTO" ? "Pausar" : "Iniciar";
  const dueLabel = late && !done ? "Venceu" : "Prazo";

  return (
    <article
      className={`grid min-w-0 grid-cols-1 gap-3 rounded-[8px] border border-line bg-surface p-3.5 shadow-card transition-[transform,box-shadow] duration-150 ${
        dragging ? "scale-[0.97] opacity-45" : "cursor-grab hover:-translate-y-0.5 hover:shadow-card-lg"
      }`}
      draggable
      onDragStart={(event) => onDragStart?.(event, tarefa)}
      onDragEnd={onDragEnd}
    >
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="m-0 min-w-0 break-words text-base font-extrabold">{tarefa.titulo}</h3>
          {done ? (
            <span className={`${badgeBase} bg-[#e2f4e6] text-green`}>Concluída</span>
          ) : late ? (
            <span className={`${badgeBase} bg-[#ffe3e3] text-red`}>Atrasada</span>
          ) : (
            <span className={badgeDefault}>{statusLabel(tarefa.status)}</span>
          )}
          <span className={`${badgeBase} ${tarefa.tipo === "ROTINEIRA" ? "bg-[#e4f4ee] text-[#17643e]" : "bg-[#edf0fb] text-[#51418d]"}`}>
            {typeLabel(tarefa.tipo)}
          </span>
          {tarefa.tipo === "ROTINEIRA" && (
            <span className={`${badgeBase} bg-[#e9f7f6] text-teal`}>{routinePeriodLabel(tarefa.periodoRotina)}</span>
          )}
          <span
            className={`${badgeBase} ${
              tarefa.prioridade === "ALTA" || tarefa.prioridade === "CRITICA"
                ? "bg-[#fdeceb] text-red"
                : tarefa.prioridade === "BAIXA"
                  ? "bg-[#eef3f1] text-[#53625d]"
                  : badgeDefault
            }`}
          >
            {priorityLabel(tarefa.prioridade)}
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={badgeDefault}>{tarefa.responsavel?.nome || "Sem responsável"}</span>
          <span className={`${badgeBase} bg-[#fff4d8] text-[#7b4a00]`}>
            {dueLabel}: {formatDate(tarefa.prazo)}
          </span>
          <span className={badgeDefault}>{tarefa.horasEstimadas}h</span>
          {tarefa.apoio && <span className={badgeDefault}>Apoio: {tarefa.apoio.nome}</span>}
        </div>
        {tarefa.descricao && <p className="m-0 min-w-0 break-words text-[0.9rem] text-muted">{tarefa.descricao}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line pt-3">
        <button
          type="button"
          title="Alternar andamento"
          className={`${iconButtonBase} ${iconButtonNeutral}`}
          disabled={done}
          onClick={() => onToggleProgresso(tarefa)}
        >
          <Icon id="icon-clock" />
          {progressLabel}
        </button>
        <button
          type="button"
          title="Pedir ajuda automática"
          className={`${iconButtonBase} ${iconButtonHelp}`}
          disabled={done}
          onClick={() => onSolicitarAjuda(tarefa)}
        >
          <Icon id="icon-help" />
          Solicitar apoio
        </button>
        <button
          type="button"
          title="Excluir tarefa"
          className={`${iconButtonBase} ${iconButtonDanger}`}
          onClick={() => onExcluir(tarefa)}
        >
          <Icon id="icon-trash" />
          Excluir
        </button>
        <button
          type="button"
          title="Concluir ou reabrir tarefa"
          className={`${iconButtonBase} ${iconButtonSuccess}`}
          onClick={() => onToggleConcluida(tarefa)}
        >
          <Icon id="icon-check" />
          {done ? "Reabrir tarefa" : "Marcar concluída"}
        </button>
      </div>
    </article>
  );
}
