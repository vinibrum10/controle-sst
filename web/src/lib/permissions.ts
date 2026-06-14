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

export type ChavePermissao =
  | "GERENCIAR_EQUIPE"
  | "EXCLUIR_FUNCIONARIO"
  | "GERENCIAR_PROGRAMAS_SST"
  | "GERENCIAR_USUARIOS"
  | "EXPORTAR_DADOS"
  | "IMPORTAR_DADOS"
  | "RESTAURAR_DEMO"
  | "CONFIGURAR_ROTA_SEGURA"
  | "GERENCIAR_EQUIPES_ROTA_SEGURA"
  | "LANCAR_AVALIACAO_ROTA_SEGURA"
  | "DECIDIR_COMITE_ROTA_SEGURA"
  | "EXCLUIR_AVALIACAO_ROTA_SEGURA"
  | "GERENCIAR_CADASTROS";

export const CHAVES_PERMISSAO: ChavePermissao[] = [
  "GERENCIAR_EQUIPE",
  "EXCLUIR_FUNCIONARIO",
  "GERENCIAR_PROGRAMAS_SST",
  "GERENCIAR_USUARIOS",
  "EXPORTAR_DADOS",
  "IMPORTAR_DADOS",
  "RESTAURAR_DEMO",
  "CONFIGURAR_ROTA_SEGURA",
  "GERENCIAR_EQUIPES_ROTA_SEGURA",
  "LANCAR_AVALIACAO_ROTA_SEGURA",
  "DECIDIR_COMITE_ROTA_SEGURA",
  "EXCLUIR_AVALIACAO_ROTA_SEGURA",
  "GERENCIAR_CADASTROS",
];

export type MatrizPermissoes = Record<Papel, Record<ChavePermissao, boolean>>;

export interface PermissionItem {
  label: string;
  chave: ChavePermissao;
}

export interface PermissionGroup {
  title: string;
  items: PermissionItem[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Geral",
    items: [
      { label: "Gerenciar funcionários (cadastrar, editar, ativar/inativar)", chave: "GERENCIAR_EQUIPE" },
      { label: "Excluir funcionários", chave: "EXCLUIR_FUNCIONARIO" },
      { label: "Gerenciar programas de SST (treinamentos, inspeções, auditorias, achados, planos de ação, anexos)", chave: "GERENCIAR_PROGRAMAS_SST" },
      { label: "Gerenciar usuários (papel e status de acesso)", chave: "GERENCIAR_USUARIOS" },
      { label: "Exportar dados do sistema", chave: "EXPORTAR_DADOS" },
      { label: "Importar dados para o sistema", chave: "IMPORTAR_DADOS" },
      { label: "Restaurar dados de demonstração", chave: "RESTAURAR_DEMO" },
      { label: "Gerenciar cadastros gerais (unidades, áreas, cargos, equipes e tipos)", chave: "GERENCIAR_CADASTROS" },
    ],
  },
  {
    title: "Rota Segura 2026",
    items: [
      { label: "Configurar o programa (proposta, critérios, regras e premiação)", chave: "CONFIGURAR_ROTA_SEGURA" },
      { label: "Gerenciar equipes e colaboradores", chave: "GERENCIAR_EQUIPES_ROTA_SEGURA" },
      { label: "Lançar avaliações de APR e penalidades", chave: "LANCAR_AVALIACAO_ROTA_SEGURA" },
      { label: "Decidir comitê (riscos e medidas adicionais)", chave: "DECIDIR_COMITE_ROTA_SEGURA" },
      { label: "Excluir avaliações de APR e penalidades", chave: "EXCLUIR_AVALIACAO_ROTA_SEGURA" },
    ],
  },
];

export const CHAVE_LABELS: Record<ChavePermissao, string> = PERMISSION_GROUPS.reduce((labels, group) => {
  for (const item of group.items) labels[item.chave] = item.label;
  return labels;
}, {} as Record<ChavePermissao, string>);

