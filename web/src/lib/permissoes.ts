import { apiFetch } from "./api";
import type { Papel } from "../types";
import type { ChavePermissao } from "./permissions";

export interface PermissaoItem {
  papel: Papel;
  chave: ChavePermissao;
  permitido: boolean;
}

export function listarPermissoes() {
  return apiFetch<PermissaoItem[]>("/permissoes");
}

export function atualizarPermissoes(itens: PermissaoItem[]) {
  return apiFetch<PermissaoItem[]>("/permissoes", { method: "PATCH", body: { itens } });
}
