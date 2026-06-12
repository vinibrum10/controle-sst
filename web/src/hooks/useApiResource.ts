import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

interface UseApiResourceResult<T> {
  data: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
}

// Busca um recurso simples (GET) que nao e uma lista de itens com {id}.
// Passe path=null para pular a busca (ex.: aguardando edicaoId disponivel).
export function useApiResource<T>(path: string | null, mensagemErro = "Não foi possível carregar os dados."): UseApiResourceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!path) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const resultado = await apiFetch<T>(path);
      setData(resultado);
      setErro(null);
    } catch {
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }, [path, mensagemErro]);

  useEffect(() => {
    let cancelled = false;

    async function executar() {
      if (!path) {
        if (!cancelled) setCarregando(false);
        return;
      }
      setCarregando(true);
      try {
        const resultado = await apiFetch<T>(path);
        if (!cancelled) {
          setData(resultado);
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
  }, [path, mensagemErro]);

  return { data, carregando, erro, recarregar: carregar };
}
