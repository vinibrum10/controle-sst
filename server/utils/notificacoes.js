const { enviarEmail } = require("./email");

const TIPO_LABELS = { ROTINEIRA: "Rotineira", EVENTUAL: "Eventual" };
const PERIODO_LABELS = {
  SEMANAL: "Semanal",
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual"
};

function formatarData(data) {
  if (!data) return "Nao informado";
  return new Date(data).toLocaleDateString("pt-BR");
}

function descreverTipo(tarefa) {
  const tipo = TIPO_LABELS[tarefa.tipo] || tarefa.tipo;
  if (tarefa.tipo !== "ROTINEIRA") return tipo;
  const periodo = PERIODO_LABELS[tarefa.periodoRotina] || tarefa.periodoRotina;
  return `${tipo} (${periodo})`;
}

// Notifica por e-mail o responsavel quando uma nova tarefa e atribuida a ele.
async function notificarTarefaCriada(tarefa) {
  const responsavel = tarefa.responsavel;
  if (!responsavel?.email) return { sucesso: false, motivo: "sem-email" };

  const texto = [
    `Ola, ${responsavel.nome}.`,
    "",
    "Uma nova tarefa foi atribuida para voce no Controle SST.",
    "",
    `Tarefa: ${tarefa.titulo}`,
    `Tipo: ${descreverTipo(tarefa)}`,
    `Prazo: ${formatarData(tarefa.prazo)}`,
    `Horas estimadas: ${tarefa.horasEstimadas}h`,
    tarefa.descricao ? `Observacoes: ${tarefa.descricao}` : "",
    "",
    "Acesse o sistema para acompanhar e atualizar o andamento."
  ].filter(Boolean).join("\n");

  return enviarEmail({
    to: responsavel.email,
    subject: `Nova tarefa atribuida: ${tarefa.titulo}`,
    text: texto
  });
}

// Notifica por e-mail a pessoa designada para apoiar em uma tarefa.
async function notificarApoioAtribuido(tarefa, apoio) {
  if (!apoio?.email) return { sucesso: false, motivo: "sem-email" };
  const responsavel = tarefa.responsavel;

  const texto = [
    `Ola, ${apoio.nome}.`,
    "",
    `${responsavel?.nome || "Uma pessoa da equipe"} solicitou seu apoio em uma tarefa de SST.`,
    "",
    `Tarefa: ${tarefa.titulo}`,
    `Responsavel: ${responsavel?.nome || "Nao informado"}`,
    `Tipo: ${descreverTipo(tarefa)}`,
    `Prazo: ${formatarData(tarefa.prazo)}`,
    `Horas estimadas: ${tarefa.horasEstimadas}h`,
    "",
    "Acesse o sistema para alinhar a execucao do apoio."
  ].join("\n");

  return enviarEmail({
    to: apoio.email,
    subject: `Pedido de apoio: ${tarefa.titulo}`,
    text: texto
  });
}

module.exports = { notificarTarefaCriada, notificarApoioAtribuido };
