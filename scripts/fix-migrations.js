/**
 * Remove registros de migrações recentes de _prisma_migrations antes do deploy.
 * As migrações usam IF NOT EXISTS / IF EXISTS, portanto são idempotentes:
 * podem ser reaplicadas a cada deploy sem risco de duplicar objetos.
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const MIGRATIONS_PARA_LIMPAR = [
  "20260616140000_add_tarefa_apontamento",
  "20260616160000_fix_tarefa_apontamento",
  "20260616170000_capacidade_42_os_vinculada",
  "20260617000000_os_criado_por",
  "20260617200000_os_solicitante"
];

async function main() {
  const prisma = new PrismaClient();

  for (const name of MIGRATIONS_PARA_LIMPAR) {
    try {
      const rows = await prisma.$executeRawUnsafe(
        `DELETE FROM "_prisma_migrations" WHERE migration_name = $1`,
        name
      );
      if (rows > 0) console.log(`[fix-migrations] Removido: ${name}`);
    } catch (err) {
      console.log(`[fix-migrations] Aviso ao limpar ${name}: ${err.message}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[fix-migrations] Erro:", err.message);
  process.exit(0); // nunca bloqueia o startup
});
