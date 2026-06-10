// Dados de demonstracao compartilhados entre o seed inicial
// (prisma/seed.js) e o endpoint "restaurar demonstracao".

const { semanaInfoFromDate } = require("./semana");

function shiftDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
}

const FUNCIONARIOS_DEMO = [
  { nome: "Ana Paula", funcao: "Tecnica de Seguranca", email: "ana.paula@empresa.com.br", capacidade: 32 },
  { nome: "Bruno Reis", funcao: "Engenheiro de Seguranca", email: "bruno.reis@empresa.com.br", capacidade: 30 },
  { nome: "Carla Nunes", funcao: "Analista SST", email: "carla.nunes@empresa.com.br", capacidade: 28 },
  { nome: "Diego Martins", funcao: "Tecnico de Seguranca", email: "diego.martins@empresa.com.br", capacidade: 32 }
];

async function getOrCreateSemana(prisma, date) {
  const info = semanaInfoFromDate(date);
  return prisma.semana.upsert({
    where: { codigo: info.codigo },
    update: {},
    create: info
  });
}

async function seedFuncionariosDemo(prisma) {
  const pessoas = [];
  for (const dados of FUNCIONARIOS_DEMO) {
    const pessoa = await prisma.funcionario.upsert({
      where: { email: dados.email },
      update: { ativo: true },
      create: dados
    });
    pessoas.push(pessoa);
  }
  return pessoas;
}

async function seedTarefasDemo(prisma, pessoas) {
  const [ana, bruno, carla, diego] = pessoas;
  const semanaAtual = await getOrCreateSemana(prisma, new Date());

  await prisma.tarefa.create({
    data: {
      titulo: "Inspecao semanal da producao",
      descricao: "Checklist de maquinas, sinalizacao, rotas de fuga e registros fotograficos.",
      responsavelId: ana.id,
      semanaId: semanaAtual.id,
      prazo: shiftDate(2),
      tipo: "ROTINEIRA",
      periodoRotina: "SEMANAL",
      prioridade: "ALTA",
      horasEstimadas: 6,
      status: "EM_ANDAMENTO",
      criadoEm: shiftDate(-2)
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: "Atualizar matriz de treinamentos",
      descricao: "Conferir vencimentos de NR-35, NR-33, integracao e reciclagens.",
      responsavelId: bruno.id,
      semanaId: semanaAtual.id,
      prazo: shiftDate(4),
      tipo: "ROTINEIRA",
      periodoRotina: "MENSAL",
      prioridade: "MEDIA",
      horasEstimadas: 5,
      status: "PENDENTE",
      criadoEm: shiftDate(-1)
    }
  });

  const tarefa3 = await prisma.tarefa.create({
    data: {
      titulo: "Investigar quase acidente na expedicao",
      descricao: "Levantar causa raiz, acoes corretivas e responsaveis por bloqueios.",
      responsavelId: ana.id,
      apoioId: diego.id,
      semanaId: semanaAtual.id,
      prazo: shiftDate(-1),
      tipo: "EVENTUAL",
      prioridade: "CRITICA",
      horasEstimadas: 7,
      status: "EM_ANDAMENTO",
      criadoEm: shiftDate(-5)
    }
  });

  await prisma.pedidoAjuda.create({
    data: {
      tarefaId: tarefa3.id,
      solicitanteId: ana.id,
      atendentePorId: diego.id,
      status: "ATENDIDO",
      atendidoEm: shiftDate(-1)
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: "Enviar indicadores mensais de SST",
      descricao: "Consolidar taxa de frequencia, gravidade, acoes vencidas e treinamentos.",
      responsavelId: carla.id,
      semanaId: semanaAtual.id,
      prazo: shiftDate(-2),
      tipo: "ROTINEIRA",
      periodoRotina: "MENSAL",
      prioridade: "MEDIA",
      horasEstimadas: 4,
      status: "CONCLUIDA",
      criadoEm: shiftDate(-7),
      concluidaEm: shiftDate(-2)
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: "Avaliar mudanca de layout do almoxarifado",
      descricao: "Verificar fluxo, empilhamento, extintores, ergonomia e isolamento.",
      responsavelId: bruno.id,
      semanaId: semanaAtual.id,
      prazo: shiftDate(5),
      tipo: "EVENTUAL",
      prioridade: "ALTA",
      horasEstimadas: 8,
      status: "PENDENTE",
      criadoEm: shiftDate(0)
    }
  });
}

module.exports = { FUNCIONARIOS_DEMO, shiftDate, getOrCreateSemana, seedFuncionariosDemo, seedTarefasDemo };
