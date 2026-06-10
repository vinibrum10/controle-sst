const tarefaInclude = {
  responsavel: { select: { id: true, nome: true, email: true, foto: true } },
  apoio: { select: { id: true, nome: true, email: true, foto: true } },
  semana: true,
  pedidosAjuda: true
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
    status: tarefa.status,
    criadoEm: tarefa.criadoEm,
    concluidaEm: tarefa.concluidaEm,
    pedidosAjuda: tarefa.pedidosAjuda || []
  };
}

module.exports = { tarefaInclude, serializeTarefa };
