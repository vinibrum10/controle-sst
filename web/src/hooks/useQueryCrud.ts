import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

interface UseQueryCrudResult<T> {
  items: T[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  criar: (dados: Record<string, unknown>) => Promise<T>;
  atualizar: (id: string, dados: Record<string, unknown>) => Promise<T>;
  remover: (id: string) => Promise<void>;
}

// Variante de useCrud para recursos filtrados por querystring (ex.:
// "/rota-segura/criterios?edicaoId=..."). A listagem usa a URL completa
// (com query), enquanto criar/atualizar/remover usam apenas o caminho base.
export function useQueryCrud<T extends { id: string }>(
  basePath: string,
  query = "",
  mensagemErro = "Não foi possível carregar os dados.",
): UseQueryCrudResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const listPath = `${basePath}${query}`;

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await apiFetch<T[]>(listPath);
      setItems(data);
      setErro(null);
    } catch {
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }, [listPath, mensagemErro]);

  useEffect(() => {
    let cancelled = false;

    async function executar() {
      setCarregando(true);
      try {
        const data = await apiFetch<T[]>(listPath);
        if (!cancelled) {
          setItems(data);
          setErro(null);
        }
      } catch {
        if (!cancelled) setErro(mensagemErro);
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    executar();
    return () => {
      cancelled = true;
    };
  }, [listPath, mensagemErro]);

  const criar = useCallback(
    async (dados: Record<string, unknown>) => {
      const novo = await apiFetch<T>(basePath, { method: "POST", body: dados });
      setItems((current) => [novo, ...current]);
      return novo;
    },
    [basePath],
  );

  const atualizar = useCallback(
    async (id: string, dados: Record<string, unknown>) => {
      const atualizado = await apiFetch<T>(`${basePath}/${id}`, { method: "PATCH", body: dados });
      setItems((current) => current.map((item) => (item.id === id ? atualizado : item)));
      return atualizado;
    },
    [basePath],
  );

  const remover = useCallback(
    async (id: string) => {
      await apiFetch<null>(`${basePath}/${id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [basePath],
  );

  return { items, carregando, erro, recarregar: carregar, criar, atualizar, remover };
}
