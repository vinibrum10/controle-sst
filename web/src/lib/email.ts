import { formatDate } from "./format";
import { typeLabel, routinePeriodLabel } from "./enums";
import type { Tarefa } from "../types/tarefa";
import type { Funcionario } from "../types/funcionario";

function abrirRascunhoEmail(to: string, subject: string, body: string) {
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function notificarTarefaAtribuida(tarefa: Tarefa): boolean {
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
      "Acesse o sistema para acompanhar e atualizar o andamento.",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return true;
}

export function notificarApoioAtribuido(tarefa: Tarefa, apoio: Funcionario): boolean {
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
      "Acesse o sistema para alinhar a execução do apoio.",
    ].join("\n"),
  );
  return true;
}
