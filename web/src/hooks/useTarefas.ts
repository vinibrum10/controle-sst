import { useCallback, useEffect, useState } from "react";
import { solicitarAjuda as solicitarAjudaApi } from "../lib/ajuda";
import { atualizarStatusTarefa, excluirTarefa, listarTarefas } from "../lib/tarefas";
import type { StatusTarefa, Tarefa } from "../types/tarefa";

interface UseTarefasResult {
  tarefas: Tarefa[];
  carregando: boolean;
  erro: string | null;
  alterarStatus: (id: string, status: StatusTarefa) => Promise<Tarefa>;
  remover: (id: string) => Promise<void>;
  pedirAjuda: (id: string) => Promise<{ tarefa: Tarefa; ajudante: { nome: string }; mensagem: string }>;
}

export function useTarefas(semana: string): UseTarefasResult {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const data = await listarTarefas({ semana });
        if (!cancelled) setTarefas(data);
      } catch (err) {
        if (!cancelled) setErro(err instanceof Error ? err.message : "Erro ao carregar as tarefas.");
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelled = true;
    };
  }, [semana]);

  const alterarStatus = useCallback(async (id: string, status: StatusTarefa) => {
    const tarefa = await atualizarStatusTarefa(id, status);
    setTarefas((current) => current.map((item) => (item.id === id ? tarefa : item)));
    return tarefa;
  }, []);

  const remover = useCallback(async (id: string) => {
    await excluirTarefa(id);
    setTarefas((current) => current.filter((item) => item.id !== id));
  }, []);

  const pedirAjuda = useCallback(async (id: string) => {
    const resultado = await solicitarAjudaApi(id);
    setTarefas((current) => current.map((item) => (item.id === resultado.tarefa.id ? resultado.tarefa : item)));
    return resultado;
  }, []);

  return { tarefas, carregando, erro, alterarStatus, remover, pedirAjuda };
}
