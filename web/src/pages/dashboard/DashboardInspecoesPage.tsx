import { Link } from "react-router-dom";
import { Panel, EmptyState } from "../../components/ui/Panel";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { Button } from "../../components/ui/Button";
import { useInspecoesResumo } from "../../hooks/useInspecoesResumo";

export function DashboardInspecoesPage() {
  const { resumo, carregando, erro, vazio } = useInspecoesResumo();

  return (
    <div className="grid gap-6">
      <Panel
        title="Inspeções e auditorias"
        description="Indicadores gerais de inspeções, auditorias e achados."
        headerExtra={
          <Link to="/inspecoes">
            <Button variant="secondary">Ver inspeções</Button>
          </Link>
        }
      >
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="animate-pulse text-muted">Carregando indicadores...</p>
        ) : vazio ? (
          <EmptyState message="Nenhuma inspeção, auditoria ou achado cadastrado ainda. Cadastre registros na tela de Inspeções e auditorias para ver os indicadores aqui." />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <SummaryCard label="Inspeções" value={resumo.totalInspecoes} hint={`${resumo.inspecoesPlanejadas} planejadas · ${resumo.inspecoesRealizadas} realizadas`} />
            <SummaryCard label="Auditorias" value={resumo.totalAuditorias} hint={`${resumo.auditoriasPlanejadas} planejadas · ${resumo.auditoriasRealizadas} realizadas`} />
            <SummaryCard label="Achados abertos" value={resumo.achadosAbertos} hint="aguardando tratativa" />
            <SummaryCard label="Achados concluídos" value={resumo.achadosConcluidos} hint="encerrados" />
          </div>
        )}
      </Panel>

      {!carregando && !vazio && (
        <Panel title="Inspeções por área" description="Distribuição das inspeções cadastradas por área.">
          {resumo.porArea.length === 0 ? (
            <EmptyState message="Nenhuma inspeção com área cadastrada ainda." />
          ) : (
            <ul className="m-0 grid list-none gap-2.5 p-0">
              {resumo.porArea.map((item) => (
                <li key={item.area} className="flex items-center justify-between gap-3 rounded-[8px] border border-line bg-surface-soft px-3.5 py-2.5">
                  <span className="font-extrabold">{item.area}</span>
                  <span className="text-muted">{item.total} inspeção(ões)</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {!carregando && !vazio && resumo.planosAtrasados > 0 && (
        <Panel title="Planos de ação atrasados" description="Planos de ação vinculados a achados que ultrapassaram o prazo.">
          <SummaryCard label="Planos atrasados" value={resumo.planosAtrasados} hint="precisam de atenção" />
        </Panel>
      )}
    </div>
  );
}
