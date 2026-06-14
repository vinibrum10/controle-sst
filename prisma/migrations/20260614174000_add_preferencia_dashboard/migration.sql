-- CreateTable
CREATE TABLE "PreferenciaDashboard" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "widget" TEXT NOT NULL,
    "visivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PreferenciaDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreferenciaDashboard_usuarioId_widget_key" ON "PreferenciaDashboard"("usuarioId", "widget");

-- AddForeignKey
ALTER TABLE "PreferenciaDashboard" ADD CONSTRAINT "PreferenciaDashboard_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
