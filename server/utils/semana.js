const prisma = require("../db");

// Calcula o codigo de semana ISO ("2026-W24") e o intervalo de datas a
// partir de uma data qualquer dentro da semana.
function semanaInfoFromDate(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // quinta-feira da semana ISO
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const numero = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  const ano = d.getUTCFullYear();
  const codigo = `${ano}-W${String(numero).padStart(2, "0")}`;

  const segunda = new Date(d);
  segunda.setUTCDate(d.getUTCDate() - 3); // segunda-feira da semana ISO
  const domingo = new Date(segunda);
  domingo.setUTCDate(segunda.getUTCDate() + 6);

  return { codigo, ano, numero, dataInicio: segunda, dataFim: domingo };
}

// Converte um codigo "2026-W24" no intervalo de datas correspondente.
function semanaInfoFromCodigo(codigo) {
  const match = /^(\d{4})-W(\d{2})$/.exec(codigo);
  if (!match) return null;
  const ano = Number(match[1]);
  const numero = Number(match[2]);

  const simple = new Date(Date.UTC(ano, 0, 1 + (numero - 1) * 7));
  const dayOfWeek = simple.getUTCDay() || 7;
  const segunda = new Date(simple);
  if (dayOfWeek <= 4) {
    segunda.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
  } else {
    segunda.setUTCDate(simple.getUTCDate() + 8 - dayOfWeek);
  }
  const domingo = new Date(segunda);
  domingo.setUTCDate(segunda.getUTCDate() + 6);

  return { codigo, ano, numero, dataInicio: segunda, dataFim: domingo };
}

// Busca (ou cria) o registro de Semana para um codigo "AAAA-Www".
async function findOrCreateSemana(codigo) {
  if (!codigo) return null;

  const existente = await prisma.semana.findUnique({ where: { codigo } });
  if (existente) return existente;

  const info = semanaInfoFromCodigo(codigo);
  if (!info) return null;

  return prisma.semana.create({ data: info });
}

module.exports = { semanaInfoFromDate, semanaInfoFromCodigo, findOrCreateSemana };
