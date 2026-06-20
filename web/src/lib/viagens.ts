import { apiFetch } from "./api";

export interface Viagem {
  id: string;
  tecnicoId: string | null;
  tecnico: { id: string; nome: string } | null;
  criadoPorId: string | null;
  origem: string;
  destino: string;
  motivo: string;
  iniciadoEm: string;
  finalizadoEm: string | null;
  duracaoSegundos: number | null;
  criadoEm: string;
}

export function listarViagens(
  params: { semana?: string; data?: string; tecnicoId?: string; criadoPorId?: string; ativos?: boolean } = {}
) {
  const query = new URLSearchParams();
  if (params.semana) query.set("semana", params.semana);
  else if (params.data) query.set("data", params.data);
  if (params.criadoPorId) query.set("criadoPorId", params.criadoPorId);
  else if (params.tecnicoId) query.set("tecnicoId", params.tecnicoId);
  if (params.ativos) query.set("ativos", "true");
  const qs = query.toString();
  return apiFetch<Viagem[]>(`/viagens${qs ? `?${qs}` : ""}`);
}

export function iniciarViagem(dados: {
  origem: string;
  destino: string;
  motivo: string;
  tecnicoFuncId?: string;
}) {
  return apiFetch<Viagem>("/viagens", { method: "POST", body: dados });
}

export function finalizarViagem(id: string) {
  return apiFetch<Viagem>(`/viagens/${id}/finalizar`, { method: "PATCH", body: {} });
}

export function excluirViagem(id: string) {
  return apiFetch<void>(`/viagens/${id}`, { method: "DELETE" });
}
