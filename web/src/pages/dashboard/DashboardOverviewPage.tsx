import { useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { QuickAccessCard, type QuickAccessLink } from "../../components/home/QuickAccessCard";
import { useDashboard } from "../../hooks/useDashboard";
import { useTreinamentosResumo } from "../../hooks/useTreinamentosResumo";
import { useInspecoesResumo } from "../../hooks/useInspecoesResumo";
import { useRotaSeguraResumo } from "../../hooks/useRotaSeguraResumo";
import { currentWeekValue } from "../../lib/format";

const DASHBOARD_LINKS: QuickAccessLink[] = [
  { to: "/dashboard/tarefas", label: "Tarefas da Equipe", description: "Plano semanal, carga por pessoa e status das tarefas.", icon: "icon-task" },
  { to: "/dashboard/rota-segura", label: "Rota Segura", description: "Ranking, avaliações de APR e penalidades das equipes.", icon: "icon-shield" },
  { to: "/dashboard/treinamentos", label: "Treinamentos", description: "Status, vencimentos e indicadores de treinamentos.", icon: "icon-check" },
  { to: "/dashboard/inspecoes", label: "Inspeções", description: "Inspeções, auditorias e achados em aberto.", icon: "icon-alert" },
];

export function DashboardOverviewPage() {
  const [semana] = useState(currentWeekValue);
  const { dashboard, carregando: carregandoTarefas } = useDashboard(semana);
  const { resumo: treinamentos, carregando: carregandoTreinamentos, vazio: treinamentosVazio } = useTreinamentosResumo();
  const { resumo: inspecoes, carregando: carregandoInspecoes, vazio: inspecoesVazio } = useInspecoesResumo();
  const { legacy: rotaSegura, rs2026, temRs2026, carregando: carregandoRotaSegura, vazio: rotaSeguraVazio } = useRotaSeguraResumo();

  return (
    <div className="grid gap-6">
      <Panel title="Visão geral" description="Resumo consolidado dos principais indicadores de cada área do programa.">
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <SummaryCard
            label="Tarefas ativas"
            value={carregandoTarefas || !dashboard ? "-" : dashboard.metrics.tarefasAtivas}
            hint={carregandoTarefas || !dashboard ? "carregando..." : `${dashboard.metrics.vencidas} vencida(s)`}
          />
          <SummaryCard
            label="Rota Segura"
            value={carregandoRotaSegura ? "-" : rotaSeguraVazio ? "-" : temRs2026 && rs2026 ? rs2026.totalEquipes : rotaSegura.ativas}
            hint={carregandoRotaSegura ? "carregando..." : rotaSeguraVazio ? "sem dados ainda" : temRs2026 ? "equipes ativas (RS 2026)" : "rotas ativas"}
          />
          <SummaryCard
            label="Treinamentos realizados"
            value={carregandoTreinamentos || treinamentosVazio ? "-" : treinamentos.realizados}
            hint={carregandoTreinamentos ? "carregando..." : treinamentosVazio ? "sem dados ainda" : `${treinamentos.total} cadastrado(s)`}
          />
          <SummaryCard
            label="Achados abertos"
            value={carregandoInspecoes || inspecoesVazio ? "-" : inspecoes.achadosAbertos}
            hint={carregandoInspecoes ? "carregando..." : inspecoesVazio ? "sem dados ainda" : `${inspecoes.totalInspecoes} inspeção(ões)`}
          />
        </div>
      </Panel>

      <section>
        <h2 className="mb-3 text-[1.05rem] font-extrabold tracking-tight">Visões do dashboard</h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {DASHBOARD_LINKS.map((link) => (
            <QuickAccessCard key={link.to} {...link} />
          ))}
        </div>
      </section>
    </div>
  );
}
