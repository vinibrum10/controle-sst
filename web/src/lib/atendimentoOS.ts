import { apiFetch } from "./api";

export interface AtendimentoOS {
  id: string;
  numeroOS: string;
  solicitante: string | null;
  responsavelId: string | null;
  responsavel: { id: string; nome: string } | null;
  criadoPorId: string | null;
  iniciadoEm: string;
  finalizadoEm: string | null;
  duracaoSegundos: number | null;
  criadoEm: string;
}

export function listarAtendimentos(
  params: { semana?: string; data?: string; responsavelId?: string; criadoPorId?: string; ativos?: boolean } = {}
) {
  const query = new URLSearchParams();
  if (params.semana) query.set("semana", params.semana);
  else if (params.data) query.set("data", params.data);
  if (params.criadoPorId) query.set("criadoPorId", params.criadoPorId);
  else if (params.responsavelId) query.set("responsavelId", params.responsavelId);
  if (params.ativos) query.set("ativos", "true");
  const qs = query.toString();
  return apiFetch<AtendimentoOS[]>(`/atendimentos-os${qs ? `?${qs}` : ""}`);
}

export function iniciarAtendimento(numeroOS: string, solicitante: string, responsavelFuncId?: string) {
  return apiFetch<AtendimentoOS>("/atendimentos-os", {
    method: "POST",
    body: { numeroOS, solicitante, ...(responsavelFuncId ? { responsavelFuncId } : {}) }
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

/** Retorna true se o momento atual está dentro do período de pausa (Sex 17h → Seg 00h). */
export function isPausadaFimDeSemana(): boolean {
  const now = new Date();
  const dia = now.getDay(); // 0=Dom, 1=Seg, ..., 5=Sex, 6=Sab
  if (dia === 0 || dia === 6) return true;
  if (dia === 5 && now.getHours() >= 17) return true;
  return false;
}
