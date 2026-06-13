import { useMemo } from "react";
import { useCrud } from "./useCrud";
import { startOfToday } from "../lib/format";
import type { Achado, Auditoria, Inspecao, PlanoAcao } from "../types/programas";

export interface InspecoesResumo {
  totalInspecoes: number;
  inspecoesPlanejadas: number;
  inspecoesRealizadas: number;
  totalAuditorias: number;
  auditoriasPlanejadas: number;
  auditoriasRealizadas: number;
  achadosAbertos: number;
  achadosConcluidos: number;
  planosAtrasados: number;
  porArea: { area: string; total: number }[];
}

interface UseInspecoesResumoResult {
  resumo: InspecoesResumo;
  carregando: boolean;
  erro: string | null;
  vazio: boolean;
}

// Indicadores agregados de inspecoes/auditorias/achados, reaproveitados pela
// aba "Inspecoes" do dashboard e pela tela de gestao de inspecoes.
export function useInspecoesResumo(): UseInspecoesResumoResult {
  const { items: inspecoes, carregando: c1, erro: e1 } = useCrud<Inspecao>("/inspecoes");
  const { items: auditorias, carregando: c2, erro: e2 } = useCrud<Auditoria>("/auditorias");
  const { items: achados, carregando: c3, erro: e3 } = useCrud<Achado>("/achados");
  const { items: planosAcao, carregando: c4, erro: e4 } = useCrud<PlanoAcao>("/planos-acao");

  const resumo = useMemo(() => {
    const hoje = startOfToday();

    const porAreaMap = new Map<string, number>();
    inspecoes.forEach((i) => {
      const area = i.area?.trim() || "Sem área";
      porAreaMap.set(area, (porAreaMap.get(area) || 0) + 1);
    });

    return {
      totalInspecoes: inspecoes.length,
      inspecoesPlanejadas: inspecoes.filter((i) => i.status === "PLANEJADA").length,
      inspecoesRealizadas: inspecoes.filter((i) => i.status === "REALIZADA").length,
      totalAuditorias: auditorias.length,
      auditoriasPlanejadas: auditorias.filter((a) => a.status === "PLANEJADA").length,
      auditoriasRealizadas: auditorias.filter((a) => a.status === "REALIZADA").length,
      achadosAbertos: achados.filter((a) => a.status !== "CONCLUIDO").length,
      achadosConcluidos: achados.filter((a) => a.status === "CONCLUIDO").length,
      planosAtrasados: planosAcao.filter((p) => p.status !== "CONCLUIDO" && new Date(p.prazo) < hoje).length,
      porArea: Array.from(porAreaMap.entries())
        .map(([area, total]) => ({ area, total }))
        .sort((a, b) => b.total - a.total),
    };
  }, [inspecoes, auditorias, achados, planosAcao]);

  const carregando = c1 || c2 || c3 || c4;
  const erro = e1 || e2 || e3 || e4;
  const vazio = !carregando && !erro && inspecoes.length === 0 && auditorias.length === 0 && achados.length === 0;

  return { resumo, carregando, erro, vazio };
}
