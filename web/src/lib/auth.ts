import { apiFetch } from "./api";
import type { Usuario } from "../types";

interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export function login(email: string, senha: string) {
  return apiFetch<AuthResponse>("/auth/login", { method: "POST", body: { email, senha }, auth: false });
}

export function register(nome: string, email: string, senha: string) {
  return apiFetch<AuthResponse>("/auth/register", { method: "POST", body: { nome, email, senha }, auth: false });
}

export function getMe() {
  return apiFetch<{ usuario: Usuario }>("/auth/me");
}

export function changePassword(senhaAtual: string, novaSenha: string) {
  return apiFetch<{ mensagem: string }>("/auth/senha", { method: "POST", body: { senhaAtual, novaSenha } });
}

export interface AtualizarPerfilInput {
  nome?: string;
  email?: string;
  telefone?: string | null;
  cargo?: string | null;
  setor?: string | null;
  avatarUrl?: string | null;
}

export function updateMe(dados: AtualizarPerfilInput) {
  return apiFetch<{ usuario: Usuario }>("/auth/me", { method: "PATCH", body: dados });
}
