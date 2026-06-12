import type { Funcionario } from "./funcionario";

export type ResponsavelRef = Pick<Funcionario, "id" | "nome"> | null;

export type StatusTreinamento = "PLANEJADO" | "REALIZADO" | "CANCELADO" | "VENCIDO";

export interface Treinamento {
  id: string;
  titulo: string;
  descricao: string | null;
  norma: string | null;
  cargaHoraria: number | null;
  dataRealizacao: string | null;
  validade: string | null;
  status: StatusTreinamento;
  responsavelId: string | null;
  responsavel: ResponsavelRef;
  criadoEm: string;
}

export type StatusInspecao = "PLANEJADA" | "REALIZADA" | "CANCELADA";

export interface Inspecao {
  id: string;
  titulo: string;
  area: string | null;
  tipo: string | null;
  dataPrevista: string;
  dataRealizada: string | null;
  status: StatusInspecao;
  observacoes: string | null;
  responsavelId: string | null;
  responsavel: ResponsavelRef;
  achados: Achado[];
}

export type StatusAuditoria = "PLANEJADA" | "REALIZADA" | "CANCELADA";

export interface Auditoria {
  id: string;
  titulo: string;
  escopo: string | null;
  norma: string | null;
  dataPrevista: string;
  dataRealizada: string | null;
  status: StatusAuditoria;
  observacoes: string | null;
  responsavelId: string | null;
  responsavel: ResponsavelRef;
  achados: Achado[];
}

export type TipoAchado = "NAO_CONFORMIDADE" | "OBSERVACAO" | "OPORTUNIDADE_MELHORIA";
export type GravidadeAchado = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
export type StatusAchado = "ABERTO" | "EM_TRATATIVA" | "CONCLUIDO";

export interface Achado {
  id: string;
  descricao: string;
  tipo: TipoAchado;
  gravidade: GravidadeAchado;
  status: StatusAchado;
  identificadoEm: string;
  inspecaoId: string | null;
  auditoriaId: string | null;
  rotaSeguraId: string | null;
  responsavelId: string | null;
  responsavel: ResponsavelRef;
  planosAcao?: PlanoAcao[];
}

export type StatusPlanoAcao = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "ATRASADO";

export interface PlanoAcao {
  id: string;
  achadoId: string;
  achado?: Pick<Achado, "id" | "descricao"> | null;
  descricao: string;
  responsavelId: string | null;
  responsavel: ResponsavelRef;
  prazo: string;
  status: StatusPlanoAcao;
  concluidoEm: string | null;
  criadoEm: string;
}

export type FrequenciaRota = "DIARIA" | "SEMANAL" | "QUINZENAL" | "MENSAL";
export type StatusRota = "ATIVA" | "INATIVA";

export interface RotaSegura {
  id: string;
  nome: string;
  descricao: string | null;
  area: string | null;
  frequencia: FrequenciaRota;
  ultimaVerificacao: string | null;
  status: StatusRota;
  responsavelId: string | null;
  responsavel: ResponsavelRef;
  achados: Achado[];
}
