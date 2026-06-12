// Motor de pontuacao do programa "Rota Segura". As regras (criterios e
// dependencias entre eles) sao configuraveis por edicao anual atraves dos
// modelos RsCriterio e RsRegraCondicional - nenhum valor de pontuacao fica
// fixo neste arquivo.
//
// O motor reconhece um conjunto de "codigos" de criterio para calcular a
// pontuacao automaticamente a partir dos dados lancados na avaliacao de
// APR / penalidade. Administradores podem ajustar nome, descricao,
// pontuacao, categoria e aplicabilidade (APR amostral/Forms) de cada
// criterio sem alterar codigo. Para novas categorias de avaliacao
// (videos, DDS, inspecoes, etc.) em edicoes futuras, sera necessario
// estender este motor com os codigos correspondentes - ver "proximos
// passos" no resumo da implementacao.

// Codigos de criterio reconhecidos para avaliacoes de APR (categoria APR,
// tipo PROATIVO).
const CODIGO_APR_ERRO_ZERO = "APR_ERRO_ZERO";
const CODIGO_RISCOS_ADICIONAIS = "RISCOS_ADICIONAIS_APROVADOS";
const CODIGO_MEDIDAS_ADICIONAIS = "MEDIDAS_ADICIONAIS_APROVADAS";

// Codigos de criterio reconhecidos para penalidades (categoria PENALIDADE,
// tipo REATIVO), indexados pelo RsTipoInfracao correspondente.
const CODIGOS_PENALIDADE = {
  LEVE: "PENALIDADE_LEVE",
  GRAVE: "PENALIDADE_GRAVE",
  GRAVISSIMA: "PENALIDADE_GRAVISSIMA"
};

// Valores padrao usados apenas se a edicao nao tiver o criterio de
// penalidade correspondente configurado.
const PENALIDADE_PONTOS_PADRAO = {
  LEVE: -1,
  GRAVE: -3,
  GRAVISSIMA: -5
};

const MES_REFERENCIA_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

function criterioAplicavel(criterio, tipoApr) {
  if (!criterio || !criterio.ativo) return false;
  if (tipoApr === "AMOSTRAL") return criterio.aplicaAmostral;
  if (tipoApr === "FORMS") return criterio.aplicaForms;
  return true;
}

// Indica se a avaliacao "conquistou" o criterio reconhecido, independente
// de dependencias entre criterios.
function criterioConcedido(criterio, avaliacao) {
  switch (criterio.codigo) {
    case CODIGO_APR_ERRO_ZERO:
      return avaliacao.aprovacaoBasica === true;
    case CODIGO_RISCOS_ADICIONAIS:
      return avaliacao.riscosAdicionais === true && avaliacao.riscosAdicionaisComite === "APROVADO";
    case CODIGO_MEDIDAS_ADICIONAIS:
      return avaliacao.medidasAdicionais === true && avaliacao.medidasAdicionaisComite === "APROVADO";
    default:
      return false;
  }
}

// Verifica as regras REQUER_CRITERIO_APROVADO ativas para o criterio: ele
// so pontua se todos os criterios dos quais depende tiverem sido
// concedidos na mesma avaliacao.
function dependenciaSatisfeita(criterio, avaliacao, regras, criteriosPorId) {
  const dependencias = regras.filter(
    (regra) =>
      regra.ativo &&
      regra.tipoCondicao === "REQUER_CRITERIO_APROVADO" &&
      regra.criterioId === criterio.id &&
      regra.criterioDependenteId
  );

  if (dependencias.length === 0) return true;

  return dependencias.every((regra) => {
    const dependente = criteriosPorId[regra.criterioDependenteId];
    return dependente ? criterioConcedido(dependente, avaliacao) : true;
  });
}

// Calcula a pontuacao proativa de uma avaliacao de APR a partir dos
// criterios ativos (categoria APR, tipo PROATIVO) e regras condicionais da
// edicao. Retorna o total e o detalhamento dos criterios concedidos.
function calcularPontuacaoApr(avaliacao, criterios, regras) {
  const criteriosPorId = Object.fromEntries(criterios.map((criterio) => [criterio.id, criterio]));
  let total = 0;
  const detalhes = [];

  for (const criterio of criterios) {
    if (criterio.categoria !== "APR" || criterio.tipo !== "PROATIVO") continue;
    if (!criterioAplicavel(criterio, avaliacao.tipo)) continue;
    if (!criterioConcedido(criterio, avaliacao)) continue;
    if (!dependenciaSatisfeita(criterio, avaliacao, regras, criteriosPorId)) continue;

    total += criterio.pontuacao;
    detalhes.push({ criterioId: criterio.id, codigo: criterio.codigo, nome: criterio.nome, pontos: criterio.pontuacao });
  }

  return { total, detalhes };
}

// Resolve os pontos (sempre negativos) de uma penalidade a partir do
// criterio de penalidade configurado na edicao; usa o valor padrao se a
// edicao nao tiver o criterio correspondente.
function calcularPontosPenalidade(tipo, criterios = []) {
  const codigo = CODIGOS_PENALIDADE[tipo];
  const criterio = criterios.find((item) => item.codigo === codigo && item.ativo);
  if (criterio) return criterio.pontuacao;
  return PENALIDADE_PONTOS_PADRAO[tipo] ?? 0;
}

module.exports = {
  MES_REFERENCIA_REGEX,
  CODIGO_APR_ERRO_ZERO,
  CODIGO_RISCOS_ADICIONAIS,
  CODIGO_MEDIDAS_ADICIONAIS,
  CODIGOS_PENALIDADE,
  PENALIDADE_PONTOS_PADRAO,
  criterioAplicavel,
  criterioConcedido,
  dependenciaSatisfeita,
  calcularPontuacaoApr,
  calcularPontosPenalidade
};
