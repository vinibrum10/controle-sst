import { createContext } from "react";
import type { Usuario } from "../types";

export interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  register: (nome: string, email: string, senha: string) => Promise<Usuario>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
