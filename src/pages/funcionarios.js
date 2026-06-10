import { $, showToast } from "../utils/dom.js";
import { getState } from "../state/store.js";
import { emptyState } from "../utils/format.js";
import { renderPersonCard } from "../components/personCard.js";
import { isDone, isLate, wasOnTime } from "../utils/tarefaHelpers.js";
import { listarTarefas } from "../services/api/tarefas.js";
import {
  carregarFuncionarios,
  adicionarFuncionario,
  alternarAtivoFuncionario,
  removerFuncionario
} from "../hooks/useFuncionarios.js";
import { ApiError } from "../services/api/client.js";

let bound = false;
let fotoData = "";

export async function renderFuncionariosPage() {
  await carregarFuncionarios();
  await renderPeopleGrid();

  if (!bound) {
    $("#personForm").addEventListener("submit", handleSubmit);
    $("#personPhoto").addEventListener("change", handlePhotoChange);
    $("#peopleGrid").addEventListener("click", handleGridClick);
    bound = true;
  }
}

async function renderPeopleGrid() {
  const { funcionarios, filtros } = getState();
  const todasTarefas = await listarTarefas({});

  const cards = funcionarios.map((funcionario) => {
    const tarefasDaSemana = todasTarefas.filter((t) => t.semana === filtros.semana);
    const carga = tarefasDaSemana
      .filter((t) => !isDone(t) && (t.responsavelId === funcionario.id || t.apoioId === funcionario.id))
      .reduce((soma, t) => soma + Number(t.horasEstimadas || 0), 0);

    const tarefasProprias = tarefasDaSemana.filter((t) => t.responsavelId === funcionario.id && !isDone(t));
    const tarefasApoio = tarefasDaSemana.filter((t) => t.apoioId === funcionario.id && !isDone(t));

    const onTime = todasTarefas.filter((t) => t.responsavelId === funcionario.id && isDone(t) && wasOnTime(t)).length;
    const atrasos = todasTarefas.filter((t) => {
      if (t.responsavelId !== funcionario.id) return false;
      return isDone(t) ? !wasOnTime(t) : isLate(t);
    }).length;
    const ajudaPedida = todasTarefas.reduce((soma, t) => (
      soma + (t.pedidosAjuda || []).filter((p) => p.solicitanteId === funcionario.id).length
    ), 0);

    const linkedTasks = todasTarefas.filter((t) => (
      t.responsavelId === funcionario.id ||
      t.apoioId === funcionario.id ||
      (t.pedidosAjuda || []).some((p) => p.solicitanteId === funcionario.id || p.atendentePorId === funcionario.id)
    )).length;

    return renderPersonCard(funcionario, { carga, onTime, atrasos, ajudaPedida, tarefasProprias, tarefasApoio, linkedTasks });
  });

  $("#peopleGrid").innerHTML = cards.join("") || emptyState("Nenhuma pessoa cadastrada.");
}

async function handleSubmit(event) {
  event.preventDefault();

  const nome = $("#personName").value.trim();
  const funcao = $("#personRole").value.trim();
  const email = $("#personEmail").value.trim();
  const capacidade = Number($("#personCapacity").value);

  if (!nome || !funcao || !email || !capacidade) {
    showToast("Preencha nome, função, e-mail e capacidade.");
    return;
  }

  try {
    await adicionarFuncionario({ nome, funcao, email, capacidade, foto: fotoData || null });
    event.target.reset();
    $("#personCapacity").value = 32;
    fotoData = "";
    renderPhotoPreview();
    await renderPeopleGrid();
    showToast("Pessoa adicionada à equipe.");
  } catch (err) {
    if (err instanceof ApiError && err.detalhes?.length) {
      showToast(err.detalhes[0].mensagem || err.message);
    } else {
      showToast(err.message || "Erro ao adicionar pessoa.");
    }
  }
}

async function handlePhotoChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    fotoData = "";
    renderPhotoPreview();
    return;
  }

  try {
    fotoData = await resizePhoto(file);
    renderPhotoPreview();
  } catch {
    fotoData = "";
    event.target.value = "";
    renderPhotoPreview();
    showToast("Não consegui carregar essa imagem. Tente outra foto.");
  }
}

function renderPhotoPreview() {
  const preview = $("#personPhotoPreview");
  preview.innerHTML = fotoData
    ? `<img class="avatar large" src="${fotoData}" alt="Prévia da foto"><span>Foto carregada</span>`
    : "<span>Sem foto</span>";
}

function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Arquivo inválido"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const size = 160;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;

        const side = Math.min(image.width, image.height);
        const sourceX = (image.width - side) / 2;
        const sourceY = (image.height - side) / 2;
        context.drawImage(image, sourceX, sourceY, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleGridClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  const funcionario = getState().funcionarios.find((item) => item.id === id);
  if (!funcionario) return;

  if (action === "toggle-ativo") {
    const nextAtivo = !funcionario.ativo;
    const message = nextAtivo
      ? `Reativar ${funcionario.nome} para permitir novas tarefas e apoios?`
      : `Inativar ${funcionario.nome}? O histórico será mantido, mas esta pessoa não receberá novas tarefas nem apoios.`;
    if (!confirm(message)) return;

    try {
      await alternarAtivoFuncionario(id, nextAtivo);
      await renderPeopleGrid();
      showToast(nextAtivo ? "Funcionário reativado." : "Funcionário inativado. Histórico preservado.");
    } catch (err) {
      showToast(err.message || "Erro ao atualizar funcionário.");
    }
  } else if (action === "excluir-funcionario") {
    if (!confirm("Tem certeza que deseja excluir este funcionário? Esta ação não poderá ser desfeita.")) return;

    try {
      await removerFuncionario(id);
      await renderPeopleGrid();
      showToast("Funcionário excluído.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        alert(`Não é possível excluir ${funcionario.nome}: ${err.message}`);
      } else {
        showToast(err.message || "Erro ao excluir funcionário.");
      }
    }
  }
}
