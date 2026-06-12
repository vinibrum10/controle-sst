import { useCallback, useEffect, useState } from "react";
import { atualizarUsuario, listarUsuarios, type UsuarioAdmin } from "../lib/usuarios";
import type { Papel } from "../types";

interface UseUsuariosResult {
  usuarios: UsuarioAdmin[];
  carregando: boolean;
  alterarPapel: (id: string, papel: Papel) => Promise<UsuarioAdmin>;
  alterarAtivo: (id: string, ativo: boolean) => Promise<UsuarioAdmin>;
}

export function useUsuarios(): UseUsuariosResult {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      try {
        const data = await listarUsuarios();
        if (!cancelled) setUsuarios(data);
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelled = true;
    };
  }, []);

  const alterarPapel = useCallback(async (id: string, papel: Papel) => {
    const atualizado = await atualizarUsuario(id, { papel });
    setUsuarios((current) => current.map((item) => (item.id === id ? atualizado : item)));
    return atualizado;
  }, []);

  const alterarAtivo = useCallback(async (id: string, ativo: boolean) => {
    const atualizado = await atualizarUsuario(id, { ativo });
    setUsuarios((current) => current.map((item) => (item.id === id ? atualizado : item)));
    return atualizado;
  }, []);

  return { usuarios, carregando, alterarPapel, alterarAtivo };
}
