const prisma = require("../db");

// Registra uma acao administrativa no log de auditoria. Falhas ao registrar
// nao devem interromper a operacao principal, apenas ficar no log do servidor.
async function registrarAuditoria({ usuario, acao, entidade, entidadeId, detalhes } = {}) {
  try {
    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario?.sub ?? null,
        usuarioNome: usuario?.nome ?? null,
        usuarioEmail: usuario?.email ?? null,
        acao,
        entidade,
        entidadeId: entidadeId ?? null,
        detalhes: detalhes ?? undefined
      }
    });
  } catch (err) {
    console.error("Falha ao registrar log de auditoria:", err);
  }
}

module.exports = { registrarAuditoria };
