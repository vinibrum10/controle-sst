import { createContext } from "react";
import type { NotificacaoItem } from "../lib/notificacoes";

export interface NotificationsContextValue {
  itens: NotificacaoItem[];
  naoLidas: number;
  carregando: boolean;
  recarregar: () => Promise<void>;
  marcarLida: (id: string) => Promise<void>;
  marcarTodasLidas: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);
