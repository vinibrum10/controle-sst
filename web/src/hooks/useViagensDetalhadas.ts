import { useState, useEffect, useMemo } from "react";
import { listarViagens, type Viagem } from "../lib/viagens";

export interface ViagemAgregada {
  id: string;
  nome: string;
  totalSemana: number;
  horasTotais: number;
  ativasCount: number;
  ultimaViagem: Viagem | null;
}

export function useViagensDetalhadas(semana: string, tecnicoId?: string) {
  const [ativas, setAtivas] = useState<Viagem[]>([]);
  const [semanaData, setSemanaData] = useState<Viagem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCarregando(true);
    const filtro = tecnicoId ? { tecnicoId } : {};
    Promise.all([
      listarViagens({ ativos: true, ...filtro }),
      listarViagens({ semana, ...filtro }),
    ])
      .then(([a, s]) => {
        if (!cancelled) { setAtivas(a); setSemanaData(s); }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCarregando(false); });
    return () => { cancelled = true; };
  }, [semana, tecnicoId]);

  const finalizadas = useMemo(() => semanaData.filter((v) => !!v.finalizadoEm), [semanaData]);

  const horasTotais = useMemo(
    () => finalizadas.reduce((s, v) => s + (v.duracaoSegundos ?? 0) / 3600, 0),
    [finalizadas]
  );

  const alertaAbertas = useMemo(
    () => ativas.filter((v) => Date.now() - new Date(v.iniciadoEm).getTime() > 8 * 3600000),
    [ativas]
  );

  const tecnicosEmViagem = useMemo(
    () => new Set(ativas.map((v) => v.tecnicoId).filter(Boolean)).size,
    [ativas]
  );

  const byTecnico = useMemo((): ViagemAgregada[] => {
    const map = new Map<string, ViagemAgregada>();

    for (const v of semanaData) {
      if (!v.tecnicoId || !v.tecnico) continue;
      if (!map.has(v.tecnicoId)) {
        map.set(v.tecnicoId, { id: v.tecnicoId, nome: v.tecnico.nome, totalSemana: 0, horasTotais: 0, ativasCount: 0, ultimaViagem: null });
      }
      const e = map.get(v.tecnicoId)!;
      e.totalSemana++;
      if (v.finalizadoEm) e.horasTotais += (v.duracaoSegundos ?? 0) / 3600;
      if (!e.ultimaViagem || v.iniciadoEm > e.ultimaViagem.iniciadoEm) e.ultimaViagem = v;
    }

    for (const v of ativas) {
      if (!v.tecnicoId || !v.tecnico) continue;
      if (!map.has(v.tecnicoId)) {
        map.set(v.tecnicoId, { id: v.tecnicoId, nome: v.tecnico.nome, totalSemana: 0, horasTotais: 0, ativasCount: 0, ultimaViagem: null });
      }
      map.get(v.tecnicoId)!.ativasCount++;
    }

    return Array.from(map.values()).sort((a, b) => b.totalSemana - a.totalSemana);
  }, [ativas, semanaData]);

  const topTecnico = byTecnico.length > 0
    ? byTecnico.reduce((m, t) => t.horasTotais > m.horasTotais ? t : m)
    : null;

  return { ativas, finalizadas, horasTotais, carregando, alertaAbertas, tecnicosEmViagem, byTecnico, topTecnico };
}
