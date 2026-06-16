/**
 * Remove da tabela _prisma_migrations os registros que falharam e ficaram
 * com checksum inconsistente, permitindo que prisma migrate deploy reaplique.
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();

  const broken = [
    "20260616140000_add_tarefa_apontamento"
  ];

  for (const name of broken) {
    try {
      const result = await prisma.$executeRawUnsafe(
        `DELETE FROM "_prisma_migrations" WHERE migration_name = $1`,
        name
      );
      if (result > 0) {
        console.log(`[fix-migrations] Registro removido: ${name}`);
      } else {
        console.log(`[fix-migrations] Nada a remover: ${name}`);
      }
    } catch (err) {
      console.log(`[fix-migrations] Aviso: ${err.message}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[fix-migrations] Erro:", err.message);
  process.exit(0); // Não bloqueia o startup
});
