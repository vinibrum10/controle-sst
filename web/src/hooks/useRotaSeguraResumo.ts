import { useMemo } from "react";
import { useCrud } from "./useCrud";
import { useApiResource } from "./useApiResource";
import { useEdicoesRotaSegura } from "./useEdicoesRotaSegura";
import { verificacaoAtrasada } from "../lib/rotaSegura";
import type { Achado, RotaSegura } from "../types/programas";
import type { RsDashboardResponse } from "../types/rotaSegura2026";

export interface RotaSeguraLegacyResumo {
  total: number;
  ativas: number;
  atrasadas: number;
  desviosPendentes: number;
}

interface UseRotaSeguraResumoResult {
  legacy: RotaSeguraLegacyResumo;
  rs2026: RsDashboardResponse | null;
  temRs2026: boolean;
  carregando: boolean;
  erro: string | null;
  vazio: boolean;
}

// Indicadores agregados do programa Rota Segura (legado + Rota Segura 2026),
// reaproveitados pela aba "Rota Segura" do dashboard.
export function useRotaSeguraResumo(): UseRotaSeguraResumoResult {
  const { items: rotas, carregando: c1, erro: e1 } = useCrud<RotaSegura>("/rotas-seguras");
  const { items: achados, carregando: c2, erro: e2 } = useCrud<Achado>("/achados");
  const { edicaoAtiva, carregando: c3, erro: e3 } = useEdicoesRotaSegura();

  const edicaoId = edicaoAtiva?.id || "";
  const path = edicaoId ? `/rota-segura/dashboard?edicaoId=${edicaoId}` : c3 ? null : "/rota-segura/dashboard";
  const { data, carregando: c4, erro: e4 } = useApiResource<RsDashboardResponse>(path, "Não foi possível carregar o dashboard do Rota Segura.");

  const legacy = useMemo(() => {
    const total = rotas.length;
    const ativas = rotas.filter((r) => r.status === "ATIVA").length;
    const atrasadas = rotas.filter(verificacaoAtrasada).length;
    const desviosPendentes = achados.filter((a) => a.rotaSeguraId && a.status !== "CONCLUIDO").length;
    return { total, ativas, atrasadas, desviosPendentes };
  }, [rotas, achados]);

  const carregando = c1 || c2 || c3 || c4;
  const erro = e1 || e2 || e3 || e4;
  const temRs2026 = !!data?.edicao;
  const vazio = !carregando && !erro && rotas.length === 0 && !temRs2026;

  return { legacy, rs2026: data, temRs2026, carregando, erro, vazio };
}
