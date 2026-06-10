import { formatDate } from "./format.js";
import { typeLabel, routinePeriodLabel } from "./enums.js";

// Abre o cliente de e-mail padrao com um rascunho pre-preenchido. Usado
// como aviso simples (sem backend de e-mail) ao atribuir tarefas e apoios.
function abrirRascunhoEmail(to, subject, body) {
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function notificarTarefaAtribuida(tarefa) {
  const responsavel = tarefa.responsavel;
  if (!responsavel?.email) return false;

  abrirRascunhoEmail(
    responsavel.email,
    `Nova tarefa atribuída: ${tarefa.titulo}`,
    [
      `Olá, ${responsavel.nome}.`,
      "",
      "Uma tarefa foi atribuída para você no Controle SST.",
      "",
      `Tarefa: ${tarefa.titulo}`,
      `Tipo: ${typeLabel(tarefa.tipo)}${tarefa.tipo === "ROTINEIRA" ? ` (${routinePeriodLabel(tarefa.periodoRotina)})` : ""}`,
      `Prazo: ${formatDate(tarefa.prazo)}`,
      `Horas estimadas: ${tarefa.horasEstimadas}h`,
      tarefa.descricao ? `Observações: ${tarefa.descricao}` : "",
      "",
      "Acesse o sistema para acompanhar e atualizar o andamento."
    ].filter(Boolean).join("\n")
  );
  return true;
}

export function notificarApoioAtribuido(tarefa, apoio) {
  if (!apoio?.email) return false;
  const responsavel = tarefa.responsavel;

  abrirRascunhoEmail(
    apoio.email,
    `Pedido de apoio: ${tarefa.titulo}`,
    [
      `Olá, ${apoio.nome}.`,
      "",
      `${responsavel?.nome || "Uma pessoa da equipe"} solicitou seu apoio em uma tarefa de SST.`,
      "",
      `Tarefa: ${tarefa.titulo}`,
      `Responsável: ${responsavel?.nome || "Não informado"}`,
      `Tipo: ${typeLabel(tarefa.tipo)}${tarefa.tipo === "ROTINEIRA" ? ` (${routinePeriodLabel(tarefa.periodoRotina)})` : ""}`,
      `Prazo: ${formatDate(tarefa.prazo)}`,
      `Horas estimadas: ${tarefa.horasEstimadas}h`,
      "",
      "Acesse o sistema para alinhar a execução do apoio."
    ].join("\n")
  );
  return true;
}
