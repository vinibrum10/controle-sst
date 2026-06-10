import { obterDashboard } from "../services/api/dashboard.js";
import { setState } from "../state/store.js";

export async function carregarDashboard(semana) {
  const dashboard = await obterDashboard(semana);
  setState({ dashboard });
  return dashboard;
}
