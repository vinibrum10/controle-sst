const path = require("path");
const { execSync } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env.test") });

// Aplica as migrations e garante um banco de testes limpo antes da execucao
// de toda a suite.
module.exports = async () => {
  execSync("npx prisma migrate deploy", {
    cwd: path.join(__dirname, "..", ".."),
    env: process.env,
    stdio: "inherit"
  });

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const tabelas = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;

  for (const { tablename } of tabelas) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`);
  }

  await prisma.$disconnect();
};
