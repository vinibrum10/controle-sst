import { startOfToday } from "./format";
import type { FrequenciaRota, RotaSegura } from "../types/programas";

export const FREQUENCIA_DIAS: Record<FrequenciaRota, number> = {
  DIARIA: 1,
  SEMANAL: 7,
  QUINZENAL: 15,
  MENSAL: 30,
};

export function verificacaoAtrasada(rota: RotaSegura): boolean {
  if (rota.status !== "ATIVA") return false;
  if (!rota.ultimaVerificacao) return true;
  const proxima = new Date(rota.ultimaVerificacao);
  proxima.setDate(proxima.getDate() + FREQUENCIA_DIAS[rota.frequencia]);
  return proxima < startOfToday();
}
