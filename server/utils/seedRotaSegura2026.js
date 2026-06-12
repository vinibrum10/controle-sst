// Seed da edicao "Rota Segura 2026": cria a edicao, sua proposta, os
// criterios de pontuacao, as regras condicionais entre eles e a
// configuracao de premiacao. Os valores aqui sao apenas a configuracao
// inicial - tudo pode ser editado depois pelo administrador nas telas de
// "Rota Segura 2026" (Edicoes, Proposta, Criterios, Regras, Premiacao).
const {
  CODIGO_APR_ERRO_ZERO,
  CODIGO_RISCOS_ADICIONAIS,
  CODIGO_MEDIDAS_ADICIONAIS,
  CODIGOS_PENALIDADE
} = require("./rotaSegura2026");

async function seedEdicaoRotaSegura2026(prisma) {
  const edicao = await prisma.rsEdicaoPrograma.upsert({
    where: { ano: 2026 },
    update: {},
    create: {
      nome: "Rota Segura 2026",
      ano: 2026,
      slogan: "O básico bem feito",
      objetivo: "Reavaliar a qualidade das APRs e fortalecer a análise de riscos.",
      descricao:
        "Edição 2026 do programa Rota Segura, focada na avaliação da Análise Preliminar de Risco (APR) " +
        "preenchida pelas equipes de campo, com pontuação proativa por qualidade de preenchimento e " +
        "identificação de riscos/medidas adicionais, além de penalidades reativas por infrações.",
      dataInicio: new Date("2026-01-01T00:00:00Z"),
      dataFim: new Date("2026-12-31T23:59:59Z"),
      ativo: true,
      observacoes: "Edição inicial cadastrada via seed. Ajuste critérios, regras e premiação conforme necessário."
    }
  });

  await prisma.rsProposta.upsert({
    where: { edicaoId: edicao.id },
    update: {},
    create: {
      edicaoId: edicao.id,
      titulo: "Rota Segura 2026",
      slogan: "O básico bem feito",
      mensagemAbertura:
        "Em 2026 o Rota Segura passa a focar na Análise Preliminar de Risco (APR): o básico bem feito é a " +
        "base para a segurança de toda a operação.",
      objetivoGeral: "Reavaliar a qualidade das APRs preenchidas pelas equipes e fortalecer a análise de riscos.",
      justificativa:
        "A qualidade do preenchimento da APR é determinante para a identificação correta de riscos e medidas " +
        "de controle antes do início das atividades.",
      publicoAlvo: "Equipes de campo das áreas operacionais.",
      areasParticipantes: "Linhas/Limpeza de Faixa, EAT, PCC, UFV.",
      regrasGerais:
        "Cada equipe é avaliada mensalmente por meio de APRs amostrais (selecionadas pelo SSO) e, quando " +
        "aplicável, por APRs enviadas via Forms. Penalidades reativas são lançadas em caso de infrações.",
      criteriosAvaliacao:
        "APR sem erros de preenchimento (+5, apenas APR amostral); riscos adicionais aprovados pelo comitê " +
        "(+2); medidas de controle adicionais aprovadas pelo comitê (+2); infrações leve (-1), grave (-3) e " +
        "gravíssima (-5).",
      estruturaComite:
        "O comitê avalia as solicitações de pontuação adicional (riscos e medidas de controle adicionais) " +
        "registradas nas avaliações de APR, aprovando ou reprovando cada solicitação.",
      regraPremiacao: "As equipes mais bem pontuadas em cada área/especialidade são premiadas ao final do período.",
      premios: "Premiação a definir conforme configuração da edição (ver tela de Premiação).",
      cronograma: "Avaliações mensais ao longo de 2026, com apuração de ranking mensal e acumulado.",
      observacoes: "Conteúdo inicial gerado via seed - revise e ajuste conforme o regulamento oficial da edição."
    }
  });

  const criteriosData = [
    {
      codigo: CODIGO_APR_ERRO_ZERO,
      nome: "APR sem erros de preenchimento",
      descricao: "Erro zero: cabeçalho, endereço, assinaturas, riscos/medidas mínimos, coerência, arquivamento e legibilidade corretos.",
      tipo: "PROATIVO",
      pontuacao: 5,
      categoria: "APR",
      exigeComite: false,
      exigeEvidencia: false,
      aplicaAmostral: true,
      aplicaForms: false,
      ordem: 1
    },
    {
      codigo: CODIGO_RISCOS_ADICIONAIS,
      nome: "Riscos adicionais aprovados",
      descricao: "Riscos adicionais identificados na APR e aprovados pelo comitê de avaliação.",
      tipo: "PROATIVO",
      pontuacao: 2,
      categoria: "APR",
      exigeComite: true,
      exigeEvidencia: true,
      aplicaAmostral: true,
      aplicaForms: true,
      ordem: 2
    },
    {
      codigo: CODIGO_MEDIDAS_ADICIONAIS,
      nome: "Medidas de controle adicionais aprovadas",
      descricao: "Medidas de controle adicionais propostas na APR e aprovadas pelo comitê de avaliação.",
      tipo: "PROATIVO",
      pontuacao: 2,
      categoria: "APR",
      exigeComite: true,
      exigeEvidencia: true,
      aplicaAmostral: true,
      aplicaForms: true,
      ordem: 3
    },
    {
      codigo: CODIGOS_PENALIDADE.LEVE,
      nome: "Infração leve",
      descricao: "Penalidade aplicada em caso de infração leve.",
      tipo: "REATIVO",
      pontuacao: -1,
      categoria: "PENALIDADE",
      exigeComite: false,
      exigeEvidencia: false,
      aplicaAmostral: true,
      aplicaForms: true,
      ordem: 4
    },
    {
      codigo: CODIGOS_PENALIDADE.GRAVE,
      nome: "Infração grave",
      descricao: "Penalidade aplicada em caso de infração grave.",
      tipo: "REATIVO",
      pontuacao: -3,
      categoria: "PENALIDADE",
      exigeComite: false,
      exigeEvidencia: false,
      aplicaAmostral: true,
      aplicaForms: true,
      ordem: 5
    },
    {
      codigo: CODIGOS_PENALIDADE.GRAVISSIMA,
      nome: "Infração gravíssima",
      descricao: "Penalidade aplicada em caso de infração gravíssima.",
      tipo: "REATIVO",
      pontuacao: -5,
      categoria: "PENALIDADE",
      exigeComite: false,
      exigeEvidencia: false,
      aplicaAmostral: true,
      aplicaForms: true,
      ordem: 6
    }
  ];

  const criteriosPorCodigo = {};
  for (const dados of criteriosData) {
    const existente = await prisma.rsCriterio.findFirst({ where: { edicaoId: edicao.id, codigo: dados.codigo } });
    const criterio = existente
      ? await prisma.rsCriterio.update({ where: { id: existente.id }, data: dados })
      : await prisma.rsCriterio.create({ data: { ...dados, edicaoId: edicao.id } });
    criteriosPorCodigo[dados.codigo] = criterio;
  }

  const erroZero = criteriosPorCodigo[CODIGO_APR_ERRO_ZERO];
  const riscos = criteriosPorCodigo[CODIGO_RISCOS_ADICIONAIS];
  const medidas = criteriosPorCodigo[CODIGO_MEDIDAS_ADICIONAIS];

  const regrasData = [
    {
      criterioId: riscos.id,
      criterioDependenteId: erroZero.id,
      tipoCondicao: "REQUER_CRITERIO_APROVADO",
      descricao: "Riscos adicionais só pontuam se a APR estiver aprovada sem erros de preenchimento (erro zero).",
      parametros: null
    },
    {
      criterioId: medidas.id,
      criterioDependenteId: erroZero.id,
      tipoCondicao: "REQUER_CRITERIO_APROVADO",
      descricao: "Medidas de controle adicionais só pontuam se a APR estiver aprovada sem erros de preenchimento (erro zero).",
      parametros: null
    },
    {
      criterioId: erroZero.id,
      criterioDependenteId: null,
      tipoCondicao: "BLOQUEADO_PARA_TIPO_APR",
      descricao: "APR enviada via Forms não pode receber os +5 pontos de APR sem erros de preenchimento (erro zero).",
      parametros: { tipoApr: "FORMS" }
    },
    {
      criterioId: erroZero.id,
      criterioDependenteId: null,
      tipoCondicao: "LIMITE_MENSAL_POR_EQUIPE",
      descricao: "Cada equipe pode ter no máximo 1 APR via Forms por mês de referência.",
      parametros: { tipoApr: "FORMS", limite: 1 }
    },
    {
      criterioId: erroZero.id,
      criterioDependenteId: null,
      tipoCondicao: "LIMITE_MENSAL_POR_EQUIPE",
      descricao: "Cada equipe pode ter no máximo 1 APR amostral por mês de referência.",
      parametros: { tipoApr: "AMOSTRAL", limite: 1 }
    }
  ];

  for (const dados of regrasData) {
    const existente = await prisma.rsRegraCondicional.findFirst({
      where: { edicaoId: edicao.id, criterioId: dados.criterioId, tipoCondicao: dados.tipoCondicao, descricao: dados.descricao }
    });
    if (!existente) {
      await prisma.rsRegraCondicional.create({ data: { ...dados, edicaoId: edicao.id, ativo: true } });
    }
  }

  const premiacoesData = [
    { area: "LINHAS_LIMPEZA_FAIXA", quantidade: 6, posicaoInicial: 1, posicaoFinal: 6 },
    { area: "EAT", quantidade: 10, posicaoInicial: 1, posicaoFinal: 10 },
    { area: "PCC", quantidade: 1, posicaoInicial: 1, posicaoFinal: 1 },
    { area: "UFV", quantidade: 1, posicaoInicial: 1, posicaoFinal: 1 }
  ];

  for (const dados of premiacoesData) {
    const existente = await prisma.rsPremiacao.findFirst({ where: { edicaoId: edicao.id, area: dados.area } });
    if (!existente) {
      await prisma.rsPremiacao.create({
        data: {
          ...dados,
          edicaoId: edicao.id,
          descricaoPremio: "Reconhecimento conforme regulamento da edição - ajuste a descrição do prêmio.",
          observacoes: null
        }
      });
    }
  }

  return edicao;
}

module.exports = { seedEdicaoRotaSegura2026 };
