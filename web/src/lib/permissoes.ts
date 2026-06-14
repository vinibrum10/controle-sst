import { apiFetch } from "./api";
import type { Papel } from "../types";
import type { ChavePermissao } from "./permissions";

export interface PermissaoItem {
  papel: Papel;
  chave: ChavePermissao;
  permitido: boolean;
}

export interface PermissaoHistoricoItem {
  id: string;
  papel: Papel;
  chave: ChavePermissao;
  permitidoAntes: boolean;
  permitidoDepois: boolean;
  alteradoPorId: string | null;
  alteradoPorNome: string | null;
  alteradoPorEmail: string | null;
  criadoEm: string;
}

export function listarPermissoes() {
  return apiFetch<PermissaoItem[]>("/permissoes");
}

export function atualizarPermissoes(itens: PermissaoItem[]) {
  return apiFetch<PermissaoItem[]>("/permissoes", { method: "PATCH", body: { itens } });
}
