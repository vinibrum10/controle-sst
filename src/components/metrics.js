import { $ } from "../utils/dom.js";
import { escapeHtml, emptyState } from "../utils/format.js";
import { personAvatar } from "./personCard.js";

export function renderMetricCards(metrics) {
  const cards = [
    ["Tarefas ativas", metrics.tarefasAtivas, `${metrics.concluidas} concluídas na semana`],
    ["Vencidas", metrics.vencidas, metrics.vencidas ? "precisam de atenção" : "sem atraso aberto"],
    ["Prazo em 3 dias", metrics.prazoEm3Dias, "entregas próximas"],
    ["Entregas no prazo", `${metrics.entregasNoPrazoPercent}%`, `${metrics.pedidosAjuda} pedidos de ajuda`]
  ];

  $("#metricGrid").innerHTML = cards
    .map(([label, value, hint]) => `
      <article class="metric-card">
        <span>${label}</span>
        <strong>${value}</strong>
        <small>${hint}</small>
      </article>
    `)
    .join("");
}

export function renderWorkload(cargaPorPessoa) {
  const rows = cargaPorPessoa.map(({ funcionario, carga, capacidade, percentual, livre }) => {
    const fillClass = percentual >= 100 ? "danger" : percentual >= 80 ? "warn" : "";
    const ativo = funcionario.ativo !== false;
    const support = carga === 0
      ? "Sem tarefa aberta na semana selecionada."
      : livre > 0
        ? `${livre}h livres para apoio.`
        : "Capacidade semanal comprometida.";

    return `
      <article class="workload-row">
        <header>
          <div>
            <strong>${escapeHtml(funcionario.nome)}</strong>
            <span class="muted">${escapeHtml(funcionario.funcao)}${ativo ? "" : " - inativo"}</span>
          </div>
          <span class="badge ${ativo ? "" : "inactive"}">${carga}h de ${capacidade}h</span>
        </header>
        <div class="bar-track" aria-label="Carga de ${escapeHtml(funcionario.nome)}">
          <div class="bar-fill ${fillClass}" style="width: ${Math.min(percentual, 100)}%"></div>
        </div>
        <small class="muted">${support}</small>
      </article>
    `;
  });

  $("#workloadList").innerHTML = rows.join("") || emptyState("Cadastre pessoas para acompanhar a carga.");
}

export function renderCharts(statusChart, typeChart) {
  const labels = {
    pendente: "Pendentes",
    em_andamento: "Em andamento",
    atrasada: "Atrasadas",
    concluida: "Concluídas"
  };
  const colors = {
    pendente: "var(--amber)",
    em_andamento: "var(--blue)",
    atrasada: "var(--red)",
    concluida: "var(--green)"
  };
  const max = Math.max(...Object.values(statusChart), 1);

  $("#statusChart").innerHTML = Object.entries(statusChart)
    .map(([key, value]) => `
      <div class="chart-row">
        <span>${labels[key]}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${(value / max) * 100}%; background: ${colors[key]}"></div>
        </div>
        <strong>${value}</strong>
      </div>
    `)
    .join("");

  $("#typeChart").innerHTML = `
    <article class="type-tile">
      <span class="badge rotineira">Rotineiras</span>
      <strong>${typeChart.rotineira}</strong>
      <small class="muted">tarefas recorrentes</small>
    </article>
    <article class="type-tile">
      <span class="badge eventual">Eventuais</span>
      <strong>${typeChart.eventual}</strong>
      <small class="muted">demandas pontuais</small>
    </article>
  `;
}

export function renderRankings(rankings) {
  renderRanking("#helpRanking", rankings.maisPedemAjuda, "pedido(s)");
  renderRanking("#onTimeRanking", rankings.entregasNoPrazo, "no prazo");
  renderRanking("#delayRanking", rankings.atrasos, "atraso(s)");
}

function renderRanking(selector, ranking, suffix) {
  const html = ranking
    .map(({ funcionario, valor }, index) => `
      <article class="ranking-item">
        <span class="badge">${index + 1}</span>
        ${personAvatar(funcionario, "small")}
        <div>
          <strong>${escapeHtml(funcionario.nome)}</strong>
          <span class="muted">${escapeHtml(funcionario.funcao)}</span>
        </div>
        <strong>${valor} ${suffix}</strong>
      </article>
    `)
    .join("");

  $(selector).innerHTML = html || emptyState("Sem dados suficientes.");
}
