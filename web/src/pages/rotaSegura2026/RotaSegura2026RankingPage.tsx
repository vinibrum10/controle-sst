import { useEffect, useState } from "react";
import { Panel, EmptyState } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/IconSprite";
import { EdicaoSelector } from "../../components/rotaSegura2026/EdicaoSelector";
import { useApiResource } from "../../hooks/useApiResource";
import { useEdicoesRotaSegura } from "../../hooks/useEdicoesRotaSegura";
import { apiFetch } from "../../lib/api";
import { fieldClasses, selectInlineClasses } from "../../lib/formClasses";
import { tipoAprLabel, tipoInfracaoLabel, AREA_EQUIPE_OPTIONS, areaEquipeLabel } from "../../lib/rotaSegura2026";
import { formatDate } from "../../lib/format";
import type { RsRankingResponse, RsRelatorioResponse } from "../../types/rotaSegura2026";

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function RotaSegura2026RankingPage() {
  const { edicoes, edicaoAtiva } = useEdicoesRotaSegura();
  const [edicaoId, setEdicaoId] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [area, setArea] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [tst, setTst] = useState("");
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    if (!edicaoId && edicaoAtiva) setEdicaoId(edicaoAtiva.id);
  }, [edicaoId, edicaoAtiva]);

  const params = new URLSearchParams();
  if (edicaoId) params.set("edicaoId", edicaoId);
  if (mes) params.set("mes", mes);
  if (!mes && ano) params.set("ano", ano);
  if (area) params.set("area", area);
  if (supervisor) params.set("supervisor", supervisor);
  if (tst) params.set("tst", tst);

  const { data, carregando, erro } = useApiResource<RsRankingResponse>(`/rota-segura/ranking?${params.toString()}`, "Não foi possível carregar o ranking.");

  async function handleExportar() {
    setExportando(true);
    try {
      const relatorio = await apiFetch<RsRelatorioResponse>(`/rota-segura/relatorios?${params.toString()}`);

      const linhas: (string | number)[][] = [
        ["Rota Segura", relatorio.edicao ? `${relatorio.edicao.nome} (${relatorio.edicao.ano})` : ""],
        ["Período", mes || ano || "Acumulado"],
        [],
        ["Ranking"],
        ["Posição", "Equipe", "Área", "Supervisor", "TST", "APR", "Penalidades", "Total", "Avaliações", "Penalidades (qtd)"],
        ...relatorio.ranking.map((linha) => [
          linha.posicao,
          linha.equipe,
          areaEquipeLabel(linha.area),
          linha.supervisor || "-",
          linha.tst || "-",
          linha.pontuacaoApr,
          linha.pontosPenalidades,
          linha.total,
          linha.qtdAvaliacoes,
          linha.qtdPenalidades,
        ]),
        [],
        ["Avaliações de APR"],
        ["Mês", "Data", "Equipe", "Tipo", "OS/APR", "Pontuação"],
        ...relatorio.avaliacoes.map((avaliacao) => [
          avaliacao.mesReferencia,
          formatDate(avaliacao.dataAvaliacao),
          avaliacao.equipe?.nome || "-",
          tipoAprLabel(avaliacao.tipo),
          [avaliacao.numeroOs, avaliacao.numeroApr].filter(Boolean).join(" / ") || "-",
          avaliacao.pontuacao,
        ]),
        [],
        ["Penalidades"],
        ["Mês", "Data", "Equipe", "Colaborador", "Tipo", "Pontos", "Descrição"],
        ...relatorio.penalidades.map((penalidade) => [
          penalidade.mesReferencia,
          formatDate(penalidade.dataOcorrencia),
          penalidade.equipe?.nome || "-",
          penalidade.colaborador?.nome || "-",
          tipoInfracaoLabel(penalidade.tipo),
          penalidade.pontos,
          penalidade.descricao,
        ]),
      ];

      const csv = linhas.map((linha) => linha.map(csvCell).join(";")).join("\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rota-segura-${relatorio.edicao?.ano || "ranking"}-${mes || ano || "acumulado"}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="grid gap-[18px]">
      <Panel
        title="Ranking"
        description="Classificação das equipes por pontuação (APR + penalidades), conforme os critérios configurados na edição."
        headerExtra={edicoes.length > 0 ? <EdicaoSelector edicoes={edicoes} value={edicaoId} onChange={setEdicaoId} /> : undefined}
      >
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-end">
          <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
            Mês
            <input
              type="month"
              className={`${selectInlineClasses} w-full sm:min-w-[140px]`}
              value={mes}
              onChange={(e) => {
                setMes(e.target.value);
                if (e.target.value) setAno("");
              }}
            />
          </label>
          <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
            Ano (se mês não informado)
            <input
              type="number"
              min={2000}
              max={2100}
              placeholder="Acumulado"
              className={`${fieldClasses} w-full sm:min-w-[120px]`}
              value={ano}
              onChange={(e) => {
                setAno(e.target.value);
                if (e.target.value) setMes("");
              }}
            />
          </label>
          <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
            Área
            <select className={`${selectInlineClasses} w-full sm:min-w-[160px]`} value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas</option>
              {AREA_EQUIPE_OPTIONS.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {areaEquipeLabel(opcao)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
            Supervisor
            <input
              type="text"
              placeholder="Filtrar por supervisor"
              className={`${fieldClasses} w-full sm:min-w-[160px]`}
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
            TST
            <input
              type="text"
              placeholder="Filtrar por TST"
              className={`${fieldClasses} w-full sm:min-w-[160px]`}
              value={tst}
              onChange={(e) => setTst(e.target.value)}
            />
          </label>
          <Button variant="download" onClick={handleExportar} disabled={!data?.edicao || exportando} full className="sm:w-auto">
            <Icon id="icon-download" />
            Exportar CSV
          </Button>
        </div>
      </Panel>

      <Panel title={data?.edicao ? `Ranking - ${data.edicao.nome} (${data.edicao.ano})` : "Ranking"}>
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="text-muted">Carregando ranking...</p>
        ) : !data?.edicao || data.ranking.length === 0 ? (
          <EmptyState message="Nenhuma avaliação ou penalidade lançada com os filtros atuais." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Equipe</th>
                  <th className="py-2 pr-3">Área</th>
                  <th className="py-2 pr-3">Supervisor</th>
                  <th className="py-2 pr-3">TST</th>
                  <th className="py-2 pr-3">APR</th>
                  <th className="py-2 pr-3">Penalidades</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Avaliações</th>
                </tr>
              </thead>
              <tbody>
                {data.ranking.map((linha) => (
                  <tr key={linha.equipeId} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3 font-extrabold">{linha.posicao}º</td>
                    <td className="py-2 pr-3">{linha.equipe}</td>
                    <td className="py-2 pr-3 text-muted">{areaEquipeLabel(linha.area)}</td>
                    <td className="py-2 pr-3 text-muted">{linha.supervisor || "-"}</td>
                    <td className="py-2 pr-3 text-muted">{linha.tst || "-"}</td>
                    <td className="py-2 pr-3 text-muted">{linha.pontuacaoApr}</td>
                    <td className="py-2 pr-3 text-muted">{linha.pontosPenalidades}</td>
                    <td className="py-2 pr-3 font-extrabold">{linha.total}</td>
                    <td className="py-2 pr-3 text-muted">{linha.qtdAvaliacoes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
