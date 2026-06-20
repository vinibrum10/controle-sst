import { useState, useEffect } from "react";
import { listarViagens, type Viagem } from "../lib/viagens";

interface ViagensResumo {
  ativas: Viagem[];
  finalizadas: Viagem[];
  horasTotais: number;
  carregando: boolean;
  vazio: boolean;
}

export function useViagensResumo(semana: string): ViagensResumo {
  const [ativas, setAtivas] = useState<Viagem[]>([]);
  const [semanaData, setSemanaData] = useState<Viagem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCarregando(true);

    async function load() {
      try {
        const [ativasRes, semanaRes] = await Promise.all([
          listarViagens({ ativos: true }),
          listarViagens({ semana }),
        ]);
        if (!cancelled) {
          setAtivas(ativasRes);
          setSemanaData(semanaRes);
        }
      } catch {
        // ignora erros silenciosamente no dashboard
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [semana]);

  const finalizadas = semanaData.filter((v) => !!v.finalizadoEm);
  const horasTotais = finalizadas.reduce((sum, v) => sum + (v.duracaoSegundos ?? 0) / 3600, 0);

  return {
    ativas,
    finalizadas,
    horasTotais,
    carregando,
    vazio: !carregando && ativas.length === 0 && semanaData.length === 0
  };
}
