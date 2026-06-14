const prisma = require("../db");

const TAREFAS_LINK = "/dashboard/tarefas";
const CONFIGURACOES_LINK = "/configuracoes";

const NOTIFICACAO_PERMISSAO_ALTERADA = {
  tipo: "PERMISSAO_ALTERADA",
  titulo: "Permissões atualizadas",
  mensagem: "Suas permissões de acesso foram atualizadas pelo administrador.",
  link: CONFIGURACOES_LINK
};

// Notifica o responsavel pela tarefa recem-criada ou reatribuida.
async function notificarTarefaAtribuida(tarefa) {
  if (!tarefa.responsavelId) return;
  const usuario = await prisma.usuario.findUnique({ where: { funcionarioId: tarefa.responsavelId } });
  if (!usuario) return;

  await prisma.notificacao.create({
    data: {
      usuarioId: usuario.id,
      tipo: "TAREFA_ATRIBUIDA",
      titulo: "Nova tarefa atribuída",
      mensagem: `Você foi designado(a) para a tarefa "${tarefa.titulo}".`,
      link: TAREFAS_LINK
    }
  });
}

// Notifica a pessoa designada para apoiar uma tarefa.
async function notificarApoioSolicitado(apoioFuncionarioId, tarefa) {
  if (!apoioFuncionarioId) return;
  const usuario = await prisma.usuario.findUnique({ where: { funcionarioId: apoioFuncionarioId } });
  if (!usuario) return;

  await prisma.notificacao.create({
    data: {
      usuarioId: usuario.id,
      tipo: "APOIO_SOLICITADO",
      titulo: "Pedido de apoio",
      mensagem: `Você foi designado(a) para apoiar na tarefa "${tarefa.titulo}".`,
      link: TAREFAS_LINK
    }
  });
}

module.exports = { notificarTarefaAtribuida, notificarApoioSolicitado, NOTIFICACAO_PERMISSAO_ALTERADA };
