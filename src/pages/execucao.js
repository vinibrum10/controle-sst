import { $, $$, showToast } from "../utils/dom.js";
import { getState, setState } from "../state/store.js";
import { taskCard } from "../components/taskCard.js";
import { emptyState, escapeHtml } from "../utils/format.js";
import { KANBAN_COLUMNS, statusLabel } from "../utils/enums.js";
import { carregarTarefas, alterarStatusTarefa, removerTarefa } from "../hooks/useTarefas.js";
import { carregarFuncionarios } from "../hooks/useFuncionarios.js";
import { pedirAjuda } from "../hooks/useAjuda.js";
import { isDone } from "../utils/tarefaHelpers.js";

let bound = false;
let draggedTaskId = null;

export async function renderExecucaoPage() {
  const { filtros } = getState();
  await Promise.all([
    carregarTarefas({ semana: filtros.semana }),
    carregarFuncionarios()
  ]);
  renderOwnerFilter();
  renderKanban();

  if (!bound) {
    bindFilters();
    bindActions();
    bindKanbanDnD();
    bound = true;
  }
}

function renderOwnerFilter() {
  const { funcionarios, filtros } = getState();
  const select = $("#ownerFilter");
  select.innerHTML = [
    `<option value="todos">Todos os responsáveis</option>`,
    ...funcionarios.map((f) => `<option value="${f.id}">${escapeHtml(f.nome)}${f.ativo ? "" : " (inativo)"}</option>`)
  ].join("");
  select.value = filtros.responsavel;
}

function tarefasFiltradas() {
  const { tarefas, filtros } = getState();
  return tarefas.filter((tarefa) => {
    if (filtros.responsavel !== "todos" && tarefa.responsavelId !== filtros.responsavel && tarefa.apoioId !== filtros.responsavel) return false;
    if (filtros.tipo !== "todos" && tarefa.tipo !== filtros.tipo) return false;
    return true;
  });
}

function renderKanban() {
  const tarefas = tarefasFiltradas();
  const porStatus = { PENDENTE: [], EM_ANDAMENTO: [], CONCLUIDA: [] };
  tarefas.forEach((tarefa) => porStatus[tarefa.status].push(tarefa));

  KANBAN_COLUMNS.forEach(({ status, domId }) => {
    $(`#col-${domId}`).innerHTML = porStatus[status].map(taskCard).join("")
      || emptyState(`Nenhuma tarefa ${statusLabel(status).toLowerCase()}.`);
    $(`#count-${domId}`).textContent = porStatus[status].length;
  });
}

function bindFilters() {
  $("#ownerFilter").addEventListener("change", (event) => {
    setState({ filtros: { ...getState().filtros, responsavel: event.target.value } });
    renderKanban();
  });

  $("#typeFilter").addEventListener("change", (event) => {
    setState({ filtros: { ...getState().filtros, tipo: event.target.value } });
    renderKanban();
  });
}

function bindActions() {
  $("#kanbanBoard").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;
    const tarefa = getState().tarefas.find((item) => item.id === id);
    if (!tarefa) return;

    try {
      if (action === "toggle-progresso") {
        const novoStatus = tarefa.status === "EM_ANDAMENTO" ? "PENDENTE" : "EM_ANDAMENTO";
        await alterarStatusTarefa(id, novoStatus);
        showToast("Status da tarefa atualizado.");
      } else if (action === "toggle-concluida") {
        const novoStatus = isDone(tarefa) ? "EM_ANDAMENTO" : "CONCLUIDA";
        await alterarStatusTarefa(id, novoStatus);
        showToast(novoStatus === "CONCLUIDA" ? "Tarefa concluída." : "Tarefa reaberta.");
      } else if (action === "excluir-tarefa") {
        if (!confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) return;
        await removerTarefa(id);
        showToast("Tarefa excluída.");
      } else if (action === "solicitar-ajuda") {
        const resultado = await pedirAjuda(id);
        showToast(resultado.mensagem);
      }
      renderKanban();
    } catch (err) {
      showToast(err.message || "Erro ao atualizar a tarefa.");
    }
  });
}

function bindKanbanDnD() {
  const board = $("#kanbanBoard");

  board.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".task-card[draggable]");
    if (!card) return;
    draggedTaskId = card.dataset.taskId;
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
  });

  board.addEventListener("dragend", (event) => {
    const card = event.target.closest(".task-card");
    if (card) card.classList.remove("dragging");
    draggedTaskId = null;
    $$(".kanban-column").forEach((column) => column.classList.remove("drag-over"));
  });

  $$(".kanban-column").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => column.classList.remove("drag-over"));

    column.addEventListener("drop", async (event) => {
      event.preventDefault();
      column.classList.remove("drag-over");
      if (!draggedTaskId) return;

      const novoStatus = column.dataset.status;
      const tarefa = getState().tarefas.find((item) => item.id === draggedTaskId);
      if (tarefa && tarefa.status !== novoStatus) {
        try {
          await alterarStatusTarefa(draggedTaskId, novoStatus);
          renderKanban();
          showToast(`Tarefa movida para ${statusLabel(novoStatus)}.`);
        } catch (err) {
          showToast(err.message || "Erro ao mover a tarefa.");
        }
      }
    });
  });
}
