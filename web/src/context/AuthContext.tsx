import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, login as apiLogin, register as apiRegister } from "../lib/auth";
import { getToken, setToken } from "../lib/api";
import type { Usuario } from "../lib/types";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  register: (nome: string, email: string, senha: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCarregando(false);
      return;
    }

    getMe()
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => setToken(null))
      .finally(() => setCarregando(false));
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
