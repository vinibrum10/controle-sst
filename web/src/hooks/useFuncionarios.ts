import { useEffect, useState } from "react";
import { listarFuncionarios } from "../lib/funcionarios";
import type { Funcionario } from "../types/funcionario";

interface UseFuncionariosResult {
  funcionarios: Funcionario[];
  carregando: boolean;
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

  return { funcionarios, carregando };
}
