-- Adiciona horasRealizadas à tabela Tarefa
ALTER TABLE "Tarefa" ADD COLUMN IF NOT EXISTS "horasRealizadas" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Cria tabela de apontamentos de horas em tarefas
CREATE TABLE IF NOT EXISTS "TarefaApontamento" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "funcionarioId" TEXT,
    "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadoEm" TIMESTAMP(3),
    "duracaoSegundos" INTEGER,

    CONSTRAINT "TarefaApontamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TarefaApontamento_tarefaId_idx" ON "TarefaApontamento"("tarefaId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TarefaApontamento_funcionarioId_idx" ON "TarefaApontamento"("funcionarioId");

-- AddForeignKey (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TarefaApontamento_tarefaId_fkey'
  ) THEN
    ALTER TABLE "TarefaApontamento" ADD CONSTRAINT "TarefaApontamento_tarefaId_fkey"
      FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TarefaApontamento_funcionarioId_fkey'
  ) THEN
    ALTER TABLE "TarefaApontamento" ADD CONSTRAINT "TarefaApontamento_funcionarioId_fkey"
      FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
