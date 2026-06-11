import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getMe, login as apiLogin, register as apiRegister } from "../lib/auth";
import { getToken, setToken } from "../lib/api";
import type { Usuario } from "../types";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getToken();
      if (token) {
        try {
          const { usuario } = await getMe();
          if (!cancelled) setUsuario(usuario);
        } catch {
          setToken(null);
        }
      }
      if (!cancelled) setCarregando(false);
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const { token, usuario } = await apiLogin(email, senha);
    setToken(token);
    setUsuario(usuario);
    return usuario;
  }, []);

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    const { token, usuario } = await apiRegister(nome, email, senha);
    setToken(token);
    setUsuario(usuario);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
