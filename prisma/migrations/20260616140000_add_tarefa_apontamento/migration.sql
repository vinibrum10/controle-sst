-- Adiciona horas_realizadas à tabela tarefa
ALTER TABLE "tarefa" ADD COLUMN "horas_realizadas" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Cria tabela de apontamentos de horas em tarefas
CREATE TABLE "tarefa_apontamento" (
    "id" TEXT NOT NULL,
    "tarefa_id" TEXT NOT NULL,
    "funcionario_id" TEXT,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizado_em" TIMESTAMP(3),
    "duracao_segundos" INTEGER,
    CONSTRAINT "tarefa_apontamento_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tarefa_apontamento_tarefa_id_idx" ON "tarefa_apontamento"("tarefa_id");
CREATE INDEX "tarefa_apontamento_funcionario_id_idx" ON "tarefa_apontamento"("funcionario_id");

ALTER TABLE "tarefa_apontamento" ADD CONSTRAINT "tarefa_apontamento_tarefa_id_fkey"
    FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tarefa_apontamento" ADD CONSTRAINT "tarefa_apontamento_funcionario_id_fkey"
    FOREIGN KEY ("funcionario_id") REFERENCES "funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
