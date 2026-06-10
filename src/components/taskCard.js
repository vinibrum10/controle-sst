import { escapeHtml, formatDate } from "../utils/format.js";
import { statusLabel, typeLabel, routinePeriodLabel, priorityLabel } from "../utils/enums.js";
import { isDone, isLate } from "../utils/tarefaHelpers.js";

// Card de tarefa usado no Kanban e em outras listagens. As acoes disparam
// eventos via atributos data-action, tratados por delegacao na pagina.
export function taskCard(tarefa) {
  const late = isLate(tarefa);
  const done = isDone(tarefa);
  const progressLabel = tarefa.status === "EM_ANDAMENTO" ? "Pausar" : "Iniciar";
  const statusBadge = done
    ? `<span class="badge done">Concluída</span>`
    : late
      ? `<span class="badge late">Atrasada</span>`
      : `<span class="badge">${statusLabel(tarefa.status)}</span>`;
  const dueLabel = late && !done ? "Venceu" : "Prazo";
  const routineBadge = tarefa.tipo === "ROTINEIRA"
    ? `<span class="badge routine-period">${routinePeriodLabel(tarefa.periodoRotina)}</span>`
    : "";

  return `
    <article class="task-card" draggable="true" data-task-id="${tarefa.id}">
      <div>
        <div class="task-title-row">
          <h3>${escapeHtml(tarefa.titulo)}</h3>
          ${statusBadge}
          <span class="badge ${tarefa.tipo.toLowerCase()}">${typeLabel(tarefa.tipo)}</span>
          ${routineBadge}
          <span class="badge ${tarefa.prioridade.toLowerCase()}">${priorityLabel(tarefa.prioridade)}</span>
        </div>
        <div class="task-meta">
          <span class="badge">${escapeHtml(tarefa.responsavel?.nome || "Sem responsável")}</span>
          <span class="badge due">${dueLabel}: ${formatDate(tarefa.prazo)}</span>
          <span class="badge">${tarefa.horasEstimadas}h</span>
          ${tarefa.apoio ? `<span class="badge">Apoio: ${escapeHtml(tarefa.apoio.nome)}</span>` : ""}
        </div>
        ${tarefa.descricao ? `<p class="task-description">${escapeHtml(tarefa.descricao)}</p>` : ""}
      </div>
      <div class="task-actions">
        <button class="icon-button" type="button" title="Alternar andamento" data-action="toggle-progresso" data-id="${tarefa.id}" ${done ? "disabled" : ""}>
          <svg><use href="#icon-clock"></use></svg>
          ${progressLabel}
        </button>
        <button class="icon-button help" type="button" title="Pedir ajuda automática" data-action="solicitar-ajuda" data-id="${tarefa.id}" ${done ? "disabled" : ""}>
          <svg><use href="#icon-help"></use></svg>
          Solicitar apoio
        </button>
        <button class="icon-button danger" type="button" title="Excluir tarefa" data-action="excluir-tarefa" data-id="${tarefa.id}">
          <svg><use href="#icon-trash"></use></svg>
          Excluir
        </button>
        <button class="icon-button success" type="button" title="Concluir ou reabrir tarefa" data-action="toggle-concluida" data-id="${tarefa.id}">
          <svg><use href="#icon-check"></use></svg>
          ${done ? "Reabrir tarefa" : "Marcar concluída"}
        </button>
      </div>
    </article>
  `;
}
