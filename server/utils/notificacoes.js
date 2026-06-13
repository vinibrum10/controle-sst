const { enviarEmail } = require("./mailer");

const TYPE_LABELS = {
  ROTINEIRA: "Rotineira",
  EVENTUAL: "Eventual"
};

const ROUTINE_PERIOD_LABELS = {
  SEMANAL: "Semanal",
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual"
};

function formatarData(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function tipoLabel(tarefa) {
  const tipo = TYPE_LABELS[tarefa.tipo] || tarefa.tipo;
  if (tarefa.tipo === "ROTINEIRA") {
    return `${tipo} (${ROUTINE_PERIOD_LABELS[tarefa.periodoRotina] || ROUTINE_PERIOD_LABELS.SEMANAL})`;
  }
  return tipo;
}

// Notifica o responsavel pela tarefa recem-criada.
async function enviarNotificacaoTarefaAtribuida(tarefa) {
  const responsavel = tarefa.responsavel;
  if (!responsavel?.email) {
    return { enviado: false, motivo: "Responsavel sem e-mail cadastrado." };
  }

  const linhas = [
    `Olá, ${responsavel.nome}.`,
    "",
    "Uma tarefa foi atribuída para você no SGEPI - Sistema de Gestão de Equipes e Programas Institucionais.",
    "",
    `Tarefa: ${tarefa.titulo}`,
    `Tipo: ${tipoLabel(tarefa)}`,
    `Prazo: ${formatarData(tarefa.prazo)}`,
    `Horas estimadas: ${tarefa.horasEstimadas}h`,
    tarefa.descricao ? `Observações: ${tarefa.descricao}` : "",
    "",
    "Acesse o sistema para acompanhar e atualizar o andamento."
  ].filter(Boolean);

  return enviarEmail({
    to: responsavel.email,
    subject: `Nova tarefa atribuída: ${tarefa.titulo}`,
    text: linhas.join("\n"),
    html: `<p>${linhas.join("</p><p>")}</p>`
  });
}

// Notifica a pessoa designada para apoiar uma tarefa.
async function enviarNotificacaoApoioAtribuido(tarefa, apoio) {
  if (!apoio?.email) {
    return { enviado: false, motivo: "Pessoa de apoio sem e-mail cadastrado." };
  }

  const responsavel = tarefa.responsavel;
  const linhas = [
    `Olá, ${apoio.nome}.`,
    "",
    `${responsavel?.nome || "Uma pessoa da equipe"} solicitou seu apoio em uma tarefa no SGEPI.`,
    "",
    `Tarefa: ${tarefa.titulo}`,
    `Responsável: ${responsavel?.nome || "Não informado"}`,
    `Tipo: ${tipoLabel(tarefa)}`,
    `Prazo: ${formatarData(tarefa.prazo)}`,
    `Horas estimadas: ${tarefa.horasEstimadas}h`,
    "",
    "Acesse o sistema para alinhar a execução do apoio."
  ];

  return enviarEmail({
    to: apoio.email,
    subject: `Pedido de apoio: ${tarefa.titulo}`,
    text: linhas.join("\n"),
    html: `<p>${linhas.join("</p><p>")}</p>`
  });
}

module.exports = { enviarNotificacaoTarefaAtribuida, enviarNotificacaoApoioAtribuido };
