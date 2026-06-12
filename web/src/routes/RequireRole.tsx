import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_PATH } from "../components/sidebar/navigation";
import type { Papel } from "../types";

export function RequireRole({ roles, children }: { roles: Papel[]; children: ReactNode }) {
  const { usuario } = useAuth();

  if (!usuario || !roles.includes(usuario.papel)) {
    return <Navigate to={DEFAULT_PATH} replace />;
  }

  return <>{children}</>;
}
