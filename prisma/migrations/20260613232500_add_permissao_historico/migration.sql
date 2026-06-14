-- CreateTable
CREATE TABLE "PermissaoHistorico" (
    "id" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL,
    "chave" "ChavePermissao" NOT NULL,
    "permitidoAntes" BOOLEAN NOT NULL,
    "permitidoDepois" BOOLEAN NOT NULL,
    "alteradoPorId" TEXT,
    "alteradoPorNome" TEXT,
    "alteradoPorEmail" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissaoHistorico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PermissaoHistorico_criadoEm_idx" ON "PermissaoHistorico"("criadoEm");
