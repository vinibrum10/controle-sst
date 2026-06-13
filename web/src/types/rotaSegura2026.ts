export type RsAreaEquipe = "LINHAS_LIMPEZA_FAIXA" | "EAT" | "PCC" | "UFV" | "OUTRO";
export type RsTipoApr = "AMOSTRAL" | "FORMS";
export type RsTipoInfracao = "LEVE" | "GRAVE" | "GRAVISSIMA";
export type RsTipoRevisaoComite = "RISCOS_ADICIONAIS" | "MEDIDAS_ADICIONAIS";
export type RsDecisaoComite = "PENDENTE" | "APROVADO" | "REPROVADO";
export type RsTipoCriterio = "PROATIVO" | "REATIVO";
export type RsCategoriaCriterio =
  | "APR"
  | "VIDEO"
  | "INSPECAO"
  | "DDS"
  | "TREINAMENTO"
  | "TRANSITO"
  | "COMPORTAMENTO"
  | "PENALIDADE"
  | "OUTRO";
export type RsTipoCondicao = "REQUER_CRITERIO_APROVADO" | "BLOQUEADO_PARA_TIPO_APR" | "LIMITE_MENSAL_POR_EQUIPE";

export interface RsEdicaoPrograma {
  id: string;
  nome: string;
  ano: number;
  slogan: string | null;
  objetivo: string | null;
  descricao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  ativo: boolean;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
  proposta?: RsProposta | null;
  _count?: { criterios: number; regras: number; premiacoes: number; avaliacoes: number; penalidades: number };
}

export interface RsProposta {
  id: string;
  edicaoId: string;
  titulo: string | null;
  slogan: string | null;
  mensagemAbertura: string | null;
  objetivoGeral: string | null;
  justificativa: string | null;
  publicoAlvo: string | null;
  areasParticipantes: string | null;
  regrasGerais: string | null;
  criteriosAvaliacao: string | null;
  estruturaComite: string | null;
  regraPremiacao: string | null;
  premios: string | null;
  cronograma: string | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface RsCriterio {
  id: string;
  edicaoId: string;
  codigo: string | null;
  nome: string;
  descricao: string | null;
  tipo: RsTipoCriterio;
  pontuacao: number;
  categoria: RsCategoriaCriterio;
  exigeComite: boolean;
  exigeEvidencia: boolean;
  aplicaAmostral: boolean;
  aplicaForms: boolean;
  ativo: boolean;
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface RsRegraCondicional {
  id: string;
  edicaoId: string;
  criterioId: string;
  criterioDependenteId: string | null;
  tipoCondicao: RsTipoCondicao;
  parametros: Record<string, unknown> | null;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface RsPremiacao {
  id: string;
  edicaoId: string;
  area: RsAreaEquipe;
  quantidade: number;
  posicaoInicial: number;
  posicaoFinal: number;
  descricaoPremio: string;
  observacoes: string | null;
}

export interface RsEquipeColaboradorResumo {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface RsEquipe {
  id: string;
  nome: string;
  area: RsAreaEquipe;
  supervisor: string | null;
  tst: string | null;
  ativo: boolean;
  observacoes: string | null;
  colaboradores?: RsEquipeColaboradorResumo[];
}

export interface RsEquipeRef {
  id: string;
  nome: string;
  area: RsAreaEquipe;
}

export interface RsColaborador {
  id: string;
  nome: string;
  matricula: string | null;
  funcao: string | null;
  equipeId: string | null;
  equipe?: RsEquipeRef | null;
  ativo: boolean;
}

export interface RsComiteDecisao {
  id: string;
  avaliacaoId: string;
  tipo: RsTipoRevisaoComite;
  decisao: RsDecisaoComite;
  responsavel: string | null;
  dataDecisao: string;
  observacoes: string | null;
}

export interface RsAprAvaliacao {
  id: string;
  edicaoId: string;
  edicao?: { id: string; nome: string; ano: number };
  mesReferencia: string;
  dataAvaliacao: string;
  equipeId: string;
  equipe?: { id: string; nome: string; area: RsAreaEquipe; supervisor: string | null; tst: string | null };
  tipo: RsTipoApr;
  numeroOs: string | null;
  numeroApr: string | null;
  atividade: string | null;
  local: string | null;
  avaliador: string | null;
  observacoes: string | null;
  cabecalhoOk: boolean;
  enderecoOk: boolean;
  assinaturasOk: boolean;
  riscosMinimosOk: boolean;
  medidasMinimasOk: boolean;
  coerenciaOk: boolean;
  arquivadaEam: boolean;
  legivel: boolean;
  aprovacaoBasica: boolean;
  riscosAdicionais: boolean;
  riscosAdicionaisDescricao: string | null;
  riscosAdicionaisComite: RsDecisaoComite;
  medidasAdicionais: boolean;
  medidasAdicionaisDescricao: string | null;
  medidasAdicionaisComite: RsDecisaoComite;
  pontuacao: number;
  criadoEm: string;
  atualizadoEm: string;
  decisoesComite?: RsComiteDecisao[];
}

export interface RsPenalidade {
  id: string;
  edicaoId: string;
  edicao?: { id: string; nome: string; ano: number };
  mesReferencia: string;
  equipeId: string;
  equipe?: RsEquipeRef;
  colaboradorId: string | null;
  colaborador?: { id: string; nome: string } | null;
  tipo: RsTipoInfracao;
  pontos: number;
  descricao: string;
  dataOcorrencia: string;
  responsavel: string | null;
  observacoes: string | null;
  criadoEm: string;
}

export interface RsRankingLinha {
  posicao: number;
  equipeId: string;
  equipe: string;
  area: RsAreaEquipe;
  supervisor: string | null;
  tst: string | null;
  pontuacaoApr: number;
  pontosPenalidades: number;
  total: number;
  qtdAvaliacoes: number;
  qtdPenalidades: number;
}

export interface RsRankingResponse {
  edicao: { id: string; nome: string; ano: number } | null;
  ranking: RsRankingLinha[];
}

export interface RsDashboardResponse {
  edicao: { id: string; nome: string; ano: number; slogan: string | null } | null;
  mesAtual?: string;
  totalEquipes: number;
  totalColaboradores: number;
  avaliacoesMes: number;
  penalidadesMes: number;
  pendentesComite: number;
  topRanking: RsRankingLinha[];
}

export interface RsRelatorioResponse {
  edicao: { id: string; nome: string; ano: number } | null;
  mes: string | null;
  ano?: string | null;
  avaliacoes: RsAprAvaliacao[];
  penalidades: RsPenalidade[];
  ranking: RsRankingLinha[];
}
