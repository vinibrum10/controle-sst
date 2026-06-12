import { apiFetch } from "./api";
import type { Papel } from "../types";

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
  provedor: string;
  criadoEm: string;
}

export function listarUsuarios() {
  return apiFetch<UsuarioAdmin[]>("/usuarios");
}

export function atualizarUsuario(id: string, dados: { papel?: Papel; ativo?: boolean }) {
  return apiFetch<UsuarioAdmin>(`/usuarios/${id}`, { method: "PATCH", body: dados });
}
