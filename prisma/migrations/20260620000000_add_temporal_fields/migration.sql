-- Adiciona campos temporais (weekKey, monthKey, ano) e atualizadoEm em modelos operacionais.
-- Idempotente: usa IF NOT EXISTS em todos os comandos.

-- =====================================================================
-- TAREFA: criadoPorId + atualizadoEm
-- =====================================================================

DO $$ BEGIN
  ALTER TABLE "Tarefa" ADD COLUMN "criadoPorId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Tarefa" ADD COLUMN "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- =====================================================================
-- VIAGEM: weekKey, monthKey, ano, atualizadoEm
-- =====================================================================

DO $$ BEGIN
  ALTER TABLE "Viagem" ADD COLUMN "weekKey" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Viagem" ADD COLUMN "monthKey" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Viagem" ADD COLUMN "ano" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Viagem" ADD COLUMN "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Backfill Viagem a partir de iniciadoEm
UPDATE "Viagem"
SET
  "weekKey"  = TO_CHAR("iniciadoEm" AT TIME ZONE 'UTC', 'IYYY"-W"IW'),
  "monthKey" = TO_CHAR("iniciadoEm" AT TIME ZONE 'UTC', 'YYYY-MM'),
  "ano"      = EXTRACT(ISOYEAR FROM "iniciadoEm" AT TIME ZONE 'UTC')::INTEGER
WHERE "weekKey" IS NULL;

-- =====================================================================
-- AtendimentoOS: weekKey, monthKey, ano, atualizadoEm
-- =====================================================================

DO $$ BEGIN
  ALTER TABLE "AtendimentoOS" ADD COLUMN "weekKey" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AtendimentoOS" ADD COLUMN "monthKey" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AtendimentoOS" ADD COLUMN "ano" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AtendimentoOS" ADD COLUMN "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Backfill AtendimentoOS a partir de iniciadoEm
UPDATE "AtendimentoOS"
SET
  "weekKey"  = TO_CHAR("iniciadoEm" AT TIME ZONE 'UTC', 'IYYY"-W"IW'),
  "monthKey" = TO_CHAR("iniciadoEm" AT TIME ZONE 'UTC', 'YYYY-MM'),
  "ano"      = EXTRACT(ISOYEAR FROM "iniciadoEm" AT TIME ZONE 'UTC')::INTEGER
WHERE "weekKey" IS NULL;

-- =====================================================================
-- PedidoAjuda: weekKey, monthKey, ano
-- =====================================================================

DO $$ BEGIN
  ALTER TABLE "PedidoAjuda" ADD COLUMN "weekKey" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PedidoAjuda" ADD COLUMN "monthKey" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PedidoAjuda" ADD COLUMN "ano" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Backfill PedidoAjuda a partir de criadoEm
UPDATE "PedidoAjuda"
SET
  "weekKey"  = TO_CHAR("criadoEm" AT TIME ZONE 'UTC', 'IYYY"-W"IW'),
  "monthKey" = TO_CHAR("criadoEm" AT TIME ZONE 'UTC', 'YYYY-MM'),
  "ano"      = EXTRACT(ISOYEAR FROM "criadoEm" AT TIME ZONE 'UTC')::INTEGER
WHERE "weekKey" IS NULL;

-- =====================================================================
-- TarefaApontamento: weekKey, monthKey, ano
-- =====================================================================

DO $$ BEGIN
  ALTER TABLE "TarefaApontamento" ADD COLUMN "weekKey" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TarefaApontamento" ADD COLUMN "monthKey" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TarefaApontamento" ADD COLUMN "ano" INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Backfill TarefaApontamento a partir de iniciadoEm
UPDATE "TarefaApontamento"
SET
  "weekKey"  = TO_CHAR("iniciadoEm" AT TIME ZONE 'UTC', 'IYYY"-W"IW'),
  "monthKey" = TO_CHAR("iniciadoEm" AT TIME ZONE 'UTC', 'YYYY-MM'),
  "ano"      = EXTRACT(ISOYEAR FROM "iniciadoEm" AT TIME ZONE 'UTC')::INTEGER
WHERE "weekKey" IS NULL;

-- =====================================================================
-- Índices
-- =====================================================================

CREATE INDEX IF NOT EXISTS "Viagem_weekKey_idx"          ON "Viagem"("weekKey");
CREATE INDEX IF NOT EXISTS "Viagem_monthKey_idx"         ON "Viagem"("monthKey");
CREATE INDEX IF NOT EXISTS "AtendimentoOS_weekKey_idx"   ON "AtendimentoOS"("weekKey");
CREATE INDEX IF NOT EXISTS "AtendimentoOS_monthKey_idx"  ON "AtendimentoOS"("monthKey");
CREATE INDEX IF NOT EXISTS "PedidoAjuda_weekKey_idx"     ON "PedidoAjuda"("weekKey");
CREATE INDEX IF NOT EXISTS "PedidoAjuda_monthKey_idx"    ON "PedidoAjuda"("monthKey");
CREATE INDEX IF NOT EXISTS "TarefaApontamento_weekKey_idx" ON "TarefaApontamento"("weekKey");
