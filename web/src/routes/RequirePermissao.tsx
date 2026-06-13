import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermissao } from "../hooks/usePermissao";
import { DEFAULT_PATH } from "../components/sidebar/navigation";
import type { ChavePermissao } from "../lib/permissions";

export function RequirePermissao({ chave, children }: { chave: ChavePermissao; children: ReactNode }) {
  const permitido = usePermissao(chave);

  if (!permitido) {
    return <Navigate to={DEFAULT_PATH} replace />;
  }

  return <>{children}</>;
}
