import { describe, expect, test } from "vitest";
import { buildSummaryCard, DASHBOARD_WIDGETS, QUICK_LINKS_BY_ID } from "./dashboardWidgets";
import { preferenciasPadraoDashboard } from "./dashboard";

const metrics = {
  tarefasAtivas: 5,
  concluidas: 3,
  vencidas: 0,
  prazoEm3Dias: 2,
  entregasNoPrazoPercent: 80,
  pedidosAjuda: 1
};

describe("buildSummaryCard", () => {
  test("monta o cartao para cada metrica conhecida", () => {
    expect(buildSummaryCard("metric_tarefasAtivas", metrics)).toEqual({ label: "Tarefas ativas", value: 5, hint: "pendentes ou em andamento" });
    expect(buildSummaryCard("metric_entregasNoPrazoPercent", metrics)).toEqual({ label: "Entregas no prazo", value: "80%", hint: "da semana atual" });
  });

  test("ajusta o destaque de 'Vencidas' conforme o valor", () => {
    expect(buildSummaryCard("metric_vencidas", metrics)?.hint).toBe("sem atraso aberto");
    expect(buildSummaryCard("metric_vencidas", { ...metrics, vencidas: 2 })?.hint).toBe("precisam de atenção");
  });

  test("retorna null para id desconhecido", () => {
    expect(buildSummaryCard("metric_inexistente", metrics)).toBeNull();
  });
});

describe("QUICK_LINKS_BY_ID", () => {
  test("contem uma entrada para cada widget do tipo link", () => {
    const linkIds = DASHBOARD_WIDGETS.filter((widget) => widget.tipo === "link").map((widget) => widget.id);
    for (const id of linkIds) {
      expect(QUICK_LINKS_BY_ID[id]).toBeDefined();
    }
  });
});

describe("preferenciasPadraoDashboard", () => {
  test("retorna um item por widget, com ordem sequencial por tipo", () => {
    const padrao = preferenciasPadraoDashboard();
    expect(padrao).toHaveLength(DASHBOARD_WIDGETS.length);

    const metricas = padrao.filter((item) => item.tipo === "metric");
    expect(metricas.map((item) => item.ordem)).toEqual(metricas.map((_, index) => index));

    const links = padrao.filter((item) => item.tipo === "link");
    expect(links.map((item) => item.ordem)).toEqual(links.map((_, index) => index));
  });

  test("indicadores ocultos por padrao tem visivel=false", () => {
    const padrao = preferenciasPadraoDashboard();
    expect(padrao.find((item) => item.id === "metric_prazoEm3Dias")?.visivel).toBe(false);
    expect(padrao.find((item) => item.id === "metric_pedidosAjuda")?.visivel).toBe(false);
    expect(padrao.find((item) => item.id === "metric_tarefasAtivas")?.visivel).toBe(true);
  });
});
