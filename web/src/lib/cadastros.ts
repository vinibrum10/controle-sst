import { apiFetch } from "./api";

export type CategoriaCadastro =
  | "UNIDADE"
  | "AREA_SETOR"
  | "CARGO_FUNCAO"
  | "EQUIPE"
  | "TIPO_ATIVIDADE"
  | "TIPO_INSPECAO"
  | "TIPO_TREINAMENTO";

export interface CategoriaCadastroInfo {
  id: CategoriaCadastro;
  label: string;
  descricao: string;
}

export const CATEGORIAS_CADASTRO: CategoriaCadastroInfo[] = [
  { id: "UNIDADE", label: "Unidades", descricao: "Unidades, plantas ou filiais da empresa." },
  { id: "AREA_SETOR", label: "Áreas / Setores", descricao: "Áreas ou setores internos." },
  { id: "CARGO_FUNCAO", label: "Cargos / Funções", descricao: "Cargos e funções dos colaboradores." },
  { id: "EQUIPE", label: "Equipes", descricao: "Equipes de trabalho." },
  { id: "TIPO_ATIVIDADE", label: "Tipos de atividade", descricao: "Tipos de atividade das tarefas." },
  { id: "TIPO_INSPECAO", label: "Tipos de inspeção", descricao: "Tipos de inspeção e auditoria." },
  { id: "TIPO_TREINAMENTO", label: "Tipos de treinamento", descricao: "Tipos/normas de treinamento." },
];

export interface ConfiguracaoSistemaItem {
  id: string;
  nomeSistema: string;
  nomeEmpresa: string | null;
  logoUrl: string | null;
  atualizadoEm: string;
}

export interface CadastroGeralItem {
  id: string;
  categoria: CategoriaCadastro;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}

export function buscarConfiguracaoSistema() {
  return apiFetch<ConfiguracaoSistemaItem>("/configuracoes/sistema");
}

export function atualizarConfiguracaoSistema(dados: { nomeSistema?: string; nomeEmpresa?: string | null; logoUrl?: string | null }) {
  return apiFetch<ConfiguracaoSistemaItem>("/configuracoes/sistema", { method: "PATCH", body: dados });
}

export function listarCadastrosGerais() {
  return apiFetch<CadastroGeralItem[]>("/cadastros");
}

export function criarCadastroGeral(dados: { categoria: CategoriaCadastro; nome: string; descricao?: string | null; ordem?: number }) {
  return apiFetch<CadastroGeralItem>("/cadastros", { method: "POST", body: dados });
}

export function atualizarCadastroGeral(id: string, dados: Partial<{ nome: string; descricao: string | null; ativo: boolean; ordem: number }>) {
  return apiFetch<CadastroGeralItem>(`/cadastros/${id}`, { method: "PATCH", body: dados });
}

export function excluirCadastroGeral(id: string) {
  return apiFetch<null>(`/cadastros/${id}`, { method: "DELETE" });
}
