-- CreateEnum
CREATE TYPE "CategoriaCadastro" AS ENUM ('UNIDADE', 'AREA_SETOR', 'CARGO_FUNCAO', 'EQUIPE', 'TIPO_ATIVIDADE', 'TIPO_INSPECAO', 'TIPO_TREINAMENTO');

-- CreateTable
CREATE TABLE "ConfiguracaoSistema" (
    "id" TEXT NOT NULL,
    "nomeSistema" TEXT NOT NULL DEFAULT 'SGEPI',
    "nomeEmpresa" TEXT,
    "logoUrl" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoSistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CadastroGeral" (
    "id" TEXT NOT NULL,
    "categoria" "CategoriaCadastro" NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadastroGeral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CadastroGeral_categoria_idx" ON "CadastroGeral"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "CadastroGeral_categoria_nome_key" ON "CadastroGeral"("categoria", "nome");

-- Seed default permission matrix for GERENCIAR_CADASTROS
INSERT INTO "PermissaoPerfil" ("id", "papel", "chave", "permitido", "atualizadoEm") VALUES
  (gen_random_uuid(), 'ADMIN', 'GERENCIAR_CADASTROS', true, now()),
  (gen_random_uuid(), 'GESTOR', 'GERENCIAR_CADASTROS', true, now()),
  (gen_random_uuid(), 'TST', 'GERENCIAR_CADASTROS', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'GERENCIAR_CADASTROS', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'GERENCIAR_CADASTROS', false, now());
