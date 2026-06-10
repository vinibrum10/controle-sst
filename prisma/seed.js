require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { shiftDate, seedFuncionariosDemo, seedTarefasDemo } = require("../server/utils/seedDemo");

const prisma = new PrismaClient();

async function main() {
  // ----- Usuario administrador -----
  const adminEmail = "admin@controlesst.com.br";
  const adminSenha = "ControleSST@123";
  const senhaHash = await bcrypt.hash(adminSenha, 10);

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: { nome: "Administrador", email: adminEmail, senhaHash, papel: "ADMIN" }
  });

  // ----- Funcionarios -----
  const pessoas = await seedFuncionariosDemo(prisma);
  const [ana, bruno, carla, diego] = pessoas;

  // ----- Tarefas -----
  const tarefasExistentes = await prisma.tarefa.count();
  if (tarefasExistentes === 0) {
    await seedTarefasDemo(prisma, pessoas);
  }

  // ----- Demonstracao dos demais programas de SST -----
  const inspecaoExistente = await prisma.inspecao.findFirst();
  if (!inspecaoExistente) {
    const inspecao = await prisma.inspecao.create({
      data: {
        titulo: "Inspecao geral - Galpao 1",
        area: "Producao",
        tipo: "Inspecao planejada",
        dataPrevista: shiftDate(7),
        status: "PLANEJADA",
        responsavelId: ana.id
      }
    });

    const achado = await prisma.achado.create({
      data: {
        descricao: "Extintor com a validade vencida no setor de expedicao.",
        tipo: "NAO_CONFORMIDADE",
        gravidade: "ALTA",
        status: "ABERTO",
        inspecaoId: inspecao.id,
        responsavelId: diego.id
      }
    });

    await prisma.planoAcao.create({
      data: {
        achadoId: achado.id,
        descricao: "Substituir extintor vencido e atualizar plano de manutencao preventiva.",
        responsavelId: diego.id,
        prazo: shiftDate(10),
        status: "PENDENTE"
      }
    });
  }

  const treinamentoExistente = await prisma.treinamento.findFirst();
  if (!treinamentoExistente) {
    await prisma.treinamento.create({
      data: {
        titulo: "Reciclagem NR-35 - Trabalho em altura",
        norma: "NR-35",
        cargaHoraria: 8,
        dataRealizacao: shiftDate(14),
        validade: shiftDate(14 + 730),
        status: "PLANEJADO",
        responsavelId: bruno.id
      }
    });
  }

  const auditoriaExistente = await prisma.auditoria.findFirst();
  if (!auditoriaExistente) {
    await prisma.auditoria.create({
      data: {
        titulo: "Auditoria interna ISO 45001",
        escopo: "Sistema de gestao de SST",
        norma: "ISO 45001",
        dataPrevista: shiftDate(30),
        status: "PLANEJADA",
        responsavelId: carla.id
      }
    });
  }

  const rotaExistente = await prisma.rotaSegura.findFirst();
  if (!rotaExistente) {
    await prisma.rotaSegura.create({
      data: {
        nome: "Rota de evacuacao - Bloco A",
        descricao: "Verificacao de sinalizacao, iluminacao de emergencia e saidas desobstruidas.",
        area: "Bloco A",
        frequencia: "SEMANAL",
        status: "ATIVA",
        responsavelId: diego.id
      }
    });
  }

  console.log("Seed concluido.");
  console.log(`Usuario admin: ${adminEmail} / senha: ${adminSenha}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
