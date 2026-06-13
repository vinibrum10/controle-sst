-- CreateEnum
CREATE TYPE "RsAreaEquipe" AS ENUM ('LINHAS_LIMPEZA_FAIXA', 'EAT', 'PCC', 'UFV', 'OUTRO');

-- CreateEnum
CREATE TYPE "RsTipoApr" AS ENUM ('AMOSTRAL', 'FORMS');

-- CreateEnum
CREATE TYPE "RsTipoInfracao" AS ENUM ('LEVE', 'GRAVE', 'GRAVISSIMA');

-- CreateEnum
CREATE TYPE "RsTipoRevisaoComite" AS ENUM ('RISCOS_ADICIONAIS', 'MEDIDAS_ADICIONAIS');

-- CreateEnum
CREATE TYPE "RsDecisaoComite" AS ENUM ('PENDENTE', 'APROVADO', 'REPROVADO');

-- AlterTable
ALTER TABLE "Anexo" ADD COLUMN     "rsAprAvaliacaoId" TEXT,
ADD COLUMN     "rsPenalidadeId" TEXT;

-- CreateTable
CREATE TABLE "RsEquipe" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "area" "RsAreaEquipe" NOT NULL DEFAULT 'OUTRO',
    "supervisor" TEXT,
    "tst" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsEquipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsColaborador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" TEXT,
    "funcao" TEXT,
    "equipeId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsColaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsAprAvaliacao" (
    "id" TEXT NOT NULL,
    "mesReferencia" TEXT NOT NULL,
    "dataAvaliacao" TIMESTAMP(3) NOT NULL,
    "equipeId" TEXT NOT NULL,
    "tipo" "RsTipoApr" NOT NULL,
    "numeroOs" TEXT,
    "numeroApr" TEXT,
    "atividade" TEXT,
    "local" TEXT,
    "avaliador" TEXT,
    "observacoes" TEXT,
    "cabecalhoOk" BOOLEAN NOT NULL DEFAULT false,
    "enderecoOk" BOOLEAN NOT NULL DEFAULT false,
    "assinaturasOk" BOOLEAN NOT NULL DEFAULT false,
    "riscosMinimosOk" BOOLEAN NOT NULL DEFAULT false,
    "medidasMinimasOk" BOOLEAN NOT NULL DEFAULT false,
    "coerenciaOk" BOOLEAN NOT NULL DEFAULT false,
    "arquivadaEam" BOOLEAN NOT NULL DEFAULT false,
    "legivel" BOOLEAN NOT NULL DEFAULT false,
    "aprovacaoBasica" BOOLEAN NOT NULL DEFAULT false,
    "riscosAdicionais" BOOLEAN NOT NULL DEFAULT false,
    "riscosAdicionaisDescricao" TEXT,
    "riscosAdicionaisComite" "RsDecisaoComite" NOT NULL DEFAULT 'PENDENTE',
    "medidasAdicionais" BOOLEAN NOT NULL DEFAULT false,
    "medidasAdicionaisDescricao" TEXT,
    "medidasAdicionaisComite" "RsDecisaoComite" NOT NULL DEFAULT 'PENDENTE',
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsAprAvaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsComiteDecisao" (
    "id" TEXT NOT NULL,
    "avaliacaoId" TEXT NOT NULL,
    "tipo" "RsTipoRevisaoComite" NOT NULL,
    "decisao" "RsDecisaoComite" NOT NULL,
    "responsavel" TEXT,
    "dataDecisao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacoes" TEXT,

    CONSTRAINT "RsComiteDecisao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsPenalidade" (
    "id" TEXT NOT NULL,
    "mesReferencia" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,
    "colaboradorId" TEXT,
    "tipo" "RsTipoInfracao" NOT NULL,
    "pontos" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataOcorrencia" TIMESTAMP(3) NOT NULL,
    "responsavel" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsPenalidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RsEquipe_area_idx" ON "RsEquipe"("area");

-- CreateIndex
CREATE INDEX "RsEquipe_ativo_idx" ON "RsEquipe"("ativo");

-- CreateIndex
CREATE INDEX "RsColaborador_equipeId_idx" ON "RsColaborador"("equipeId");

-- CreateIndex
CREATE INDEX "RsColaborador_ativo_idx" ON "RsColaborador"("ativo");

-- CreateIndex
CREATE INDEX "RsAprAvaliacao_equipeId_idx" ON "RsAprAvaliacao"("equipeId");

-- CreateIndex
CREATE INDEX "RsAprAvaliacao_mesReferencia_idx" ON "RsAprAvaliacao"("mesReferencia");

-- CreateIndex
CREATE UNIQUE INDEX "RsAprAvaliacao_equipeId_mesReferencia_tipo_key" ON "RsAprAvaliacao"("equipeId", "mesReferencia", "tipo");

-- CreateIndex
CREATE INDEX "RsComiteDecisao_avaliacaoId_idx" ON "RsComiteDecisao"("avaliacaoId");

-- CreateIndex
CREATE INDEX "RsPenalidade_equipeId_idx" ON "RsPenalidade"("equipeId");

-- CreateIndex
CREATE INDEX "RsPenalidade_mesReferencia_idx" ON "RsPenalidade"("mesReferencia");

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_rsAprAvaliacaoId_fkey" FOREIGN KEY ("rsAprAvaliacaoId") REFERENCES "RsAprAvaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_rsPenalidadeId_fkey" FOREIGN KEY ("rsPenalidadeId") REFERENCES "RsPenalidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsColaborador" ADD CONSTRAINT "RsColaborador_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "RsEquipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsAprAvaliacao" ADD CONSTRAINT "RsAprAvaliacao_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "RsEquipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsComiteDecisao" ADD CONSTRAINT "RsComiteDecisao_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "RsAprAvaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsPenalidade" ADD CONSTRAINT "RsPenalidade_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "RsEquipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsPenalidade" ADD CONSTRAINT "RsPenalidade_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "RsColaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
