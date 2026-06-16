const tarefaInclude = {
  responsavel: { select: { id: true, nome: true, email: true, foto: true } },
  apoio: { select: { id: true, nome: true, email: true, foto: true } },
  semana: true,
  pedidosAjuda: true,
  apontamentos: {
    where: { finalizadoEm: null },
    orderBy: { iniciadoEm: "desc" },
    take: 1
  }
};

function serializeTarefa(tarefa) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    descricao: tarefa.descricao || "",
    responsavelId: tarefa.responsavelId,
    responsavel: tarefa.responsavel || null,
    apoioId: tarefa.apoioId,
    apoio: tarefa.apoio || null,
    semana: tarefa.semana?.codigo || null,
    prazo: tarefa.prazo,
    tipo: tarefa.tipo,
    prioridade: tarefa.prioridade,
    periodoRotina: tarefa.periodoRotina,
    horasEstimadas: tarefa.horasEstimadas,
    horasRealizadas: tarefa.horasRealizadas ?? 0,
    status: tarefa.status,
    criadoEm: tarefa.criadoEm,
    concluidaEm: tarefa.concluidaEm,
    pedidosAjuda: tarefa.pedidosAjuda || [],
    apontamentoAtivo: tarefa.apontamentos?.[0] ?? null
  };
}

module.exports = { tarefaInclude, serializeTarefa };