// Matriz usada como fallback enquanto a matriz real (banco) ainda nao foi
// carregada, evitando que toda a interface fique sem permissoes por um instante.
export const MATRIZ_PADRAO: MatrizPermissoes = {
  ADMIN: {
    GERENCIAR_EQUIPE: true,
    EXCLUIR_FUNCIONARIO: true,
    GERENCIAR_PROGRAMAS_SST: true,
    GERENCIAR_USUARIOS: true,
    EXPORTAR_DADOS: true,
    IMPORTAR_DADOS: true,
    RESTAURAR_DEMO: true,
    CONFIGURAR_ROTA_SEGURA: true,
    GERENCIAR_EQUIPES_ROTA_SEGURA: true,
    LANCAR_AVALIACAO_ROTA_SEGURA: true,
    DECIDIR_COMITE_ROTA_SEGURA: true,
    EXCLUIR_AVALIACAO_ROTA_SEGURA: true,
    GERENCIAR_CADASTROS: true,
  },
  GESTOR: {
    GERENCIAR_EQUIPE: true,
    EXCLUIR_FUNCIONARIO: true,
    GERENCIAR_PROGRAMAS_SST: true,
    GERENCIAR_USUARIOS: false,
    EXPORTAR_DADOS: true,
    IMPORTAR_DADOS: false,
    RESTAURAR_DEMO: false,
    CONFIGURAR_ROTA_SEGURA: false,
    GERENCIAR_EQUIPES_ROTA_SEGURA: true,
    LANCAR_AVALIACAO_ROTA_SEGURA: false,
    DECIDIR_COMITE_ROTA_SEGURA: true,
    EXCLUIR_AVALIACAO_ROTA_SEGURA: false,
    GERENCIAR_CADASTROS: true,
  },
  TST: {
    GERENCIAR_EQUIPE: false,
    EXCLUIR_FUNCIONARIO: false,
    GERENCIAR_PROGRAMAS_SST: true,
    GERENCIAR_USUARIOS: false,
    EXPORTAR_DADOS: false,
    IMPORTAR_DADOS: false,
    RESTAURAR_DEMO: false,
    CONFIGURAR_ROTA_SEGURA: false,
    GERENCIAR_EQUIPES_ROTA_SEGURA: true,
    LANCAR_AVALIACAO_ROTA_SEGURA: true,
    DECIDIR_COMITE_ROTA_SEGURA: false,
    EXCLUIR_AVALIACAO_ROTA_SEGURA: false,
    GERENCIAR_CADASTROS: false,
  },
  VISUALIZADOR: {
    GERENCIAR_EQUIPE: true,
    EXCLUIR_FUNCIONARIO: false,
    GERENCIAR_PROGRAMAS_SST: false,
    GERENCIAR_USUARIOS: false,
    EXPORTAR_DADOS: false,
    IMPORTAR_DADOS: false,
    RESTAURAR_DEMO: false,
    CONFIGURAR_ROTA_SEGURA: false,
    GERENCIAR_EQUIPES_ROTA_SEGURA: false,
    LANCAR_AVALIACAO_ROTA_SEGURA: false,
    DECIDIR_COMITE_ROTA_SEGURA: false,
    EXCLUIR_AVALIACAO_ROTA_SEGURA: false,
    GERENCIAR_CADASTROS: false,
  },
  COLABORADOR: {
    GERENCIAR_EQUIPE: false,
    EXCLUIR_FUNCIONARIO: false,
    GERENCIAR_PROGRAMAS_SST: false,
    GERENCIAR_USUARIOS: false,
    EXPORTAR_DADOS: false,
    IMPORTAR_DADOS: false,
    RESTAURAR_DEMO: false,
    CONFIGURAR_ROTA_SEGURA: false,
    GERENCIAR_EQUIPES_ROTA_SEGURA: false,
    LANCAR_AVALIACAO_ROTA_SEGURA: false,
    DECIDIR_COMITE_ROTA_SEGURA: false,
    EXCLUIR_AVALIACAO_ROTA_SEGURA: false,
    GERENCIAR_CADASTROS: false,
  },
};
