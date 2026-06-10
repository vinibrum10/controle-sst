-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'GESTOR', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "ProvedorAuth" AS ENUM ('LOCAL', 'MICROSOFT');

-- CreateEnum
CREATE TYPE "TipoTarefa" AS ENUM ('ROTINEIRA', 'EVENTUAL');

-- CreateEnum
CREATE TYPE "PrioridadeTarefa" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "PeriodoRotina" AS ENUM ('SEMANAL', 'MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "StatusTarefa" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "StatusPedidoAjuda" AS ENUM ('ABERTO', 'ATENDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusTreinamento" AS ENUM ('PLANEJADO', 'REALIZADO', 'CANCELADO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "StatusInspecao" AS ENUM ('PLANEJADA', 'REALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusAuditoria" AS ENUM ('PLANEJADA', 'REALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoAchado" AS ENUM ('NAO_CONFORMIDADE', 'OBSERVACAO', 'OPORTUNIDADE_MELHORIA');

-- CreateEnum
CREATE TYPE "GravidadeAchado" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "StatusAchado" AS ENUM ('ABERTO', 'EM_TRATATIVA', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "StatusPlanoAcao" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ATRASADO');

-- CreateEnum
CREATE TYPE "FrequenciaRota" AS ENUM ('DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL');

-- CreateEnum
CREATE TYPE "StatusRota" AS ENUM ('ATIVA', 'INATIVA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'COLABORADOR',
    "provedor" "ProvedorAuth" NOT NULL DEFAULT 'LOCAL',
    "provedorId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "funcionarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL DEFAULT 32,
    "foto" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semana" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavelId" TEXT,
    "apoioId" TEXT,
    "semanaId" TEXT,
    "prazo" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoTarefa" NOT NULL DEFAULT 'EVENTUAL',
    "prioridade" "PrioridadeTarefa" NOT NULL DEFAULT 'MEDIA',
    "periodoRotina" "PeriodoRotina",
    "horasEstimadas" INTEGER NOT NULL DEFAULT 4,
    "status" "StatusTarefa" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidaEm" TIMESTAMP(3),

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoAjuda" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "solicitanteId" TEXT,
    "atendentePorId" TEXT,
    "status" "StatusPedidoAjuda" NOT NULL DEFAULT 'ABERTO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendidoEm" TIMESTAMP(3),

    CONSTRAINT "PedidoAjuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treinamento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "norma" TEXT,
    "cargaHoraria" INTEGER,
    "dataRealizacao" TIMESTAMP(3),
    "validade" TIMESTAMP(3),
    "status" "StatusTreinamento" NOT NULL DEFAULT 'PLANEJADO',
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treinamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspecao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "area" TEXT,
    "tipo" TEXT,
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "dataRealizada" TIMESTAMP(3),
    "status" "StatusInspecao" NOT NULL DEFAULT 'PLANEJADA',
    "observacoes" TEXT,
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspecao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "escopo" TEXT,
    "norma" TEXT,
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "dataRealizada" TIMESTAMP(3),
    "status" "StatusAuditoria" NOT NULL DEFAULT 'PLANEJADA',
    "observacoes" TEXT,
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achado" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoAchado" NOT NULL DEFAULT 'NAO_CONFORMIDADE',
    "gravidade" "GravidadeAchado" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusAchado" NOT NULL DEFAULT 'ABERTO',
    "identificadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspecaoId" TEXT,
    "auditoriaId" TEXT,
    "rotaSeguraId" TEXT,
    "responsavelId" TEXT,

    CONSTRAINT "Achado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoAcao" (
    "id" TEXT NOT NULL,
    "achadoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "responsavelId" TEXT,
    "prazo" TIMESTAMP(3) NOT NULL,
    "status" "StatusPlanoAcao" NOT NULL DEFAULT 'PENDENTE',
    "concluidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanoAcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RotaSegura" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "area" TEXT,
    "frequencia" "FrequenciaRota" NOT NULL DEFAULT 'SEMANAL',
    "ultimaVerificacao" TIMESTAMP(3),
    "status" "StatusRota" NOT NULL DEFAULT 'ATIVA',
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RotaSegura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipoMime" TEXT,
    "tamanho" INTEGER,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoPorId" TEXT,
    "tarefaId" TEXT,
    "treinamentoId" TEXT,
    "inspecaoId" TEXT,
    "auditoriaId" TEXT,
    "achadoId" TEXT,
    "planoAcaoId" TEXT,
    "rotaSeguraId" TEXT,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_funcionarioId_key" ON "Usuario"("funcionarioId");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Funcionario_email_idx" ON "Funcionario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Semana_codigo_key" ON "Semana"("codigo");

-- CreateIndex
CREATE INDEX "Semana_codigo_idx" ON "Semana"("codigo");

-- CreateIndex
CREATE INDEX "Tarefa_responsavelId_idx" ON "Tarefa"("responsavelId");

-- CreateIndex
CREATE INDEX "Tarefa_semanaId_idx" ON "Tarefa"("semanaId");

-- CreateIndex
CREATE INDEX "Tarefa_status_idx" ON "Tarefa"("status");

-- CreateIndex
CREATE INDEX "PedidoAjuda_tarefaId_idx" ON "PedidoAjuda"("tarefaId");

-- CreateIndex
CREATE INDEX "PedidoAjuda_status_idx" ON "PedidoAjuda"("status");

-- CreateIndex
CREATE INDEX "Treinamento_status_idx" ON "Treinamento"("status");

-- CreateIndex
CREATE INDEX "Inspecao_status_idx" ON "Inspecao"("status");

-- CreateIndex
CREATE INDEX "Auditoria_status_idx" ON "Auditoria"("status");

-- CreateIndex
CREATE INDEX "Achado_status_idx" ON "Achado"("status");

-- CreateIndex
CREATE INDEX "PlanoAcao_status_idx" ON "PlanoAcao"("status");

-- CreateIndex
CREATE INDEX "PlanoAcao_achadoId_idx" ON "PlanoAcao"("achadoId");

-- CreateIndex
CREATE INDEX "RotaSegura_status_idx" ON "RotaSegura"("status");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_apoioId_fkey" FOREIGN KEY ("apoioId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_semanaId_fkey" FOREIGN KEY ("semanaId") REFERENCES "Semana"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoAjuda" ADD CONSTRAINT "PedidoAjuda_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoAjuda" ADD CONSTRAINT "PedidoAjuda_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoAjuda" ADD CONSTRAINT "PedidoAjuda_atendentePorId_fkey" FOREIGN KEY ("atendentePorId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treinamento" ADD CONSTRAINT "Treinamento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspecao" ADD CONSTRAINT "Inspecao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achado" ADD CONSTRAINT "Achado_inspecaoId_fkey" FOREIGN KEY ("inspecaoId") REFERENCES "Inspecao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achado" ADD CONSTRAINT "Achado_auditoriaId_fkey" FOREIGN KEY ("auditoriaId") REFERENCES "Auditoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achado" ADD CONSTRAINT "Achado_rotaSeguraId_fkey" FOREIGN KEY ("rotaSeguraId") REFERENCES "RotaSegura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achado" ADD CONSTRAINT "Achado_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoAcao" ADD CONSTRAINT "PlanoAcao_achadoId_fkey" FOREIGN KEY ("achadoId") REFERENCES "Achado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoAcao" ADD CONSTRAINT "PlanoAcao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RotaSegura" ADD CONSTRAINT "RotaSegura_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_treinamentoId_fkey" FOREIGN KEY ("treinamentoId") REFERENCES "Treinamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_inspecaoId_fkey" FOREIGN KEY ("inspecaoId") REFERENCES "Inspecao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_auditoriaId_fkey" FOREIGN KEY ("auditoriaId") REFERENCES "Auditoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_achadoId_fkey" FOREIGN KEY ("achadoId") REFERENCES "Achado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_planoAcaoId_fkey" FOREIGN KEY ("planoAcaoId") REFERENCES "PlanoAcao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_rotaSeguraId_fkey" FOREIGN KEY ("rotaSeguraId") REFERENCES "RotaSegura"("id") ON DELETE SET NULL ON UPDATE CASCADE;
