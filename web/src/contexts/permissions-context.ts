import { createContext } from "react";
import type { ChavePermissao, MatrizPermissoes } from "../lib/permissions";
import type { PermissaoItem } from "../lib/permissoes";

export interface PermissionsContextValue {
  matriz: MatrizPermissoes;
  carregando: boolean;
  recarregar: () => Promise<void>;
  atualizarMatriz: (itens: PermissaoItem[]) => void;
  temPermissao: (chave: ChavePermissao) => boolean;
}

export const PermissionsContext = createContext<PermissionsContextValue | null>(null);
