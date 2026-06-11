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
