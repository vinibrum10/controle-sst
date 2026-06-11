import { useCallback, useEffect, useState } from "react";
import { listarDisponibilidade, listarHistoricoAjuda } from "../lib/ajuda";
import type { Disponibilidade, HistoricoAjudaItem } from "../types/ajuda";

interface UseAjudaResult {
  disponibilidade: Disponibilidade[];
  historico: HistoricoAjudaItem[];
  carregando: boolean;
  recarregar: () => Promise<void>;
}

export function useAjuda(semana: string): UseAjudaResult {
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade[]>([]);
  const [historico, setHistorico] = useState<HistoricoAjudaItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    const [disp, hist] = await Promise.all([listarDisponibilidade(semana), listarHistoricoAjuda()]);
    setDisponibilidade(disp);
    setHistorico(hist);
  }, [semana]);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setCarregando(true);
      try {
        const [disp, hist] = await Promise.all([listarDisponibilidade(semana), listarHistoricoAjuda()]);
        if (!cancelled) {
          setDisponibilidade(disp);
          setHistorico(hist);
        }
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelled = true;
    };
  }, [semana]);

  return { disponibilidade, historico, carregando, recarregar };
}
