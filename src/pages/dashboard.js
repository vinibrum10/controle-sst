import { getState } from "../state/store.js";
import { carregarDashboard } from "../hooks/useDashboard.js";
import { renderMetricCards, renderWorkload, renderCharts, renderRankings } from "../components/metrics.js";

export async function renderDashboardPage() {
  const { filtros } = getState();
  const dashboard = await carregarDashboard(filtros.semana);

  renderMetricCards(dashboard.metrics);
  renderWorkload(dashboard.cargaPorPessoa);
  renderCharts(dashboard.statusChart, dashboard.typeChart);
  renderRankings(dashboard.rankings);
}
