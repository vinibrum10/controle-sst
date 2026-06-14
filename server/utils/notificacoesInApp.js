const prisma = require("../db");
const { getPreferencia } = require("./notificacaoPreferencias");

const TAREFAS_LINK = "/dashboard/tarefas";
const CONFIGURACOES_LINK = "/configuracoes";

const NOTIFICACAO_PERMISSAO_ALTERADA = {
  tipo: "PERMISSAO_ALTERADA",
  titulo: "Permissões atualizadas",
  mensagem: "Suas permissões de acesso foram atualizadas pelo administrador.",
  link: CONFIGURACOES_LINK
};

// Notifica o responsavel pela tarefa recem-criada ou reatribuida. Retorna a
// preferencia do usuario (ou null se nao houver usuario vinculado), para que
// o chamador decida se deve enviar o e-mail correspondente.
async function notificarTarefaAtribuida(tarefa) {
  if (!tarefa.responsavelId) return null;
  const usuario = await prisma.usuario.findUnique({ where: { funcionarioId: tarefa.responsavelId } });
  if (!usuario) return null;

  const preferencia = await getPreferencia(usuario.id, "TAREFA_ATRIBUIDA");
  if (preferencia.inApp) {
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

  return { usuario, preferencia };
}

// Notifica a pessoa designada para apoiar uma tarefa. Retorna a preferencia
// do usuario (ou null se nao houver usuario vinculado).
async function notificarApoioSolicitado(apoioFuncionarioId, tarefa) {
  if (!apoioFuncionarioId) return null;
  const usuario = await prisma.usuario.findUnique({ where: { funcionarioId: apoioFuncionarioId } });
  if (!usuario) return null;

  const preferencia = await getPreferencia(usuario.id, "APOIO_SOLICITADO");
  if (preferencia.inApp) {
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

  return { usuario, preferencia };
}

module.exports = { notificarTarefaAtribuida, notificarApoioSolicitado, NOTIFICACAO_PERMISSAO_ALTERADA };
