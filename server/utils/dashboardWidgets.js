// Widgets configuraveis da pagina Inicio (Resumo da semana e Acesso rapido).
// "tipo" define o grupo (cartao de indicador ou link de acesso rapido) e
// "visivelPadrao" e o estado assumido quando o usuario nao salvou preferencias.
const WIDGETS_DASHBOARD = [
  { id: "metric_tarefasAtivas", titulo: "Tarefas ativas", tipo: "metric", visivelPadrao: true },
  { id: "metric_concluidas", titulo: "Concluídas na semana", tipo: "metric", visivelPadrao: true },
  { id: "metric_vencidas", titulo: "Vencidas", tipo: "metric", visivelPadrao: true },
  { id: "metric_entregasNoPrazoPercent", titulo: "Entregas no prazo", tipo: "metric", visivelPadrao: true },
  { id: "metric_prazoEm3Dias", titulo: "Vencem em até 3 dias", tipo: "metric", visivelPadrao: false },
  { id: "metric_pedidosAjuda", titulo: "Pedidos de apoio na semana", tipo: "metric", visivelPadrao: false },
  { id: "link_dashboard", titulo: "Dashboard", tipo: "link", visivelPadrao: true },
  { id: "link_tarefas", titulo: "Tarefas da Equipe", tipo: "link", visivelPadrao: true },
  { id: "link_rotaSegura", titulo: "Rota Segura", tipo: "link", visivelPadrao: true },
  { id: "link_treinamentos", titulo: "Treinamentos", tipo: "link", visivelPadrao: true },
  { id: "link_inspecoes", titulo: "Inspeções", tipo: "link", visivelPadrao: true },
  { id: "link_funcionarios", titulo: "Funcionários", tipo: "link", visivelPadrao: true },
  { id: "link_ajuda", titulo: "Apoio / Ajuda", tipo: "link", visivelPadrao: true }
];

const WIDGET_IDS = WIDGETS_DASHBOARD.map((item) => item.id);

// Monta a lista de preferencias efetivas (assumindo o padrao quando nao ha
// registro salvo), agrupada por tipo e ordenada por "ordem" dentro de cada grupo.
function serializePreferenciasDashboard(registros) {
  const porWidget = new Map(registros.map((item) => [item.widget, item]));
  const contadores = {};

  const itens = WIDGETS_DASHBOARD.map((widget) => {
    const registro = porWidget.get(widget.id);
    const ordemPadrao = contadores[widget.tipo] ?? 0;
    contadores[widget.tipo] = ordemPadrao + 1;

    return {
      id: widget.id,
      titulo: widget.titulo,
      tipo: widget.tipo,
      visivel: registro ? registro.visivel : widget.visivelPadrao,
      ordem: registro ? registro.ordem : ordemPadrao
    };
  });

  const grupos = new Map();
  for (const item of itens) {
    if (!grupos.has(item.tipo)) grupos.set(item.tipo, []);
    grupos.get(item.tipo).push(item);
  }

  return [...grupos.values()].flatMap((grupo) => [...grupo].sort((a, b) => a.ordem - b.ordem));
}

module.exports = { WIDGETS_DASHBOARD, WIDGET_IDS, serializePreferenciasDashboard };
