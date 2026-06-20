/**
 * Utilitários para campos temporais (weekKey, monthKey, ano).
 * Usa lógica ISO week idêntica a semana.js para consistência.
 */

function weekKeyFromDate(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const numero = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(numero).padStart(2, "0")}`;
}

function monthKeyFromDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function yearFromDate(date) {
  return date.getUTCFullYear();
}

function temporalFields(date) {
  return {
    weekKey: weekKeyFromDate(date),
    monthKey: monthKeyFromDate(date),
    ano: yearFromDate(date)
  };
}

module.exports = { weekKeyFromDate, monthKeyFromDate, yearFromDate, temporalFields };
