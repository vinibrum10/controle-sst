CREATE TABLE IF NOT EXISTS "Viagem" (
    "id" TEXT NOT NULL,
    "tecnicoId" TEXT,
    "criadoPorId" TEXT,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "iniciadoEm" TIMESTAMP(3) NOT NULL,
    "finalizadoEm" TIMESTAMP(3),
    "duracaoSegundos" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Viagem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Viagem_tecnicoId_idx" ON "Viagem"("tecnicoId");
CREATE INDEX IF NOT EXISTS "Viagem_criadoPorId_idx" ON "Viagem"("criadoPorId");
CREATE INDEX IF NOT EXISTS "Viagem_iniciadoEm_idx" ON "Viagem"("iniciadoEm");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Viagem_tecnicoId_fkey'
  ) THEN
    ALTER TABLE "Viagem"
    ADD CONSTRAINT "Viagem_tecnicoId_fkey"
    FOREIGN KEY ("tecnicoId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
