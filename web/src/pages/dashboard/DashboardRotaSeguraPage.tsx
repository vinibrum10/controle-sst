import { Link } from "react-router-dom";
import { Panel, EmptyState } from "../../components/ui/Panel";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { Button } from "../../components/ui/Button";
import { useRotaSeguraResumo } from "../../hooks/useRotaSeguraResumo";
import { areaEquipeLabel, formatMesReferencia } from "../../lib/rotaSegura2026";

export function DashboardRotaSeguraPage() {
  const { legacy, rs2026, temRs2026, carregando, erro, vazio } = useRotaSeguraResumo();

  return (
    <div className="grid gap-6">
      <Panel
        title="Rota Segura"
        description={rs2026?.edicao?.slogan || "Indicadores do programa Rota Segura."}
        headerExtra={
          <div className="flex flex-wrap gap-2">
            <Link to="/programas/rota-segura-2026">
              <Button variant="secondary">Rota Segura 2026</Button>
            </Link>
            <Link to="/programas/rota-segura">
              <Button variant="secondary">Rota Segura (legado)</Button>
            </Link>
          </div>
        }
      >
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="animate-pulse text-muted">Carregando indicadores...</p>
        ) : vazio ? (
          <EmptyState message="Nenhuma rota cadastrada e nenhuma edição do Rota Segura 2026 configurada ainda." />
        ) : temRs2026 && rs2026 ? (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-5">
            <SummaryCard label="Equipes ativas" value={rs2026.totalEquipes} hint="cadastradas e ativas" />
            <SummaryCard label="Colaboradores ativos" value={rs2026.totalColaboradores} hint="vinculados às equipes" />
            <SummaryCard label="Avaliações de APR no mês" value={rs2026.avaliacoesMes} hint={rs2026.mesAtual ? formatMesReferencia(rs2026.mesAtual) : "mês atual"} />
            <SummaryCard label="Penalidades no mês" value={rs2026.penalidadesMes} hint="infrações registradas" />
            <SummaryCard label="Pendentes do comitê" value={rs2026.pendentesComite} hint="riscos/medidas a aprovar" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <SummaryCard label="Rotas cadastradas" value={legacy.total} hint="programa Rota Segura (legado)" />
            <SummaryCard label="Rotas ativas" value={legacy.ativas} />
            <SummaryCard label="Verificações atrasadas" value={legacy.atrasadas} hint={legacy.atrasadas ? "precisam de atenção" : "sem atraso"} />
            <SummaryCard label="Desvios pendentes" value={legacy.desviosPendentes} hint="aguardando tratativa" />
          </div>
        )}
      </Panel>

      {temRs2026 && rs2026 && rs2026.topRanking.length > 0 && (
        <Panel title="Ranking - Top 5" description={`Edição ${rs2026.edicao?.nome} (${rs2026.edicao?.ano}) - acumulado geral.`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Equipe</th>
                  <th className="py-2 pr-3">Área</th>
                  <th className="py-2 pr-3">APR</th>
                  <th className="py-2 pr-3">Penalidades</th>
                  <th className="py-2 pr-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {rs2026.topRanking.map((linha) => (
                  <tr key={linha.equipeId} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3 font-extrabold">{linha.posicao}º</td>
                    <td className="py-2 pr-3">{linha.equipe}</td>
                    <td className="py-2 pr-3 text-muted">{areaEquipeLabel(linha.area)}</td>
                    <td className="py-2 pr-3 text-muted">{linha.pontuacaoApr}</td>
                    <td className="py-2 pr-3 text-muted">{linha.pontosPenalidades}</td>
                    <td className="py-2 pr-3 font-extrabold">{linha.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {!carregando && !vazio && legacy.total > 0 && (
        <Panel title="Rota Segura (legado)" description="Rotas de verificação cadastradas no programa anterior.">
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <SummaryCard label="Rotas cadastradas" value={legacy.total} />
            <SummaryCard label="Rotas ativas" value={legacy.ativas} />
            <SummaryCard label="Verificações atrasadas" value={legacy.atrasadas} hint={legacy.atrasadas ? "precisam de atenção" : "sem atraso"} />
            <SummaryCard label="Desvios pendentes" value={legacy.desviosPendentes} hint="aguardando tratativa" />
          </div>
        </Panel>
      )}
    </div>
  );
}
