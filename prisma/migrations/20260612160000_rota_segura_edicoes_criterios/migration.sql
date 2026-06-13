-- CreateEnum
CREATE TYPE "RsTipoCriterio" AS ENUM ('PROATIVO', 'REATIVO');

-- CreateEnum
CREATE TYPE "RsCategoriaCriterio" AS ENUM ('APR', 'VIDEO', 'INSPECAO', 'DDS', 'TREINAMENTO', 'TRANSITO', 'COMPORTAMENTO', 'PENALIDADE', 'OUTRO');

-- CreateEnum
CREATE TYPE "RsTipoCondicao" AS ENUM ('REQUER_CRITERIO_APROVADO', 'BLOQUEADO_PARA_TIPO_APR', 'LIMITE_MENSAL_POR_EQUIPE');

-- DropIndex
DROP INDEX "RsAprAvaliacao_equipeId_mesReferencia_tipo_key";

-- AlterTable
ALTER TABLE "RsAprAvaliacao" ADD COLUMN     "edicaoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RsPenalidade" ADD COLUMN     "edicaoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RsEdicaoPrograma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "slogan" TEXT,
    "objetivo" TEXT,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsEdicaoPrograma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsProposta" (
    "id" TEXT NOT NULL,
    "edicaoId" TEXT NOT NULL,
    "titulo" TEXT,
    "slogan" TEXT,
    "mensagemAbertura" TEXT,
    "objetivoGeral" TEXT,
    "justificativa" TEXT,
    "publicoAlvo" TEXT,
    "areasParticipantes" TEXT,
    "regrasGerais" TEXT,
    "criteriosAvaliacao" TEXT,
    "estruturaComite" TEXT,
    "regraPremiacao" TEXT,
    "premios" TEXT,
    "cronograma" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsProposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsCriterio" (
    "id" TEXT NOT NULL,
    "edicaoId" TEXT NOT NULL,
    "codigo" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "RsTipoCriterio" NOT NULL,
    "pontuacao" INTEGER NOT NULL,
    "categoria" "RsCategoriaCriterio" NOT NULL DEFAULT 'OUTRO',
    "exigeComite" BOOLEAN NOT NULL DEFAULT false,
    "exigeEvidencia" BOOLEAN NOT NULL DEFAULT false,
    "aplicaAmostral" BOOLEAN NOT NULL DEFAULT true,
    "aplicaForms" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsCriterio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsRegraCondicional" (
    "id" TEXT NOT NULL,
    "edicaoId" TEXT NOT NULL,
    "criterioId" TEXT NOT NULL,
    "criterioDependenteId" TEXT,
    "tipoCondicao" "RsTipoCondicao" NOT NULL,
    "parametros" JSONB,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsRegraCondicional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsPremiacao" (
    "id" TEXT NOT NULL,
    "edicaoId" TEXT NOT NULL,
    "area" "RsAreaEquipe" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "posicaoInicial" INTEGER NOT NULL,
    "posicaoFinal" INTEGER NOT NULL,
    "descricaoPremio" TEXT NOT NULL,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RsPremiacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RsEdicaoPrograma_ano_key" ON "RsEdicaoPrograma"("ano");

-- CreateIndex
CREATE INDEX "RsEdicaoPrograma_ativo_idx" ON "RsEdicaoPrograma"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "RsProposta_edicaoId_key" ON "RsProposta"("edicaoId");

-- CreateIndex
CREATE INDEX "RsCriterio_edicaoId_idx" ON "RsCriterio"("edicaoId");

-- CreateIndex
CREATE INDEX "RsCriterio_categoria_idx" ON "RsCriterio"("categoria");

-- CreateIndex
CREATE INDEX "RsRegraCondicional_edicaoId_idx" ON "RsRegraCondicional"("edicaoId");

-- CreateIndex
CREATE INDEX "RsPremiacao_edicaoId_idx" ON "RsPremiacao"("edicaoId");

-- CreateIndex
CREATE INDEX "RsAprAvaliacao_edicaoId_idx" ON "RsAprAvaliacao"("edicaoId");

-- CreateIndex
CREATE UNIQUE INDEX "RsAprAvaliacao_edicaoId_equipeId_mesReferencia_tipo_key" ON "RsAprAvaliacao"("edicaoId", "equipeId", "mesReferencia", "tipo");

-- CreateIndex
CREATE INDEX "RsPenalidade_edicaoId_idx" ON "RsPenalidade"("edicaoId");

-- AddForeignKey
ALTER TABLE "RsProposta" ADD CONSTRAINT "RsProposta_edicaoId_fkey" FOREIGN KEY ("edicaoId") REFERENCES "RsEdicaoPrograma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsCriterio" ADD CONSTRAINT "RsCriterio_edicaoId_fkey" FOREIGN KEY ("edicaoId") REFERENCES "RsEdicaoPrograma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsRegraCondicional" ADD CONSTRAINT "RsRegraCondicional_edicaoId_fkey" FOREIGN KEY ("edicaoId") REFERENCES "RsEdicaoPrograma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsRegraCondicional" ADD CONSTRAINT "RsRegraCondicional_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "RsCriterio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsRegraCondicional" ADD CONSTRAINT "RsRegraCondicional_criterioDependenteId_fkey" FOREIGN KEY ("criterioDependenteId") REFERENCES "RsCriterio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsPremiacao" ADD CONSTRAINT "RsPremiacao_edicaoId_fkey" FOREIGN KEY ("edicaoId") REFERENCES "RsEdicaoPrograma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsAprAvaliacao" ADD CONSTRAINT "RsAprAvaliacao_edicaoId_fkey" FOREIGN KEY ("edicaoId") REFERENCES "RsEdicaoPrograma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RsPenalidade" ADD CONSTRAINT "RsPenalidade_edicaoId_fkey" FOREIGN KEY ("edicaoId") REFERENCES "RsEdicaoPrograma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

