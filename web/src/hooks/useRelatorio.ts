import { useEffect, useState } from "react";
import { obterRelatorio } from "../lib/relatorios";
import type { RelatorioData } from "../types/relatorio";

interface UseRelatorioResult {
  relatorio: RelatorioData | null;
  carregando: boolean;
  erro: string | null;
}

export function useRelatorio(inicio: string, fim: string): UseRelatorioResult {
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const data = await obterRelatorio(inicio, fim);
        if (!cancelled) setRelatorio(data);
      } catch {
        if (!cancelled) setErro("Não foi possível carregar o relatório.");
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelled = true;
    };
  }, [inicio, fim]);

  return { relatorio, carregando, erro };
}
