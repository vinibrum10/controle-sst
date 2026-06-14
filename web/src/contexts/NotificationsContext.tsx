import { useCallback, useEffect, useState, type ReactNode } from "react";
import { NotificationsContext } from "./notifications-context";
import { useAuth } from "../hooks/useAuth";
import { listarNotificacoes, marcarNotificacaoLida, marcarTodasNotificacoesLidas, type NotificacaoItem } from "../lib/notificacoes";

const POLLING_MS = 60000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [itens, setItens] = useState<NotificacaoItem[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!usuario) {
      setItens([]);
      setNaoLidas(0);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const resposta = await listarNotificacoes();
      setItens(resposta.itens);
      setNaoLidas(resposta.naoLidas);
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    let cancelled = false;

    async function executar() {
      if (!usuario) {
        if (!cancelled) {
          setItens([]);
          setNaoLidas(0);
          setCarregando(false);
        }
        return;
      }
      setCarregando(true);
      try {
        const resposta = await listarNotificacoes();
        if (!cancelled) {
          setItens(resposta.itens);
          setNaoLidas(resposta.naoLidas);
        }
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    executar();
    return () => {
      cancelled = true;
    };
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;
    const interval = setInterval(carregar, POLLING_MS);
    return () => clearInterval(interval);
  }, [usuario, carregar]);

  const marcarLida = useCallback(
    async (id: string) => {
      if (id.startsWith("prazo-")) return;
      await marcarNotificacaoLida(id);
      await carregar();
    },
    [carregar]
  );

  const marcarTodasLidas = useCallback(async () => {
    await marcarTodasNotificacoesLidas();
    await carregar();
  }, [carregar]);

  return (
    <NotificationsContext.Provider value={{ itens, naoLidas, carregando, recarregar: carregar, marcarLida, marcarTodasLidas }}>
      {children}
    </NotificationsContext.Provider>
  );
}
