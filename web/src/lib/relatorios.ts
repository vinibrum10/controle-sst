import { apiFetch } from "./api";
import type { RelatorioData } from "../types/relatorio";

export function obterRelatorio(inicio: string, fim: string) {
  return apiFetch<RelatorioData>(`/relatorios?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`);
}
