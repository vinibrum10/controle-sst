const prisma = require("../db");

const TIPOS_NOTIFICACAO = ["TAREFA_ATRIBUIDA", "APOIO_SOLICITADO", "PERMISSAO_ALTERADA", "TAREFA_PRAZO"];

// Tipos que tambem disparam e-mail (alem da notificacao in-app).
const TIPOS_COM_EMAIL = new Set(["TAREFA_ATRIBUIDA", "APOIO_SOLICITADO"]);

const TIPO_LABELS = {
  TAREFA_ATRIBUIDA: "Nova tarefa atribuída",
  APOIO_SOLICITADO: "Pedido de apoio",
  PERMISSAO_ALTERADA: "Permissões atualizadas",
  TAREFA_PRAZO: "Prazo de tarefa próximo ou vencido"
};

const PADRAO = { inApp: true, email: true };

// Retorna a preferencia do usuario para o tipo informado, assumindo o
// padrao (inApp=true, email=true) quando nao ha registro salvo.
async function getPreferencia(usuarioId, tipo) {
  const registro = await prisma.preferenciaNotificacao.findUnique({
    where: { usuarioId_tipo: { usuarioId, tipo } }
  });
  return registro ? { inApp: registro.inApp, email: registro.email } : { ...PADRAO };
}

// Filtra, dentre os ids informados, apenas os usuarios que querem receber
// notificacoes in-app do tipo informado.
async function filtrarPorPreferenciaInApp(usuarioIds, tipo) {
  if (usuarioIds.length === 0) return usuarioIds;
  const desativados = await prisma.preferenciaNotificacao.findMany({
    where: { usuarioId: { in: usuarioIds }, tipo, inApp: false },
    select: { usuarioId: true }
  });
  const idsDesativados = new Set(desativados.map((item) => item.usuarioId));
  return usuarioIds.filter((id) => !idsDesativados.has(id));
}

module.exports = { TIPOS_NOTIFICACAO, TIPOS_COM_EMAIL, TIPO_LABELS, getPreferencia, filtrarPorPreferenciaInApp };
