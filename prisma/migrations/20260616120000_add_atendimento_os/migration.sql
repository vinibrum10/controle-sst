-- CreateTable
CREATE TABLE "AtendimentoOS" (
    "id" TEXT NOT NULL,
    "numeroOS" TEXT NOT NULL,
    "responsavelId" TEXT,
    "iniciadoEm" TIMESTAMP(3) NOT NULL,
    "finalizadoEm" TIMESTAMP(3),
    "duracaoSegundos" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AtendimentoOS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AtendimentoOS_responsavelId_idx" ON "AtendimentoOS"("responsavelId");

-- CreateIndex
CREATE INDEX "AtendimentoOS_iniciadoEm_idx" ON "AtendimentoOS"("iniciadoEm");

-- AddForeignKey
ALTER TABLE "AtendimentoOS" ADD CONSTRAINT "AtendimentoOS_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
