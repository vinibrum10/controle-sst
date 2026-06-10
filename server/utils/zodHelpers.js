const { z } = require("zod");

const dataValida = (value) => !Number.isNaN(new Date(value).getTime());

// Campo de data obrigatorio (string ISO) convertido para Date.
const dataField = (mensagem = "Informe uma data valida.") =>
  z.string().refine(dataValida, mensagem).transform((value) => new Date(value));

// Campo de data opcional/anulavel convertido para Date.
const dataOpcional = (mensagem = "Informe uma data valida.") =>
  z.string().refine(dataValida, mensagem).transform((value) => new Date(value)).nullable().optional();

module.exports = { dataValida, dataField, dataOpcional };
