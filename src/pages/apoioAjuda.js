import { $, showToast } from "../utils/dom.js";
import { getState } from "../state/store.js";
import { escapeHtml, formatDate, emptyState } from "../utils/format.js";
import { personAvatar } from "../components/personCard.js";
import { isDone } from "../utils/tarefaHelpers.js";
import { carregarTarefas } from "../hooks/useTarefas.js";
import { carregarDisponibilidade, carregarHistoricoAjuda, pedirAjuda } from "../hooks/useAjuda.js";
import { notificarApoioAtribuido } from "../utils/email.js";

let bound = false;

export async function renderApoioAjudaPage() {
  const { filtros } = getState();

  await Promise.all([
    carregarTarefas({ semana: filtros.semana }),
    carregarDisponibilidade(filtros.semana),
    carregarHistoricoAjuda()
  ]);

  renderTaskOptions();
  renderAvailability();
  renderHistory();

  if (!bound) {
    $("#helpForm").addEventListener("submit", handleSubmit);
    bound = true;
  }
}

function renderTaskOptions() {
  const { tarefas } = getState();
  const ativas = tarefas.filter((tarefa) => !isDone(tarefa));

  $("#helpTaskSelect").innerHTML = ativas
    .map((tarefa) => `<option value="${tarefa.id}">${escapeHtml(tarefa.titulo)} - ${escapeHtml(tarefa.responsavel?.nome || "sem responsável")} - ${formatDate(tarefa.prazo)}</option>`)
    .join("") || `<option value="">Nenhuma tarefa ativa nesta semana</option>`;
}

function renderAvailability() {
  const { disponibilidade } = getState();

  $("#availabilityList").innerHTML = disponibilidade.map(({ funcionario, carga, livre }) => {
    const percent = Math.min((carga / funcionario.capacidade) * 100, 100);
    const fillClass = carga > funcionario.capacidade ? "danger" : carga >= funcionario.capacidade * 0.8 ? "warn" : "";
    const label = carga === 0 ? "Vazio" : livre > 0 ? `${livre}h livres` : "Sem folga";

    return `
      <article class="availability-item">
        <header>
          <div class="person-heading compact">
            ${personAvatar(funcionario, "small")}
            <div>
              <strong>${escapeHtml(funcionario.nome)}</strong>
              <span class="muted">${escapeHtml(funcionario.funcao)}</span>
            </div>
          </div>
          <span class="badge">${label}</span>
        </header>
        <div class="bar-track">
          <div class="bar-fill ${fillClass}" style="width: ${percent}%"></div>
        </div>
      </article>
    `;
  }).join("") || emptyState("Cadastre pessoas para distribuir ajuda.");
}

function renderHistory() {
  const { historicoAjuda } = getState();

  $("#helpHistory").innerHTML = historicoAjuda.map((pedido) => `
    <article class="history-item">
      <header>
        <div>
          <strong>${escapeHtml(pedido.tarefa?.titulo || "Tarefa")}</strong>
          <span class="muted">${formatDate(pedido.criadoEm)} - ${escapeHtml(pedido.solicitante?.nome || "Solicitante")}</span>
        </div>
        <span class="badge">Apoio: ${escapeHtml(pedido.atendente?.nome || "não definido")}</span>
      </header>
    </article>
  `).join("") || emptyState("Nenhum pedido de ajuda registrado.");
}

async function handleSubmit(event) {
  event.preventDefault();
  const tarefaId = $("#helpTaskSelect").value;
  if (!tarefaId) return;

  try {
    const resultado = await pedirAjuda(tarefaId);
    showSupportResult(resultado.mensagem);
    showToast("Ajuda atribuída automaticamente.");
    notificarApoioAtribuido(resultado.tarefa, resultado.ajudante);

    const { filtros } = getState();
    await Promise.all([
      carregarDisponibilidade(filtros.semana),
      carregarHistoricoAjuda()
    ]);
    renderTaskOptions();
    renderAvailability();
    renderHistory();
  } catch (err) {
    showSupportResult(err.message || "Nenhuma pessoa com capacidade livre foi encontrada para essa semana.");
    showToast("Sem apoio disponível na semana selecionada.");
  }
}

function showSupportResult(message) {
  const element = $("#supportResult");
  element.textContent = message;
  element.classList.add("active");
}
