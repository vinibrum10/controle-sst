import { useEffect, useState } from "react";
import { obterDashboard } from "../lib/dashboard";
import type { DashboardData } from "../types/dashboard";

interface UseDashboardResult {
  dashboard: DashboardData | null;
  carregando: boolean;
  erro: string | null;
}

export function useDashboard(semana: string): UseDashboardResult {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const data = await obterDashboard(semana);
        if (!cancelled) setDashboard(data);
      } catch {
        if (!cancelled) setErro("Não foi possível carregar os dados do dashboard.");
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelled = true;
    };
  }, [semana]);

  return { dashboard, carregando, erro };
}
