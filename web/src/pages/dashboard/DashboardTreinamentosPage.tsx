import { Link } from "react-router-dom";
import { Panel, EmptyState } from "../../components/ui/Panel";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { Button } from "../../components/ui/Button";
import { useTreinamentosResumo } from "../../hooks/useTreinamentosResumo";

export function DashboardTreinamentosPage() {
  const { resumo, carregando, erro, vazio } = useTreinamentosResumo();

  return (
    <div className="grid gap-6">
      <Panel
        title="Treinamentos"
        description="Indicadores gerais dos treinamentos cadastrados."
        headerExtra={
          <Link to="/treinamentos">
            <Button variant="secondary">Ver treinamentos</Button>
          </Link>
        }
      >
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="animate-pulse text-muted">Carregando indicadores...</p>
        ) : vazio ? (
          <EmptyState message="Nenhum treinamento cadastrado ainda. Cadastre treinamentos na tela de Treinamentos para ver os indicadores aqui." />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <SummaryCard label="Total" value={resumo.total} hint="treinamentos cadastrados" />
            <SummaryCard label="Planejados" value={resumo.planejados} hint="aguardando realização" />
            <SummaryCard label="Realizados" value={resumo.realizados} hint="concluídos" />
            <SummaryCard label="Vencendo em 30 dias" value={resumo.vencendo} hint="precisam de reciclagem" />
          </div>
        )}
      </Panel>

      {!carregando && !vazio && (
        <Panel title="Treinamentos por status" description="Distribuição dos treinamentos cadastrados por situação atual.">
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <SummaryCard label="Planejados" value={resumo.planejados} />
            <SummaryCard label="Realizados" value={resumo.realizados} />
            <SummaryCard label="Vencidos" value={resumo.vencidos} />
            <SummaryCard label="Cancelados" value={resumo.cancelados} />
          </div>
        </Panel>
      )}
    </div>
  );
}
