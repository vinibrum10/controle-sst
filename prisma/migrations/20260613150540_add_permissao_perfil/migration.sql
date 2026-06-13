-- CreateEnum
CREATE TYPE "ChavePermissao" AS ENUM ('GERENCIAR_EQUIPE', 'EXCLUIR_FUNCIONARIO', 'GERENCIAR_PROGRAMAS_SST', 'GERENCIAR_USUARIOS', 'EXPORTAR_DADOS', 'IMPORTAR_DADOS', 'RESTAURAR_DEMO', 'CONFIGURAR_ROTA_SEGURA', 'GERENCIAR_EQUIPES_ROTA_SEGURA', 'LANCAR_AVALIACAO_ROTA_SEGURA', 'DECIDIR_COMITE_ROTA_SEGURA', 'EXCLUIR_AVALIACAO_ROTA_SEGURA');

-- CreateTable
CREATE TABLE "PermissaoPerfil" (
    "id" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL,
    "chave" "ChavePermissao" NOT NULL,
    "permitido" BOOLEAN NOT NULL DEFAULT false,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissaoPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PermissaoPerfil_chave_idx" ON "PermissaoPerfil"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "PermissaoPerfil_papel_chave_key" ON "PermissaoPerfil"("papel", "chave");

-- Seed default permission matrix (mirrors the previously hardcoded role checks)
INSERT INTO "PermissaoPerfil" ("id", "papel", "chave", "permitido", "atualizadoEm") VALUES
  (gen_random_uuid(), 'ADMIN', 'GERENCIAR_EQUIPE', true, now()),
  (gen_random_uuid(), 'GESTOR', 'GERENCIAR_EQUIPE', true, now()),
  (gen_random_uuid(), 'TST', 'GERENCIAR_EQUIPE', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'GERENCIAR_EQUIPE', true, now()),
  (gen_random_uuid(), 'COLABORADOR', 'GERENCIAR_EQUIPE', false, now()),

  (gen_random_uuid(), 'ADMIN', 'EXCLUIR_FUNCIONARIO', true, now()),
  (gen_random_uuid(), 'GESTOR', 'EXCLUIR_FUNCIONARIO', true, now()),
  (gen_random_uuid(), 'TST', 'EXCLUIR_FUNCIONARIO', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'EXCLUIR_FUNCIONARIO', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'EXCLUIR_FUNCIONARIO', false, now()),

  (gen_random_uuid(), 'ADMIN', 'GERENCIAR_PROGRAMAS_SST', true, now()),
  (gen_random_uuid(), 'GESTOR', 'GERENCIAR_PROGRAMAS_SST', true, now()),
  (gen_random_uuid(), 'TST', 'GERENCIAR_PROGRAMAS_SST', true, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'GERENCIAR_PROGRAMAS_SST', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'GERENCIAR_PROGRAMAS_SST', false, now()),

  (gen_random_uuid(), 'ADMIN', 'GERENCIAR_USUARIOS', true, now()),
  (gen_random_uuid(), 'GESTOR', 'GERENCIAR_USUARIOS', false, now()),
  (gen_random_uuid(), 'TST', 'GERENCIAR_USUARIOS', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'GERENCIAR_USUARIOS', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'GERENCIAR_USUARIOS', false, now()),

  (gen_random_uuid(), 'ADMIN', 'EXPORTAR_DADOS', true, now()),
  (gen_random_uuid(), 'GESTOR', 'EXPORTAR_DADOS', true, now()),
  (gen_random_uuid(), 'TST', 'EXPORTAR_DADOS', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'EXPORTAR_DADOS', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'EXPORTAR_DADOS', false, now()),

  (gen_random_uuid(), 'ADMIN', 'IMPORTAR_DADOS', true, now()),
  (gen_random_uuid(), 'GESTOR', 'IMPORTAR_DADOS', false, now()),
  (gen_random_uuid(), 'TST', 'IMPORTAR_DADOS', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'IMPORTAR_DADOS', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'IMPORTAR_DADOS', false, now()),

  (gen_random_uuid(), 'ADMIN', 'RESTAURAR_DEMO', true, now()),
  (gen_random_uuid(), 'GESTOR', 'RESTAURAR_DEMO', false, now()),
  (gen_random_uuid(), 'TST', 'RESTAURAR_DEMO', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'RESTAURAR_DEMO', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'RESTAURAR_DEMO', false, now()),

  (gen_random_uuid(), 'ADMIN', 'CONFIGURAR_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'GESTOR', 'CONFIGURAR_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'TST', 'CONFIGURAR_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'CONFIGURAR_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'CONFIGURAR_ROTA_SEGURA', false, now()),

  (gen_random_uuid(), 'ADMIN', 'GERENCIAR_EQUIPES_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'GESTOR', 'GERENCIAR_EQUIPES_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'TST', 'GERENCIAR_EQUIPES_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'GERENCIAR_EQUIPES_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'GERENCIAR_EQUIPES_ROTA_SEGURA', false, now()),

  (gen_random_uuid(), 'ADMIN', 'LANCAR_AVALIACAO_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'GESTOR', 'LANCAR_AVALIACAO_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'TST', 'LANCAR_AVALIACAO_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'LANCAR_AVALIACAO_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'LANCAR_AVALIACAO_ROTA_SEGURA', false, now()),

  (gen_random_uuid(), 'ADMIN', 'DECIDIR_COMITE_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'GESTOR', 'DECIDIR_COMITE_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'TST', 'DECIDIR_COMITE_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'DECIDIR_COMITE_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'DECIDIR_COMITE_ROTA_SEGURA', false, now()),

  (gen_random_uuid(), 'ADMIN', 'EXCLUIR_AVALIACAO_ROTA_SEGURA', true, now()),
  (gen_random_uuid(), 'GESTOR', 'EXCLUIR_AVALIACAO_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'TST', 'EXCLUIR_AVALIACAO_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'VISUALIZADOR', 'EXCLUIR_AVALIACAO_ROTA_SEGURA', false, now()),
  (gen_random_uuid(), 'COLABORADOR', 'EXCLUIR_AVALIACAO_ROTA_SEGURA', false, now())
ON CONFLICT ("papel", "chave") DO NOTHING;
