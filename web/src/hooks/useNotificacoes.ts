import { useContext } from "react";
import { NotificationsContext } from "../contexts/notifications-context";

export function useNotificacoes() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificacoes deve ser usado dentro de NotificationsProvider");
  return ctx;
}
