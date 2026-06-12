import type { Papel } from "../types";

export function podeGerenciarEquipe(papel?: Papel | null): boolean {
  return papel === "ADMIN" || papel === "GESTOR";
}

export function podeExportarDados(papel?: Papel | null): boolean {
  return papel === "ADMIN" || papel === "GESTOR";
}

export function podeImportarDados(papel?: Papel | null): boolean {
  return papel === "ADMIN";
}

export function podeRestaurarDemo(papel?: Papel | null): boolean {
  return papel === "ADMIN";
}
