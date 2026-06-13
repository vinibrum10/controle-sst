import type { BadgeVariant } from "./badge";
import type {
  RsAreaEquipe,
  RsCategoriaCriterio,
  RsDecisaoComite,
  RsTipoApr,
  RsTipoCondicao,
  RsTipoCriterio,
  RsTipoInfracao,
  RsTipoRevisaoComite,
} from "../types/rotaSegura2026";

export const AREA_EQUIPE_OPTIONS: RsAreaEquipe[] = ["LINHAS_LIMPEZA_FAIXA", "EAT", "PCC", "UFV", "OUTRO"];

export const AREA_EQUIPE_LABELS: Record<RsAreaEquipe, string> = {
  LINHAS_LIMPEZA_FAIXA: "Linhas / Limpeza de Faixa",
  EAT: "EAT",
  PCC: "PCC",
  UFV: "UFV",
  OUTRO: "Outra",
};

export function areaEquipeLabel(area: RsAreaEquipe): string {
  return AREA_EQUIPE_LABELS[area] || area;
}

export const TIPO_APR_OPTIONS: RsTipoApr[] = ["AMOSTRAL", "FORMS"];

export const TIPO_APR_LABELS: Record<RsTipoApr, string> = {
  AMOSTRAL: "APR amostral",
  FORMS: "APR via Forms",
};

export function tipoAprLabel(tipo: RsTipoApr): string {
  return TIPO_APR_LABELS[tipo] || tipo;
}

export const TIPO_INFRACAO_OPTIONS: RsTipoInfracao[] = ["LEVE", "GRAVE", "GRAVISSIMA"];

export const TIPO_INFRACAO_LABELS: Record<RsTipoInfracao, string> = {
  LEVE: "Leve",
  GRAVE: "Grave",
  GRAVISSIMA: "Gravíssima",
};

export function tipoInfracaoLabel(tipo: RsTipoInfracao): string {
  return TIPO_INFRACAO_LABELS[tipo] || tipo;
}

export const DECISAO_COMITE_LABELS: Record<RsDecisaoComite, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
};

export function decisaoComiteLabel(decisao: RsDecisaoComite): string {
  return DECISAO_COMITE_LABELS[decisao] || decisao;
}

export const DECISAO_COMITE_VARIANTS: Record<RsDecisaoComite, BadgeVariant> = {
  PENDENTE: "info",
  APROVADO: "success",
  REPROVADO: "danger",
};

export function decisaoComiteVariant(decisao: RsDecisaoComite): BadgeVariant {
  return DECISAO_COMITE_VARIANTS[decisao] || "neutral";
}

export const TIPO_REVISAO_COMITE_LABELS: Record<RsTipoRevisaoComite, string> = {
  RISCOS_ADICIONAIS: "Riscos adicionais",
  MEDIDAS_ADICIONAIS: "Medidas de controle adicionais",
};

export function tipoRevisaoComiteLabel(tipo: RsTipoRevisaoComite): string {
  return TIPO_REVISAO_COMITE_LABELS[tipo] || tipo;
}

export const TIPO_CRITERIO_OPTIONS: RsTipoCriterio[] = ["PROATIVO", "REATIVO"];

export const TIPO_CRITERIO_LABELS: Record<RsTipoCriterio, string> = {
  PROATIVO: "Proativo (soma pontos)",
  REATIVO: "Reativo (penalidade)",
};

export function tipoCriterioLabel(tipo: RsTipoCriterio): string {
  return TIPO_CRITERIO_LABELS[tipo] || tipo;
}

export const CATEGORIA_CRITERIO_OPTIONS: RsCategoriaCriterio[] = [
  "APR",
  "VIDEO",
  "INSPECAO",
  "DDS",
  "TREINAMENTO",
  "TRANSITO",
  "COMPORTAMENTO",
  "PENALIDADE",
  "OUTRO",
];

export const CATEGORIA_CRITERIO_LABELS: Record<RsCategoriaCriterio, string> = {
  APR: "APR",
  VIDEO: "Vídeo",
  INSPECAO: "Inspeção",
  DDS: "DDS",
  TREINAMENTO: "Treinamento",
  TRANSITO: "Trânsito",
  COMPORTAMENTO: "Comportamento",
  PENALIDADE: "Penalidade",
  OUTRO: "Outro",
};

export function categoriaCriterioLabel(categoria: RsCategoriaCriterio): string {
  return CATEGORIA_CRITERIO_LABELS[categoria] || categoria;
}

export const TIPO_CONDICAO_OPTIONS: RsTipoCondicao[] = [
  "REQUER_CRITERIO_APROVADO",
  "BLOQUEADO_PARA_TIPO_APR",
  "LIMITE_MENSAL_POR_EQUIPE",
];

export const TIPO_CONDICAO_LABELS: Record<RsTipoCondicao, string> = {
  REQUER_CRITERIO_APROVADO: "Requer outro critério aprovado",
  BLOQUEADO_PARA_TIPO_APR: "Bloqueado para um tipo de APR",
  LIMITE_MENSAL_POR_EQUIPE: "Limite mensal por equipe",
};

export function tipoCondicaoLabel(tipo: RsTipoCondicao): string {
  return TIPO_CONDICAO_LABELS[tipo] || tipo;
}

// Meses de referencia no formato "AAAA-MM" usado pelas avaliacoes e penalidades.
export function mesAtualReferencia(): string {
  return new Date().toISOString().slice(0, 7);
}

export function formatMesReferencia(mes: string | null | undefined): string {
  if (!mes) return "-";
  const [ano, mesNum] = mes.split("-");
  const nomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const indice = Number(mesNum) - 1;
  return nomes[indice] ? `${nomes[indice]}/${ano}` : mes;
}
