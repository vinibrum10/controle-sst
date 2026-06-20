import { useState, useEffect, useMemo } from "react";
import { listarTarefas } from "../lib/tarefas";
import type { Tarefa } from "../types/tarefa";
import { isDone, isLate, wasOnTime } from "../lib/tarefaHelpers";
import { dateValue, startOfToday, toDateInputValue } from "../lib/format";

export interface TarefaPrioridade extends Tarefa {
  motivo: string;
  urgencia: number;
}

function getMotivo(t: Tarefa): { motivo: string; urgencia: number } | null {
  if (isDone(t)) return null;
  const today = startOfToday();
  const prazoMs = t.prazo ? dateValue(t.prazo) : null;
  const temApoio = t.pedidosAjuda.some((p) => p.status === "ABERTO");

  if (t.prioridade === "CRITICA" && isLate(t)) return { motivo: "Crítica e atrasada", urgencia: 0 };
  if (isLate(t)) return { motivo: "Atrasada — ação imediata", urgencia: 1 };
  if (prazoMs !== null && prazoMs < today.getTime() + 86400000) return { motivo: "Vence hoje", urgencia: 2 };
  if (prazoMs !== null && prazoMs < today.getTime() + 3 * 86400000) return { motivo: "Prazo em até 3 dias", urgencia: 3 };
  if (temApoio) return { motivo: "Pedido de apoio aberto", urgencia: 4 };
  if (!t.responsavelId) return { motivo: "Sem responsável atribuído", urgencia: 5 };
  if (!t.prazo) return { motivo: "Sem prazo definido", urgencia: 6 };
  return null;
}

export interface TarefasDetalhadasKpis {
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  atrasadas: number;
  venceEm3: number;
  taxaNoPrazo: number;
  comApoioAberto: number;
}

export function useTarefasDetalhadas(semana: string, tecnicoId?: string) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCarregando(true);
    listarTarefas({ semana, responsavelId: tecnicoId || undefined })
      .then((data) => { if (!cancelled) setTarefas(data); })
      .catch(() => { if (!cancelled) setTarefas([]); })
      .finally(() => { if (!cancelled) setCarregando(false); });
    return () => { cancelled = true; };
  }, [semana, tecnicoId]);

  const computed = useMemo(() => {
    const today = startOfToday();
    const todayStr = toDateInputValue(today);
    const tomorrowStr = toDateInputValue(new Date(today.getTime() + 86400000));
    const in3daysStr = toDateInputValue(new Date(today.getTime() + 3 * 86400000));

    const concluidas = tarefas.filter(isDone);
    const atrasadas = tarefas.filter(isLate);
    const concluidasNoPrazo = concluidas.filter(wasOnTime);
    const venceEm3 = tarefas.filter((t) => {
      if (isDone(t) || !t.prazo) return false;
      const p = t.prazo.slice(0, 10);
      return p >= todayStr && p <= in3daysStr;
    });

    const kpis: TarefasDetalhadasKpis = {
      total: tarefas.length,
      pendentes: tarefas.filter((t) => t.status === "PENDENTE").length,
      emAndamento: tarefas.filter((t) => t.status === "EM_ANDAMENTO").length,
      concluidas: concluidas.length,
      atrasadas: atrasadas.length,
      venceEm3: venceEm3.length,
      taxaNoPrazo: concluidas.length > 0 ? Math.round((concluidasNoPrazo.length / concluidas.length) * 100) : 0,
      comApoioAberto: tarefas.filter((t) => t.pedidosAjuda.some((p) => p.status === "ABERTO")).length,
    };

    const priorityTasks: TarefaPrioridade[] = tarefas
      .map((t) => { const r = getMotivo(t); return r ? { ...t, ...r } : null; })
      .filter((t): t is TarefaPrioridade => t !== null)
      .sort((a, b) => a.urgencia - b.urgencia);

    const criticalTasks = tarefas
      .filter((t) => !isDone(t) && (t.prioridade === "CRITICA" || isLate(t) || t.pedidosAjuda.some((p) => p.status === "ABERTO")))
      .slice(0, 5);

    const upcomingToday = tarefas.filter((t) => !isDone(t) && t.prazo?.slice(0, 10) === todayStr);
    const upcomingTomorrow = tarefas.filter((t) => !isDone(t) && t.prazo?.slice(0, 10) === tomorrowStr);
    const upcoming3days = tarefas.filter((t) => {
      if (isDone(t) || !t.prazo) return false;
      const p = t.prazo.slice(0, 10);
      return p > tomorrowStr && p <= in3daysStr;
    });

    return { kpis, priorityTasks, criticalTasks, upcomingToday, upcomingTomorrow, upcoming3days };
  }, [tarefas]);

  return { tarefas, carregando, ...computed };
}
