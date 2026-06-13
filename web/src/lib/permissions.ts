import type { Papel } from "../types";

export const PAPEIS: Papel[] = ["ADMIN", "GESTOR", "TST", "VISUALIZADOR", "COLABORADOR"];

export const PAPEL_LABELS: Record<Papel, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  TST: "Técnico de Segurança do Trabalho",
  VISUALIZADOR: "Visualizador",
  COLABORADOR: "Colaborador",
};

export const PAPEL_DESCRICOES: Record<Papel, string> = {
  ADMIN: "Acesso completo ao sistema: gerencia usuários, configurações, dados e todos os programas de SST.",
  GESTOR: "Gerencia equipes, programas de SST, exporta dados e participa do comitê da Rota Segura.",
  TST: "Atua na execução dos programas de SST e nas avaliações da Rota Segura.",
  VISUALIZADOR: "Gerencia o cadastro de funcionários, com acesso de leitura às demais áreas do sistema.",
  COLABORADOR: "Acesso de uso geral ao sistema, sem permissões administrativas.",
};

export interface PermissionItem {
  label: string;
  roles: Papel[];
}

export interface PermissionGroup {
  title: string;
  items: PermissionItem[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Geral",
    items: [
      { label: "Gerenciar funcionários (cadastrar, editar, ativar/inativar)", roles: ["ADMIN", "GESTOR", "VISUALIZADOR"] },
      { label: "Excluir funcionários", roles: ["ADMIN", "GESTOR"] },
      { label: "Gerenciar programas de SST (treinamentos, inspeções, auditorias, achados, planos de ação, anexos)", roles: ["ADMIN", "GESTOR", "TST"] },
      { label: "Gerenciar usuários (papel e status de acesso)", roles: ["ADMIN"] },
      { label: "Exportar dados do sistema", roles: ["ADMIN", "GESTOR"] },
      { label: "Importar dados para o sistema", roles: ["ADMIN"] },
      { label: "Restaurar dados de demonstração", roles: ["ADMIN"] },
    ],
  },
  {
    title: "Rota Segura 2026",
    items: [
      { label: "Configurar o programa (proposta, critérios, regras e premiação)", roles: ["ADMIN"] },
      { label: "Gerenciar equipes e colaboradores", roles: ["ADMIN", "GESTOR", "TST"] },
      { label: "Lançar avaliações de APR e penalidades", roles: ["ADMIN", "TST"] },
      { label: "Decidir comitê (riscos e medidas adicionais)", roles: ["ADMIN", "GESTOR"] },
    ],
  },
];

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

// Rota Segura: somente o administrador cria edicoes, altera proposta,
// criterios, regras condicionais, premiacao e clona edicoes.
export function podeConfigurarRotaSegura(papel?: Papel | null): boolean {
  return papel === "ADMIN";
}

// Rota Segura: cadastro de equipes e colaboradores.
export function podeGerenciarEquipesRotaSegura(papel?: Papel | null): boolean {
  return papel === "ADMIN" || papel === "GESTOR" || papel === "TST";
}

// Rota Segura: lancar/editar avaliacoes de APR e penalidades (SSO = TST).
export function podeLancarAvaliacaoRotaSegura(papel?: Papel | null): boolean {
  return papel === "ADMIN" || papel === "TST";
}

// Rota Segura: aprovar/reprovar riscos e medidas adicionais (Comite = GESTOR).
export function podeDecidirComiteRotaSegura(papel?: Papel | null): boolean {
  return papel === "ADMIN" || papel === "GESTOR";
}
