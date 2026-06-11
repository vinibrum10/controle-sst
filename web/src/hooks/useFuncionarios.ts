import { useCallback, useEffect, useState } from "react";
import {
  alternarAtivoFuncionario as alternarAtivoFuncionarioApi,
  criarFuncionario as criarFuncionarioApi,
  listarFuncionarios,
  removerFuncionario as removerFuncionarioApi,
  type NovoFuncionario,
} from "../lib/funcionarios";
import type { Funcionario } from "../types/funcionario";

interface UseFuncionariosResult {
  funcionarios: Funcionario[];
  carregando: boolean;
  criar: (dados: NovoFuncionario) => Promise<Funcionario>;
  alternarAtivo: (id: string, ativo: boolean) => Promise<Funcionario>;
  remover: (id: string) => Promise<void>;
}

export function useFuncionarios(): UseFuncionariosResult {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      try {
        const data = await listarFuncionarios();
        if (!cancelled) setFuncionarios(data);
      } finally {
        if (!cancelled) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelled = true;
    };
  }, []);

  const criar = useCallback(async (dados: NovoFuncionario) => {
    const novo = await criarFuncionarioApi(dados);
    setFuncionarios((current) => [...current, novo].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
    return novo;
  }, []);

  const alternarAtivo = useCallback(async (id: string, ativo: boolean) => {
    const atualizado = await alternarAtivoFuncionarioApi(id, ativo);
    setFuncionarios((current) => current.map((item) => (item.id === id ? atualizado : item)));
    return atualizado;
  }, []);

  const remover = useCallback(async (id: string) => {
    await removerFuncionarioApi(id);
    setFuncionarios((current) => current.filter((item) => item.id !== id));
  }, []);

  return { funcionarios, carregando, criar, alternarAtivo, remover };
}
