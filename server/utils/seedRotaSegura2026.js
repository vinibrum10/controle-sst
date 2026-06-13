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

  const propostaData = {
    titulo: "Rota Segura 2026",
    slogan: "O básico bem feito",
    mensagemAbertura:
      "Bem-vindos ao Rota Segura 2026! Vamos reforçar o básico bem feito. Convidamos todas as equipes a " +
      "participarem do programa, que visa reavaliar as APRs e a metodologia de análise de riscos. No fim de " +
      "cada mês teremos a atualização da apuração e a divulgação dos resultados.",
    objetivoGeral:
      "Reavaliar a qualidade das APRs preenchidas pelas equipes e fortalecer a metodologia de análise de " +
      "riscos, reconstruindo o básico bem feito.",
    justificativa:
      "A qualidade do preenchimento da APR é determinante para a identificação correta de riscos e medidas " +
      "de controle antes do início das atividades. Em 2026 o programa retoma o foco no básico bem feito, " +
      "reforçando a importância da APR como ferramenta de gestão de riscos.",
    publicoAlvo: "Equipes de campo das áreas operacionais de Linhas/Limpeza de Faixa, EAT, PCC e UFV.",
    areasParticipantes:
      "Linhas/Limpeza de Faixa, EAT, PCC e UFV. Conforme apresentação 2026: 18 equipes premiáveis em " +
      "Linhas/Limpeza de Faixa, 36 em EAT, 6 em PCC e 6 em UFV, totalizando 243 participantes em 71 equipes " +
      "e 62 premiações.",
    regrasGerais:
      "Serão avaliadas 2 APRs por mês de cada equipe: 1 amostral e 1 enviada via formulário (Forms). Na " +
      "análise amostral, a equipe só pode pontuar nos critérios 'Riscos adicionais apontados' e 'Medidas de " +
      "controle adicionais apontadas' se também tiver pontuado em 'APR sem erros de preenchimento'. No envio " +
      "via Forms, cada equipe tem direito a 1 análise por mês e a APR enviada via Forms não pontua no " +
      "critério 'APR sem erros de preenchimento'. Penalidades reativas são lançadas em caso de infrações.",
    criteriosAvaliacao:
      "Critérios proativos - APR sem erros de preenchimento (+5, avaliação amostral): preenchimento correto " +
      "(cabeçalho, endereço, entre outros), assinatura de todos os envolvidos na atividade, riscos e medidas " +
      "de controle correlacionados (mínimo esperado) e arquivamento em sistema EAM; Riscos adicionais " +
      "apontados e aprovados pelo comitê de avaliação (+2); Medidas de controle adicionais apontadas e " +
      "aprovadas pelo comitê de avaliação (+2). Critérios reativos (infrações) - leve (-1): APR com " +
      "preenchimento incompleto, armazenamento da APR de forma ilegível, multa de trânsito leve/média, " +
      "ocorrência de incidente sem comunicação; grave (-3): APR sem assinatura, demarcação errada das etapas " +
      "na APR, multa de trânsito grave/gravíssima, acidente de trabalho sem afastamento, acidente com " +
      "veículo, excesso de velocidade; gravíssima (-5): EAM com OS finalizada sem APR, acidente com " +
      "afastamento, advertência.",
    estruturaComite:
      "O comitê de avaliação é composto por Supervisores e Encarregados/Especialistas de O&M, representantes " +
      "de SSO e Coordenadores de O&M, com no mínimo 2 integrantes de cada representação. O comitê avalia as " +
      "solicitações de pontuação adicional (riscos e medidas de controle adicionais) registradas nas " +
      "avaliações de APR, aprovando ou reprovando cada solicitação. As avaliações ocorrem todas as " +
      "quartas-feiras.",
    regraPremiacao:
      "Serão premiadas as equipes que obtiverem a maior pontuação em sua especialidade (premiação coletiva), " +
      "dividida por área de atuação: Linhas/Limpeza de Faixa, PCC, EAT e UFV.",
    premios:
      "1º lugar: JBL Caixa de Som Boombox 4 Bluetooth (Som JBL Pro); 2º lugar: Smart TV 32\" AOC HD Roku TV; " +
      "3º lugar: Tênis Asics Gel Resolution 9; 4º lugar: Micro-ondas 31 Litros Electrolux; 5º lugar: Tênis " +
      "Asics Gel Kimera; 6º lugar: Fone de Ouvido JBL Tune 520BT; 7º ao 10º lugar (EAT): Fones de Ouvido " +
      "True Wireless JBL Wave Buds. Imagens meramente ilustrativas - prêmios sujeitos a alteração conforme " +
      "disponibilidade.",
    cronograma:
      "Avaliações mensais ao longo de 2026, com apuração de ranking mensal e acumulado. Ao final de cada mês: " +
      "atualização da apuração da APR e divulgação dos resultados.",
    observacoes: "Conteúdo gerado a partir da apresentação Rota Segura 2026 - revise e ajuste conforme o regulamento oficial da edição."
  };

  await prisma.rsProposta.upsert({
    where: { edicaoId: edicao.id },
    update: propostaData,
    create: { edicaoId: edicao.id, ...propostaData }
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

  const premiosPorPosicao =
    "1º lugar - JBL Caixa de Som Boombox 4 Bluetooth (Som JBL Pro); 2º lugar - Smart TV 32\" AOC HD Roku TV; " +
    "3º lugar - Tênis Asics Gel Resolution 9; 4º lugar - Micro-ondas 31 Litros Electrolux; 5º lugar - Tênis " +
    "Asics Gel Kimera; 6º lugar - Fone de Ouvido JBL Tune 520BT";
  const premioUnico =
    "1º lugar - JBL Caixa de Som Boombox 4 Bluetooth (Som JBL Pro). Imagens meramente ilustrativas - prêmio " +
    "sujeito a alteração conforme disponibilidade.";

  const premiacoesData = [
    {
      area: "LINHAS_LIMPEZA_FAIXA",
      quantidade: 6,
      posicaoInicial: 1,
      posicaoFinal: 6,
      descricaoPremio: `${premiosPorPosicao}. Imagens meramente ilustrativas - prêmios sujeitos a alteração conforme disponibilidade.`
    },
    {
      area: "EAT",
      quantidade: 10,
      posicaoInicial: 1,
      posicaoFinal: 10,
      descricaoPremio: `${premiosPorPosicao}; 7º ao 10º lugar - Fones de Ouvido True Wireless JBL Wave Buds. Imagens meramente ilustrativas - prêmios sujeitos a alteração conforme disponibilidade.`
    },
    { area: "PCC", quantidade: 1, posicaoInicial: 1, posicaoFinal: 1, descricaoPremio: premioUnico },
    { area: "UFV", quantidade: 1, posicaoInicial: 1, posicaoFinal: 1, descricaoPremio: premioUnico }
  ];

  for (const dados of premiacoesData) {
    const existente = await prisma.rsPremiacao.findFirst({ where: { edicaoId: edicao.id, area: dados.area } });
    if (existente) {
      await prisma.rsPremiacao.update({ where: { id: existente.id }, data: dados });
    } else {
      await prisma.rsPremiacao.create({ data: { ...dados, edicaoId: edicao.id, observacoes: null } });
    }
  }

  await seedEquipesRotaSegura2026(prisma);

  return edicao;
}

// Equipes participantes da edição 2026, extraídas do controle do programa
// (planilha de classificação). Os campos supervisor/tst e a observação com
// o código regional refletem a organização das equipes na planilha oficial.
async function seedEquipesRotaSegura2026(prisma) {
  const equipesData = [
    { nome: "Uberlandia LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "André Luiz Garcia da Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Nova Ponte LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "André Luiz Garcia da Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "São Gotardo LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "André Luiz Garcia da Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Uberlandia Obras 1", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Edney Carmo Irenis", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Uberlandia Obras 2", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Edney Carmo Irenis", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Estreito LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "André Luiz Garcia da Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: CANTE" },
    { nome: "Teresina LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Tiangua LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Cachoeira Paulista LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "André Luiz Garcia da Silva", tst: "Felipe dos Santos Alves", observacoes: "Regional: CPTE" },
    { nome: "Imbirussu LT 01", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Márcio Sérgio Bellan", observacoes: "Regional: BTE" },
    { nome: "Imbirussu LT 02", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Márcio Sérgio Bellan", observacoes: "Regional: BTE" },
    { nome: "Anastácio LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Márcio Sérgio Bellan", observacoes: "Regional: LTC" },
    { nome: "Encruzo Novo LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: ENTE" },
    { nome: "Ji Paraná LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Vilhena LT 01", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Vilhena LT 02", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Vila do Conde LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: VCTE" },
    { nome: "Açailandia LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: IMTE" },
    { nome: "Juruti LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Jose Luiz Andrade dos Santos", observacoes: "Regional: PATE" },
    { nome: "Uberlandia EAT 01", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Uberlandia EAT 02", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Nova Ponte EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "São Gotardo EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Bom Despacho EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Estreito EAT 1", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Estreito EAT 2", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: CANTE" },
    { nome: "Itaguaçu EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: CTE" },
    { nome: "Barra dos Coqueiros EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: CTE" },
    { nome: "Venda das Pedras EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "Felipe dos Santos Alves", observacoes: "Regional: PTE" },
    { nome: "Fernão Dias EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "José Henrique Souza Dias", observacoes: "Regional: CANTE" },
    { nome: "Vila do Conde EAT 1", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: VCTE" },
    { nome: "Vila do Conde EAT 2", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: VCTE" },
    { nome: "Tucurui EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: VCTE" },
    { nome: "Encruzo Novo EAT", area: "EAT", supervisor: "Juliana da Cruz Brilhante", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: ENTE" },
    { nome: "SANTA LUZIA 3 EAT", area: "EAT", supervisor: "Juliana da Cruz Brilhante", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: IMTE" },
    { nome: "Miranda EAT", area: "EAT", supervisor: "Juliana da Cruz Brilhante", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: ENTE" },
    { nome: "Açailandia EAT", area: "EAT", supervisor: "Juliana da Cruz Brilhante", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: IMTE" },
    { nome: "Imbirussu EAT 1", area: "EAT", supervisor: "Fausto Silva de Castro", tst: "Márcio Sérgio Bellan", observacoes: "Regional: BTE" },
    { nome: "Imbirussu EAT 2", area: "EAT", supervisor: "Fausto Silva de Castro", tst: "Márcio Sérgio Bellan", observacoes: "Regional: BTE" },
    { nome: "Santa Luzia EAT", area: "EAT", supervisor: "Fausto Silva de Castro", tst: "Márcio Sérgio Bellan", observacoes: "Regional: BTE" },
    { nome: "Chapadão EAT", area: "EAT", supervisor: "Fausto Silva de Castro", tst: "Márcio Sérgio Bellan", observacoes: "Regional: BTE" },
    { nome: "Anastácio EAT", area: "EAT", supervisor: "Fausto Silva de Castro", tst: "Márcio Sérgio Bellan", observacoes: "Regional: LTC" },
    { nome: "Corumbá EAT", area: "EAT", supervisor: "Fausto Silva de Castro", tst: "Márcio Sérgio Bellan", observacoes: "Regional: LTC" },
    { nome: "Vilhena EAT 01", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Vilhena EAT 02", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Jauru EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Pimenta Bueno EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Ji Paraná EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Ariquemes EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Samuel EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "Acarau II - III EAT", area: "EAT", supervisor: "Carmerino Silvestre de Almeida Junior", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Piripiri EAT", area: "EAT", supervisor: "Carmerino Silvestre de Almeida Junior", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Teresina EAT 1", area: "EAT", supervisor: "Carmerino Silvestre de Almeida Junior", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Teresina EAT 2", area: "EAT", supervisor: "Carmerino Silvestre de Almeida Junior", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Parnaiba EAT", area: "EAT", supervisor: "Carmerino Silvestre de Almeida Junior", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Tiangua EAT", area: "EAT", supervisor: "Carmerino Silvestre de Almeida Junior", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Cachoeira Paulista EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "Felipe dos Santos Alves", observacoes: "Regional: CPTE" },
    { nome: "Tijuco Preto EAT", area: "EAT", supervisor: "Michel Almeida Silva", tst: "Felipe dos Santos Alves", observacoes: "Regional: PTE" },
    { nome: "Juruti EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Jose Luiz Andrade dos Santos", observacoes: "Regional: PATE" },
    { nome: "Oriximiná EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Jose Luiz Andrade dos Santos", observacoes: "Regional: PATE" },
    { nome: "Parinstins EAT", area: "EAT", supervisor: "Eligton Sachi da Silva", tst: "Jose Luiz Andrade dos Santos", observacoes: "Regional: PATE" },
    { nome: "Uberlandia PCC", area: "PCC", supervisor: "Luiz Carlos Massu Filho", tst: "José Henrique Souza Dias", observacoes: "Regional: LTT" },
    { nome: "Teresina PCC", area: "PCC", supervisor: "Rafael Guimaraes Abrao", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE" },
    { nome: "Dias Dávila LT", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "Rander Antonio de Almeida", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE PTE LOT 6" },
    { nome: "Camaçari EAT", area: "EAT", supervisor: "Carmerino Silvestre de Almeida Junior", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE PTE LOT 6" },
    { nome: "Xingó EAT", area: "EAT", supervisor: "Carmerino Silvestre de Almeida Junior", tst: "Ayslan Richard Julio e Silva", observacoes: "Regional: SITE PTE LOT 6" },
    { nome: "Vila do Conde PCC", area: "PCC", supervisor: "Rafael Guimaraes Abrao", tst: "Marlon William Nascimento de Lira", observacoes: "Regional: VCTE" },
    { nome: "Imbirussu PCC", area: "PCC", supervisor: "Claudinei Santana da Rocha Oliveira", tst: "Márcio Sérgio Bellan", observacoes: "Regional: BTE" },
    { nome: "Vilhena PCC", area: "PCC", supervisor: "Claudinei Santana da Rocha Oliveira", tst: "Reginaldo Benedicto de Melo", observacoes: "Regional: JTE" },
    { nome: "UFV 01", area: "UFV", supervisor: "Joao Marcos Alves de Sousa", tst: "João Paulo Ferreira Lira", observacoes: "Regional: UFV" },
    { nome: "UFV 02", area: "UFV", supervisor: "Joao Marcos Alves de Sousa", tst: "João Paulo Ferreira Lira", observacoes: "Regional: UFV" },
    { nome: "UFV 03", area: "UFV", supervisor: "Joao Marcos Alves de Sousa", tst: "João Paulo Ferreira Lira", observacoes: "Regional: UFV" },
    { nome: "UFV 04", area: "UFV", supervisor: "Joao Marcos Alves de Sousa", tst: "João Paulo Ferreira Lira", observacoes: "Regional: UFV" },
    { nome: "UFV 05", area: "UFV", supervisor: "Joao Marcos Alves de Sousa", tst: "João Paulo Ferreira Lira", observacoes: "Regional: UFV" },
    { nome: "UFV 06", area: "UFV", supervisor: "Joao Marcos Alves de Sousa", tst: "João Paulo Ferreira Lira", observacoes: "Regional: UFV" },
  ];

  for (const dados of equipesData) {
    const existente = await prisma.rsEquipe.findFirst({ where: { nome: dados.nome, area: dados.area } });
    if (existente) {
      await prisma.rsEquipe.update({ where: { id: existente.id }, data: dados });
    } else {
      await prisma.rsEquipe.create({ data: dados });
    }
  }
}

module.exports = { seedEdicaoRotaSegura2026 };
