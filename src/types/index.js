// Definicoes de tipos (JSDoc) compartilhadas pelo front-end.
// Espelham os models definidos em prisma/schema.prisma.

/**
 * @typedef {Object} Funcionario
 * @property {string} id
 * @property {string} nome
 * @property {string} funcao
 * @property {string} email
 * @property {number} capacidade
 * @property {string|null} foto
 * @property {boolean} ativo
 */

/**
 * @typedef {"PENDENTE"|"EM_ANDAMENTO"|"CONCLUIDA"} StatusTarefa
 * @typedef {"ROTINEIRA"|"EVENTUAL"} TipoTarefa
 * @typedef {"BAIXA"|"MEDIA"|"ALTA"|"CRITICA"} PrioridadeTarefa
 * @typedef {"SEMANAL"|"MENSAL"|"TRIMESTRAL"|"SEMESTRAL"|"ANUAL"} PeriodoRotina
 */

/**
 * @typedef {Object} Tarefa
 * @property {string} id
 * @property {string} titulo
 * @property {string} descricao
 * @property {string|null} responsavelId
 * @property {Funcionario|null} responsavel
 * @property {string|null} apoioId
 * @property {Funcionario|null} apoio
 * @property {string|null} semana - codigo "AAAA-Www"
 * @property {string} prazo - data ISO
 * @property {TipoTarefa} tipo
 * @property {PrioridadeTarefa} prioridade
 * @property {PeriodoRotina|null} periodoRotina
 * @property {number} horasEstimadas
 * @property {StatusTarefa} status
 * @property {string} criadoEm
 * @property {string|null} concluidaEm
 * @property {Array<Object>} pedidosAjuda
 */

/**
 * @typedef {Object} Usuario
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 * @property {"ADMIN"|"GESTOR"|"COLABORADOR"} papel
 */

/**
 * @typedef {Object} Filtros
 * @property {string} semana
 * @property {string} responsavel
 * @property {string} tipo
 * @property {string} status
 */

export {};
