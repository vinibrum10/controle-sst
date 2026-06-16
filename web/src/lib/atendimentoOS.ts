import { apiFetch } from "./api";

export interface AtendimentoOS {
  id: string;
  numeroOS: string;
  responsavelId: string | null;
  responsavel: { id: string; nome: string } | null;
  iniciadoEm: string;
  finalizadoEm: string | null;
  duracaoSegundos: number | null;
  criadoEm: string;
}

export function listarAtendimentos(params: { data?: string; responsavelId?: string } = {}) {
  const query = new URLSearchParams();
  if (params.data) query.set("data", params.data);
  if (params.responsavelId) query.set("responsavelId", params.responsavelId);
  const qs = query.toString();
  return apiFetch<AtendimentoOS[]>(`/atendimentos-os${qs ? `?${qs}` : ""}`);
}

export function iniciarAtendimento(numeroOS: string, responsavelId?: string | null) {
  return apiFetch<AtendimentoOS>("/atendimentos-os", {
    method: "POST",
    body: { numeroOS, responsavelId: responsavelId ?? null }
  });
}

export function finalizarAtendimento(id: string) {
  return apiFetch<AtendimentoOS>(`/atendimentos-os/${id}/finalizar`, { method: "PATCH", body: {} });
}

export function excluirAtendimento(id: string) {
  return apiFetch<void>(`/atendimentos-os/${id}`, { method: "DELETE" });
}

export function formatarDuracao(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
