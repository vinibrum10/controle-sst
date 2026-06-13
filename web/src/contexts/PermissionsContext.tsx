import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PermissionsContext } from "./permissions-context";
import { useAuth } from "../hooks/useAuth";
import { listarPermissoes, type PermissaoItem } from "../lib/permissoes";
import { CHAVES_PERMISSAO, MATRIZ_PADRAO, PAPEIS, type ChavePermissao, type MatrizPermissoes } from "../lib/permissions";

function montarMatriz(itens: PermissaoItem[]): MatrizPermissoes {
  const matriz = {} as MatrizPermissoes;
  for (const papel of PAPEIS) {
    matriz[papel] = {} as Record<ChavePermissao, boolean>;
    for (const chave of CHAVES_PERMISSAO) {
      matriz[papel][chave] = false;
    }
  }
  for (const item of itens) {
    if (matriz[item.papel]) {
      matriz[item.papel][item.chave] = item.permitido;
    }
  }
  return matriz;
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [matriz, setMatriz] = useState<MatrizPermissoes>(MATRIZ_PADRAO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function executar() {
      if (!usuario) {
        if (!cancelled) {
          setMatriz(MATRIZ_PADRAO);
          setCarregando(false);
        }
        return;
      }
      setCarregando(true);
      try {
        const itens = await listarPermissoes();
        if (!cancelled) setMatriz(montarMatriz(itens));
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    executar();
    return () => {
      cancelled = true;
    };
  }, [usuario]);

  const recarregar = useCallback(async () => {
    if (!usuario) {
      setMatriz(MATRIZ_PADRAO);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const itens = await listarPermissoes();
      setMatriz(montarMatriz(itens));
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  const atualizarMatriz = useCallback((itens: PermissaoItem[]) => {
    setMatriz(montarMatriz(itens));
  }, []);

  const temPermissao = useCallback(
    (chave: ChavePermissao) => {
      if (!usuario) return false;
      return matriz[usuario.papel]?.[chave] ?? false;
    },
    [matriz, usuario]
  );

  return (
    <PermissionsContext.Provider value={{ matriz, carregando, recarregar, atualizarMatriz, temPermissao }}>
      {children}
    </PermissionsContext.Provider>
  );
}
