import { useMemo } from "react";
import { useCrud } from "./useCrud";
import type { RsEdicaoPrograma } from "../types/rotaSegura2026";

interface UseEdicoesRotaSeguraResult {
  edicoes: RsEdicaoPrograma[];
  carregando: boolean;
  erro: string | null;
  edicaoAtiva: RsEdicaoPrograma | null;
  criar: (dados: Record<string, unknown>) => Promise<RsEdicaoPrograma>;
  atualizar: (id: string, dados: Record<string, unknown>) => Promise<RsEdicaoPrograma>;
  remover: (id: string) => Promise<void>;
}

// Lista as edicoes do programa Rota Segura, ja ordenadas por ano (desc.) pela
// API, e calcula a edicao ativa (a mais recente marcada como ativa=true).
export function useEdicoesRotaSegura(): UseEdicoesRotaSeguraResult {
  const { items, carregando, erro, criar, atualizar, remover } = useCrud<RsEdicaoPrograma>(
    "/rota-segura/edicoes",
    "Não foi possível carregar as edições do Rota Segura.",
  );

  const edicaoAtiva = useMemo(() => items.find((item) => item.ativo) ?? items[0] ?? null, [items]);

  return { edicoes: items, carregando, erro, edicaoAtiva, criar, atualizar, remover };
}
