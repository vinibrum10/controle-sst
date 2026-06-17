const prisma = require("../db");
const { semanaInfoFromDate, findOrCreateSemana } = require("./semana");
const { calcularDuracaoUtil } = require("./duracaoUtil");

/**
 * Converte automaticamente OS Interliga abertas em semanas anteriores
 * (não finalizadas) em tarefas atrasadas na semana vigente.
 * Fecha a OS com duração calculada excluindo fins de semana.
 * Executa no startup do servidor — idempotente.
 */
async function converterOSAtrasadas() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const semanaAtual = semanaInfoFromDate(hoje);

  const osAtrasadas = await prisma.atendimentoOS.findMany({
    where: {
      iniciadoEm: { lt: semanaAtual.dataInicio },
      finalizadoEm: null,
      tarefaVinculadaId: null,
      responsavelId: { not: null }
    }
  });

  if (osAtrasadas.length === 0) return;

  console.log(`[osConverter] Convertendo ${osAtrasadas.length} OS atrasada(s) em tarefas...`);

  const semanaRecord = await findOrCreateSemana(semanaAtual.codigo);

  for (const os of osAtrasadas) {
    try {
      // Fecha a OS com duração excluindo fins de semana (pausa Sex 17h → Seg 00h)
      const finalizadoEm = hoje;
      const duracaoSegundos = calcularDuracaoUtil(
        os.iniciadoEm.getTime(),
        finalizadoEm.getTime()
      );

      const tarefa = await prisma.tarefa.create({
        data: {
          titulo: `OS Interliga: ${os.numeroOS}${os.solicitante ? ` — ${os.solicitante}` : ""}`,
          descricao: os.solicitante ? `Solicitante: ${os.solicitante}` : null,
          responsavelId: os.responsavelId,
          semanaId: semanaRecord?.id ?? null,
          prazo: hoje,
          tipo: "EVENTUAL",
          prioridade: "MEDIA",
          horasEstimadas: 2,
          status: "PENDENTE"
        }
      });

      await prisma.atendimentoOS.update({
        where: { id: os.id },
        data: { finalizadoEm, duracaoSegundos, tarefaVinculadaId: tarefa.id }
      });

      console.log(`[osConverter] OS ${os.numeroOS} → Tarefa "${tarefa.titulo}" (${tarefa.id})`);
    } catch (err) {
      console.error(`[osConverter] Erro ao converter OS ${os.numeroOS}:`, err.message);
    }
  }
}

module.exports = { converterOSAtrasadas };
