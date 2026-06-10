import { $, showToast } from "../utils/dom.js";
import { getState, setState } from "../state/store.js";
import { escapeHtml, shiftDate } from "../utils/format.js";
import { adicionarTarefa } from "../hooks/useTarefas.js";
import { carregarFuncionarios } from "../hooks/useFuncionarios.js";
import { notificarTarefaAtribuida } from "../utils/email.js";
import { navigateToView } from "../router.js";
import { ApiError } from "../services/api/client.js";

let bound = false;

export async function renderCriarTarefaPage() {
  await carregarFuncionarios();
  renderOwnerOptions();
  applyDefaults();

  if (!bound) {
    $("#taskType").addEventListener("change", toggleRoutinePeriodField);
    $("#taskForm").addEventListener("submit", handleSubmit);
    bound = true;
  }
}

function renderOwnerOptions() {
  const { funcionarios } = getState();
  $("#taskOwner").innerHTML = funcionarios
    .filter((f) => f.ativo)
    .map((f) => `<option value="${f.id}">${escapeHtml(f.nome)}</option>`)
    .join("");
}

function applyDefaults() {
  const { filtros } = getState();
  $("#taskWeek").value = filtros.semana;
  if (!$("#taskDueDate").value) $("#taskDueDate").value = shiftDate(2);
  if (!$("#taskHours").value) $("#taskHours").value = 4;
  toggleRoutinePeriodField();
}

function toggleRoutinePeriodField() {
  const isRoutine = $("#taskType").value === "ROTINEIRA";
  $("#routinePeriodField").classList.toggle("hidden", !isRoutine);
  $("#taskRoutinePeriod").disabled = !isRoutine;
}

async function handleSubmit(event) {
  event.preventDefault();

  const titulo = $("#taskTitle").value.trim();
  const responsavelId = $("#taskOwner").value;
  const semana = $("#taskWeek").value || getState().filtros.semana;
  const prazo = $("#taskDueDate").value;
  const tipo = $("#taskType").value;
  const horasEstimadas = Number($("#taskHours").value);

  if (!titulo || !responsavelId || !prazo || !horasEstimadas) {
    showToast("Preencha os campos obrigatórios da tarefa.");
    return;
  }

  const dados = {
    titulo,
    responsavelId,
    semana,
    prazo,
    tipo,
    prioridade: $("#taskPriority").value,
    periodoRotina: tipo === "ROTINEIRA" ? $("#taskRoutinePeriod").value : null,
    horasEstimadas,
    descricao: $("#taskDescription").value.trim()
  };

  try {
    const tarefa = await adicionarTarefa(dados);

    setState({ filtros: { ...getState().filtros, semana } });
    $("#globalWeekFilter").value = semana;

    event.target.reset();
    $("#taskWeek").value = semana;
    $("#taskDueDate").value = shiftDate(2);
    $("#taskHours").value = 4;
    toggleRoutinePeriodField();

    showToast("Tarefa adicionada ao plano semanal.");
    navigateToView("execution");
    notificarTarefaAtribuida(tarefa);
  } catch (err) {
    if (err instanceof ApiError && err.detalhes?.length) {
      showToast(err.detalhes[0].mensagem || err.message);
    } else {
      showToast(err.message || "Erro ao criar a tarefa.");
    }
  }
}
