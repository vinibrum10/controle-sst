import { useContext } from "react";
import { PermissionsContext } from "../contexts/permissions-context";
import type { ChavePermissao } from "../lib/permissions";

export function usePermissoes() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissoes deve ser usado dentro de PermissionsProvider");
  return ctx;
}

export function usePermissao(chave: ChavePermissao): boolean {
  const { temPermissao } = usePermissoes();
  return temPermissao(chave);
}
