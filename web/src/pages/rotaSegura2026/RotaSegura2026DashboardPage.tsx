import { useEffect, useState } from "react";
import { Panel, EmptyState } from "../../components/ui/Panel";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { EdicaoSelector } from "../../components/rotaSegura2026/EdicaoSelector";
import { useEdicoesRotaSegura } from "../../hooks/useEdicoesRotaSegura";
import { useApiResource } from "../../hooks/useApiResource";
import { areaEquipeLabel, formatMesReferencia } from "../../lib/rotaSegura2026";
import type { RsDashboardResponse } from "../../types/rotaSegura2026";

export function RotaSegura2026DashboardPage() {
  const { edicoes, edicaoAtiva, carregando: carregandoEdicoes, erro: erroEdicoes } = useEdicoesRotaSegura();
  const [edicaoId, setEdicaoId] = useState("");

  useEffect(() => {
    if (!edicaoId && edicaoAtiva) setEdicaoId(edicaoAtiva.id);
  }, [edicaoId, edicaoAtiva]);

  const path = edicaoId ? `/rota-segura/dashboard?edicaoId=${edicaoId}` : carregandoEdicoes ? null : "/rota-segura/dashboard";
  const { data, carregando, erro } = useApiResource<RsDashboardResponse>(path, "Não foi possível carregar o dashboard do Rota Segura.");

  return (
    <div className="grid gap-[18px]">
      <Panel
        title="Rota Segura 2026"
        description={data?.edicao?.slogan || "Programa de avaliação da Análise Preliminar de Risco (APR) das equipes de campo."}
        headerExtra={edicoes.length > 0 ? <EdicaoSelector edicoes={edicoes} value={edicaoId} onChange={setEdicaoId} /> : undefined}
      >
        {(erro || erroEdicoes) && <p className="text-red">{erro || erroEdicoes}</p>}
        {carregando || carregandoEdicoes ? (
          <p className="text-muted">Carregando dashboard...</p>
        ) : !data?.edicao ? (
          <EmptyState message="Nenhuma edição do Rota Segura cadastrada ainda." />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-5">
            <SummaryCard label="Equipes ativas" value={data.totalEquipes} hint="cadastradas e ativas" />
            <SummaryCard label="Colaboradores ativos" value={data.totalColaboradores} hint="vinculados às equipes" />
            <SummaryCard
              label="Avaliações de APR no mês"
              value={data.avaliacoesMes}
              hint={data.mesAtual ? formatMesReferencia(data.mesAtual) : "mês atual"}
            />
            <SummaryCard label="Penalidades no mês" value={data.penalidadesMes} hint="infrações registradas" />
            <SummaryCard label="Pendentes do comitê" value={data.pendentesComite} hint="riscos/medidas a aprovar" />
          </div>
        )}
      </Panel>

      {data?.edicao && (
        <Panel title="Ranking - Top 5" description={`Edição ${data.edicao.nome} (${data.edicao.ano}) - acumulado geral.`}>
          {data.topRanking.length === 0 ? (
            <EmptyState message="Nenhuma avaliação ou penalidade lançada ainda." />
          ) : (
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
                  {data.topRanking.map((linha) => (
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
          )}
        </Panel>
      )}
    </div>
  );
}
