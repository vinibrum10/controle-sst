import { useState } from "react";
import { DashboardPanelCard, type PanelMetric } from "../../components/dashboard/DashboardPanelCard";
import { useDashboard } from "../../hooks/useDashboard";
import { useViagensResumo } from "../../hooks/useViagensResumo";
import { useAuth } from "../../hooks/useAuth";
import { DASHBOARD_PANELS, getPainelsVisiveis } from "../../lib/dashboardPanels";
import { currentWeekValue } from "../../lib/format";

export function DashboardOverviewPage() {
  const [semana] = useState(currentWeekValue);
  const { usuario } = useAuth();
  const { dashboard, carregando: carregandoDashboard } = useDashboard(semana);
  const { ativas: viagensAtivas, finalizadas: viagensFinalizadas, horasTotais: viagensHoras, carregando: carregandoViagens } = useViagensResumo(semana);

  const papel = usuario?.papel ?? "COLABORADOR";
  const paineis = getPainelsVisiveis(DASHBOARD_PANELS, papel);

  function metricsAtividades(): PanelMetric[] {
    if (!dashboard) return [];
    const total = dashboard.metrics.tarefasAtivas + dashboard.metrics.concluidas;
    const pendentes = (dashboard.statusChart?.pendente ?? 0);
    const emAndamento = (dashboard.statusChart?.em_andamento ?? 0);
    return [
      { label: "Total na semana", value: total },
      { label: "Pendentes", value: pendentes },
      { label: "Em andamento", value: emAndamento },
      { label: "Concluídas", value: dashboard.metrics.concluidas, accent: "green" as const },
      { label: "Atrasadas", value: dashboard.metrics.vencidas, accent: dashboard.metrics.vencidas > 0 ? "red" as const : undefined },
      { label: "Prazo em 3 dias", value: dashboard.metrics.prazoEm3Dias, accent: dashboard.metrics.prazoEm3Dias > 0 ? "amber" as const : undefined },
    ];
  }

  function metricsViagens(): PanelMetric[] {
    return [
      { label: "Em deslocamento", value: viagensAtivas.length },
      { label: "Finalizadas na semana", value: viagensFinalizadas.length, accent: "green" as const },
      { label: "Tempo consumido", value: `${viagensHoras.toFixed(1)}h` },
    ];
  }

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="mb-1 text-[1.1rem] font-extrabold tracking-tight">Acompanhamento de Atividades e Viagens</h2>
        <p className="text-[0.85rem] text-muted">Indicadores resumidos dos módulos ativos nesta semana.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {paineis.map((painel) => {
          if (painel.id === "atividades") {
            return (
              <DashboardPanelCard
                key={painel.id}
                panel={painel}
                metrics={metricsAtividades()}
                loading={carregandoDashboard}
              />
            );
          }
          if (painel.id === "viagens") {
            return (
              <DashboardPanelCard
                key={painel.id}
                panel={painel}
                metrics={metricsViagens()}
                loading={carregandoViagens}
              />
            );
          }
          return null;
        })}
      </div>

      {paineis.length === 0 && (
        <p className="text-center text-muted py-8 text-[0.9rem]">Nenhum painel disponível para o seu perfil.</p>
      )}
    </div>
  );
}
