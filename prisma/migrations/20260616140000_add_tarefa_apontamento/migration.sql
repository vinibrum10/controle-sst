-- Adiciona horasRealizadas à tabela Tarefa
ALTER TABLE "Tarefa" ADD COLUMN "horasRealizadas" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Cria tabela de apontamentos de horas em tarefas
CREATE TABLE "TarefaApontamento" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "funcionarioId" TEXT,
    "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadoEm" TIMESTAMP(3),
    "duracaoSegundos" INTEGER,

    CONSTRAINT "TarefaApontamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TarefaApontamento_tarefaId_idx" ON "TarefaApontamento"("tarefaId");

-- CreateIndex
CREATE INDEX "TarefaApontamento_funcionarioId_idx" ON "TarefaApontamento"("funcionarioId");

-- AddForeignKey
ALTER TABLE "TarefaApontamento" ADD CONSTRAINT "TarefaApontamento_tarefaId_fkey"
    FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaApontamento" ADD CONSTRAINT "TarefaApontamento_funcionarioId_fkey"
    FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
