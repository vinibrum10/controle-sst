import { escapeHtml, initials, formatDate } from "../utils/format.js";
import { isLate } from "../utils/tarefaHelpers.js";

export function personAvatar(funcionario, size = "small") {
  const foto = String(funcionario?.foto || "");
  if (foto.startsWith("data:image/")) {
    return `<img class="avatar ${size}" src="${foto}" alt="Foto de ${escapeHtml(funcionario?.nome || "")}">`;
  }
  return `<span class="avatar ${size}" aria-hidden="true">${initials(funcionario?.nome || "?")}</span>`;
}

// Card completo de funcionario para a pagina de equipe.
export function renderPersonCard(funcionario, info) {
  const { carga, onTime, atrasos, ajudaPedida, tarefasProprias, tarefasApoio, linkedTasks } = info;
  const ativo = funcionario.ativo !== false;
  const percent = Math.min((carga / funcionario.capacidade) * 100, 100);
  const fillClass = carga > funcionario.capacidade ? "danger" : carga >= funcionario.capacidade * 0.8 ? "warn" : "";

  return `
    <article class="person-card ${ativo ? "" : "inactive"}">
      <header>
        <div class="person-heading">
          ${personAvatar(funcionario, "large")}
          <div>
            <strong>${escapeHtml(funcionario.nome)}</strong>
            <span class="muted">${escapeHtml(funcionario.funcao)}</span>
            <span class="muted">${escapeHtml(funcionario.email || "E-mail não cadastrado")}</span>
          </div>
        </div>
        <div class="person-status">
          <span class="badge ${ativo ? "active-person" : "inactive"}">${ativo ? "Ativo" : "Inativo"}</span>
          <span class="badge">${carga}/${funcionario.capacidade}h</span>
        </div>
      </header>
      <div class="bar-track">
        <div class="bar-fill ${fillClass}" style="width: ${percent}%"></div>
      </div>
      <div class="person-actions">
        <span class="person-actions-label">Ações do funcionário</span>
        <div>
          <button class="secondary-button" type="button" data-action="toggle-ativo" data-id="${funcionario.id}">
            ${ativo ? "Inativar funcionário" : "Reativar funcionário"}
          </button>
          <button class="danger-button" type="button" data-action="excluir-funcionario" data-id="${funcionario.id}" title="${linkedTasks ? "Existem tarefas vinculadas. Inative para manter o histórico." : "Excluir funcionário"}">
            Excluir
          </button>
        </div>
      </div>
      <div class="person-stats">
        <div><span>Abertas</span><strong>${tarefasProprias.length}</strong></div>
        <div><span>Ajudando</span><strong>${tarefasApoio.length}</strong></div>
        <div><span>Livre</span><strong>${Math.max(funcionario.capacidade - carga, 0)}h</strong></div>
      </div>
      <div class="person-stats">
        <div><span>No prazo</span><strong>${onTime}</strong></div>
        <div><span>Atrasos</span><strong>${atrasos}</strong></div>
        <div><span>Ajuda pedida</span><strong>${ajudaPedida}</strong></div>
      </div>
      ${renderAssignments(tarefasProprias, tarefasApoio)}
    </article>
  `;
}

function renderAssignments(tarefasProprias, tarefasApoio) {
  const groups = [];
  if (tarefasProprias.length) groups.push(renderGroup("Responsável", tarefasProprias, "responsavel"));
  if (tarefasApoio.length) groups.push(renderGroup("Ajudando", tarefasApoio, "helping"));

  return `
    <div class="person-assignments">
      ${groups.join("") || `<div class="person-task-empty">Sem tarefa aberta na semana selecionada.</div>`}
    </div>
  `;
}

function renderGroup(label, tarefas, variant) {
  return `
    <div class="person-task-group">
      <span>${label}</span>
      ${tarefas.map((tarefa) => renderItem(tarefa, label, variant)).join("")}
    </div>
  `;
}

function renderItem(tarefa, label, variant) {
  const late = isLate(tarefa);
  const supportText = variant === "helping"
    ? `Apoiando: ${tarefa.responsavel?.nome || "responsável"}`
    : tarefa.apoio
      ? `Apoio solicitado: ${tarefa.apoio.nome}`
      : "";

  return `
    <div class="person-task-item ${variant}">
      <span class="badge ${variant === "helping" ? "helping" : tarefa.tipo.toLowerCase()}">${escapeHtml(supportText || label)}</span>
      <strong>${escapeHtml(tarefa.titulo)}</strong>
      <small class="${late ? "late-text" : "muted"}">${late ? "Venceu" : "Prazo"}: ${formatDate(tarefa.prazo)} - ${tarefa.horasEstimadas}h</small>
    </div>
  `;
}
