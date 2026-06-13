import { useMemo } from "react";
import { useCrud } from "./useCrud";
import { startOfToday } from "../lib/format";
import type { Treinamento } from "../types/programas";

export interface TreinamentosResumo {
  total: number;
  planejados: number;
  realizados: number;
  cancelados: number;
  vencidos: number;
  vencendo: number;
}

interface UseTreinamentosResumoResult {
  resumo: TreinamentosResumo;
  carregando: boolean;
  erro: string | null;
  vazio: boolean;
}

// Indicadores agregados de treinamentos, reaproveitados pela aba "Treinamentos"
// do dashboard e pela tela de gestao de treinamentos.
export function useTreinamentosResumo(): UseTreinamentosResumoResult {
  const { items, carregando, erro } = useCrud<Treinamento>("/treinamentos");

  const resumo = useMemo(() => {
    const hoje = startOfToday();
    const em30Dias = new Date(hoje);
    em30Dias.setDate(em30Dias.getDate() + 30);

    const total = items.length;
    const planejados = items.filter((t) => t.status === "PLANEJADO").length;
    const realizados = items.filter((t) => t.status === "REALIZADO").length;
    const cancelados = items.filter((t) => t.status === "CANCELADO").length;
    const vencidos = items.filter((t) => t.status === "VENCIDO").length;
    const vencendo = items.filter((t) => {
      if (t.status !== "REALIZADO" || !t.validade) return false;
      const validade = new Date(t.validade);
      return validade >= hoje && validade <= em30Dias;
    }).length;

    return { total, planejados, realizados, cancelados, vencidos, vencendo };
  }, [items]);

  return { resumo, carregando, erro, vazio: !carregando && !erro && items.length === 0 };
}
