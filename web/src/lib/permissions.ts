import type { Papel } from "../types";

export const PAPEIS: Papel[] = ["ADMIN", "GESTOR", "TST", "VISUALIZADOR", "COLABORADOR"];

export const PAPEL_LABELS: Record<Papel, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  TST: "Técnico de Segurança do Trabalho",
  VISUALIZADOR: "Visualizador",
  COLABORADOR: "Colaborador",
};

// Cadastrar, editar e ativar/inativar funcionarios.
export function podeGerenciarEquipe(papel?: Papel | null): boolean {
  return papel === "ADMIN" || papel === "GESTOR" || papel === "VISUALIZADOR";
}

// Excluir funcionarios (acao irreversivel).
export function podeExcluirFuncionario(papel?: Papel | null): boolean {
  return papel === "ADMIN" || papel === "GESTOR";
}

// Criar/editar/excluir registros dos programas de SST (treinamentos,
// inspecoes, auditorias, achados, planos de acao, rotas seguras, anexos).
export function podeGerenciarProgramasSST(papel?: Papel | null): boolean {
  return papel === "ADMIN" || papel === "GESTOR" || papel === "TST";
}

// Alterar papel e status de outros usuarios.
export function podeGerenciarUsuarios(papel?: Papel | null): boolean {
  return papel === "ADMIN";
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
