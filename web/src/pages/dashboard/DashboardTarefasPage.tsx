import { useState } from "react";
import { MetricGrid } from "../../components/dashboard/MetricGrid";
import { WorkloadList } from "../../components/dashboard/WorkloadList";
import { StatusChart } from "../../components/dashboard/StatusChart";
import { RankingList } from "../../components/dashboard/RankingList";
import { Panel } from "../../components/ui/Panel";
import { useDashboard } from "../../hooks/useDashboard";
import { currentWeekValue } from "../../lib/format";

export function DashboardTarefasPage() {
  const [semana, setSemana] = useState(currentWeekValue);
  const { dashboard, carregando, erro } = useDashboard(semana);

  return (
    <div className="grid gap-[18px]">
      <div className="flex justify-end">
        <label className="grid w-full gap-1.5 text-[0.82rem] font-bold text-muted sm:w-auto">
          Semana
          <input
            type="week"
            value={semana}
            onChange={(event) => setSemana(event.target.value)}
            className="h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none focus:border-teal sm:w-[160px]"
          />
        </label>
      </div>

      {erro && <Panel className="text-red">{erro}</Panel>}

      {!dashboard ? (
        <Panel className={carregando ? "animate-pulse" : ""}>Carregando dados do dashboard...</Panel>
      ) : (
        <>
          <MetricGrid metrics={dashboard.metrics} />

          <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <Panel title="Carga por pessoa" description="Horas estimadas em tarefas abertas na semana selecionada.">
              <WorkloadList cargaPorPessoa={dashboard.cargaPorPessoa} />
            </Panel>

            <Panel title="Status das tarefas" description="Visão rápida por situação e tipo de demanda.">
              <StatusChart statusChart={dashboard.statusChart} typeChart={dashboard.typeChart} />
            </Panel>
          </div>

          <div className="grid gap-[18px] lg:grid-cols-3">
            <Panel title="Mais pedem ajuda">
              <RankingList ranking={dashboard.rankings.maisPedemAjuda} suffix="pedido(s)" />
            </Panel>
            <Panel title="Entregas no prazo">
              <RankingList ranking={dashboard.rankings.entregasNoPrazo} suffix="no prazo" />
            </Panel>
            <Panel title="Atrasos">
              <RankingList ranking={dashboard.rankings.atrasos} suffix="atraso(s)" />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
