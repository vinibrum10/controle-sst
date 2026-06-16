-- Muda a carga horária semanal padrão de 32h para 42h
ALTER TABLE "Funcionario" ALTER COLUMN "capacidade" SET DEFAULT 42;
UPDATE "Funcionario" SET "capacidade" = 42 WHERE "capacidade" = 32;

-- Rastreamento de OS convertidas em tarefa atrasada
ALTER TABLE "AtendimentoOS" ADD COLUMN IF NOT EXISTS "tarefaVinculadaId" TEXT;
