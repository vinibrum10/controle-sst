const MS_DIA = 24 * 3600 * 1000;
const MS_17H = 17 * 3600 * 1000;

/**
 * Calcula duração em segundos excluindo o intervalo de pausa de fim de semana:
 * sexta-feira às 17:00 → segunda-feira às 00:00.
 */
function calcularDuracaoUtil(inicioMs, fimMs) {
  if (fimMs <= inicioMs) return 0;

  let total = fimMs - inicioMs;

  const cursor = new Date(inicioMs);
  cursor.setHours(0, 0, 0, 0);

  while (cursor.getTime() < fimMs) {
    if (cursor.getDay() === 5) { // sexta-feira
      const sexPausa = cursor.getTime() + MS_17H;     // Sex 17:00
      const segRetorno = cursor.getTime() + 3 * MS_DIA; // Seg 00:00

      const pausaInicio = Math.max(sexPausa, inicioMs);
      const pausaFim = Math.min(segRetorno, fimMs);

      if (pausaFim > pausaInicio) {
        total -= (pausaFim - pausaInicio);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return Math.max(0, Math.round(total / 1000));
}

module.exports = { calcularDuracaoUtil };
