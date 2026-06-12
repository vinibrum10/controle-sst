import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

interface UseCrudResult<T> {
  items: T[];
  carregando: boolean;
  erro: string | null;
  criar: (dados: Record<string, unknown>) => Promise<T>;
  atualizar: (id: string, dados: Record<string, unknown>) => Promise<T>;
  remover: (id: string) => Promise<void>;
}

export function useCrud<T extends { id: string }>(path: string, mensagemErro = "Não foi possível carregar os dados."): UseCrudResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      try {
        const data = await apiFetch<T[]>(path);
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setErro(mensagemErro);
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelled = true;
    };
  }, [path, mensagemErro]);

  const criar = useCallback(
    async (dados: Record<string, unknown>) => {
      const novo = await apiFetch<T>(path, { method: "POST", body: dados });
      setItems((current) => [novo, ...current]);
      return novo;
    },
    [path],
  );

  const atualizar = useCallback(
    async (id: string, dados: Record<string, unknown>) => {
      const atualizado = await apiFetch<T>(`${path}/${id}`, { method: "PATCH", body: dados });
      setItems((current) => current.map((item) => (item.id === id ? atualizado : item)));
      return atualizado;
    },
    [path],
  );

  const remover = useCallback(
    async (id: string) => {
      await apiFetch<null>(`${path}/${id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [path],
  );

  return { items, carregando, erro, criar, atualizar, remover };
}
