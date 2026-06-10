import { apiFetch } from "./client.js";

export function login(email, senha) {
  return apiFetch("/auth/login", { method: "POST", body: { email, senha }, auth: false });
}

export function register(nome, email, senha) {
  return apiFetch("/auth/register", { method: "POST", body: { nome, email, senha }, auth: false });
}

export function getMe() {
  return apiFetch("/auth/me");
}
