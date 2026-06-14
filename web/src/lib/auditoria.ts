import { apiFetch } from "./api";
import { CHAVE_LABELS, PAPEL_LABELS, type ChavePermissao } from "./permissions";
import type { Papel } from "../types";

export interface LogAuditoriaItem {
  id: string;
  usuarioId: string | null;
  usuarioNome: string | null;
  usuarioEmail: string | null;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  detalhes: Record<string, unknown> | null;
  criadoEm: string;
}

interface AlteracaoPermissao {
  papel: Papel;
  chave: ChavePermissao;
  permitidoAntes: boolean;
  permitidoDepois: boolean;
}

export const ACAO_LABELS: Record<string, string> = {
  CRIAR: "Criação",
  ATUALIZAR: "Atualização",
  EXCLUIR: "Exclusão",
  EXPORTAR: "Exportação",
  IMPORTAR: "Importação",
  RESTAURAR_DEMO: "Restauração de demonstração",
};

export const ENTIDADE_LABELS: Record<string, string> = {
  CadastroGeral: "Cadastro geral",
  ConfiguracaoSistema: "Configuração do sistema",
  PermissaoPerfil: "Permissões",
  Dados: "Dados",
};

export function listarAuditoria(limite?: number) {
  const query = limite ? `?limite=${limite}` : "";
  return apiFetch<LogAuditoriaItem[]>(`/auditoria${query}`);
}

// Resume o campo "detalhes" (JSON livre) de cada log em uma frase curta,
// adaptada conforme a entidade e a acao registradas.
export function formatarDetalhes(item: LogAuditoriaItem): string {
  const { entidade, detalhes } = item;
  if (!detalhes) return "-";

  if (entidade === "PermissaoPerfil" && Array.isArray(detalhes.alteracoes)) {
    const alteracoes = detalhes.alteracoes as AlteracaoPermissao[];
    return alteracoes
      .map((alteracao) => {
        const papel = PAPEL_LABELS[alteracao.papel] ?? alteracao.papel;
        const chave = CHAVE_LABELS[alteracao.chave] ?? alteracao.chave;
        const depois = alteracao.permitidoDepois ? "Permitido" : "Bloqueado";
        return `${papel} · ${chave} → ${depois}`;
      })
      .join("; ");
  }

  if (entidade === "Dados") {
    if (typeof detalhes.funcionarios === "number" || typeof detalhes.tarefas === "number") {
      return `${detalhes.funcionarios ?? 0} funcionário(s), ${detalhes.tarefas ?? 0} tarefa(s)`;
    }
    if (typeof detalhes.funcionariosImportados === "number" || typeof detalhes.tarefasImportadas === "number") {
      const erros = typeof detalhes.erros === "number" && detalhes.erros > 0 ? `, ${detalhes.erros} erro(s)` : "";
      return `${detalhes.funcionariosImportados ?? 0} funcionário(s), ${detalhes.tarefasImportadas ?? 0} tarefa(s)${erros}`;
    }
  }

  const pares = Object.entries(detalhes)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== "")
    .map(([chave, valor]) => `${chave}: ${typeof valor === "object" ? JSON.stringify(valor) : String(valor)}`);

  return pares.length > 0 ? pares.join(", ") : "-";
}
