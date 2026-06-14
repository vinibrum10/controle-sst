-- CreateTable
CREATE TABLE "PreferenciaNotificacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "inApp" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PreferenciaNotificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreferenciaNotificacao_usuarioId_tipo_key" ON "PreferenciaNotificacao"("usuarioId", "tipo");

-- AddForeignKey
ALTER TABLE "PreferenciaNotificacao" ADD CONSTRAINT "PreferenciaNotificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
