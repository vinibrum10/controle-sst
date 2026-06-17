-- Rastreia o usuário (Usuario.id) que abriu a OS, independente de ter funcionarioId vinculado
ALTER TABLE "AtendimentoOS" ADD COLUMN IF NOT EXISTS "criadoPorId" TEXT;
