import { useState } from "react";
import { Panel, EmptyState } from "../../../components/ui/Panel";
import { Icon } from "../../../components/ui/IconSprite";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useApiResource } from "../../../hooks/useApiResource";
import { useToast } from "../../../hooks/useToast";
import { apiFetch } from "../../../lib/api";
import { approveButtonClasses, deleteButtonClasses, extractErrorMessage, fieldClasses } from "../../../lib/formClasses";
import { decisaoComiteLabel, decisaoComiteVariant, tipoRevisaoComiteLabel } from "../../../lib/rotaSegura2026";
import type { RsAprAvaliacao, RsDecisaoComite, RsTipoRevisaoComite } from "../../../types/rotaSegura2026";

interface ComiteTabProps {
  edicaoId: string;
  podeDecidir: boolean;
}

interface CampoDecisao {
  tipo: RsTipoRevisaoComite;
  campoComite: "riscosAdicionaisComite" | "medidasAdicionaisComite";
  descricao: string | null;
}

function pendenciasDe(avaliacao: RsAprAvaliacao): CampoDecisao[] {
  const pendencias: CampoDecisao[] = [];
  if (avaliacao.riscosAdicionais && avaliacao.riscosAdicionaisComite === "PENDENTE") {
    pendencias.push({ tipo: "RISCOS_ADICIONAIS", campoComite: "riscosAdicionaisComite", descricao: avaliacao.riscosAdicionaisDescricao });
  }
  if (avaliacao.medidasAdicionais && avaliacao.medidasAdicionaisComite === "PENDENTE") {
    pendencias.push({ tipo: "MEDIDAS_ADICIONAIS", campoComite: "medidasAdicionaisComite", descricao: avaliacao.medidasAdicionaisDescricao });
  }
  return pendencias;
}

export function ComiteTab({ edicaoId, podeDecidir }: ComiteTabProps) {
  const { showToast } = useToast();
  const path = edicaoId ? `/rota-segura/comite/pendentes?edicaoId=${edicaoId}` : "/rota-segura/comite/pendentes";
  const { data, carregando, erro, recarregar } = useApiResource<RsAprAvaliacao[]>(path, "Não foi possível carregar as pendências do comitê.");

  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState<string | null>(null);

  async function handleDecisao(avaliacao: RsAprAvaliacao, tipo: RsTipoRevisaoComite, decisao: RsDecisaoComite) {
    const chave = `${avaliacao.id}-${tipo}`;
    setEnviando(chave);
    try {
      await apiFetch(`/rota-segura/comite/${avaliacao.id}/decisao`, {
        method: "POST",
        body: { tipo, decisao, observacoes: observacoes[chave]?.trim() || null },
      });
      showToast(decisao === "APROVADO" ? "Decisão registrada: aprovado." : "Decisão registrada: reprovado.");
      setObservacoes((current) => ({ ...current, [chave]: "" }));
      await recarregar();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao registrar a decisão do comitê."));
    } finally {
      setEnviando(null);
    }
  }

  if (!edicaoId) {
    return <EmptyState message="Selecione uma edição para consultar as pendências do comitê." />;
  }

  return (
    <Panel
      title="Comitê de avaliação"
      description="Riscos e medidas de controle adicionais propostos nas avaliações de APR, aguardando aprovação do comitê."
    >
      {erro && <p className="text-red">{erro}</p>}
      {carregando ? (
        <p className="text-muted">Carregando pendências...</p>
      ) : !data || data.length === 0 ? (
        <EmptyState message="Nenhuma pendência do comitê no momento." />
      ) : (
        <div className="grid gap-3">
          {data.map((avaliacao) => (
            <article key={avaliacao.id} className="rounded-[8px] border border-line bg-surface-soft p-3.5">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <strong>
                  {avaliacao.equipe?.nome || "-"} · {avaliacao.mesReferencia}
                </strong>
                <small className="text-muted">{[avaliacao.numeroOs, avaliacao.numeroApr].filter(Boolean).join(" / ") || "Sem identificação"}</small>
              </div>

              {pendenciasDe(avaliacao).map(({ tipo, descricao }) => {
                const chave = `${avaliacao.id}-${tipo}`;
                const decisaoAtual = tipo === "RISCOS_ADICIONAIS" ? avaliacao.riscosAdicionaisComite : avaliacao.medidasAdicionaisComite;
                return (
                  <div key={tipo} className="mt-2 border-t border-line pt-2 first:mt-0 first:border-t-0 first:pt-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[0.85rem] font-extrabold">{tipoRevisaoComiteLabel(tipo)}</span>
                      <StatusBadge status={decisaoAtual} label={decisaoComiteLabel(decisaoAtual)} variant={decisaoComiteVariant(decisaoAtual)} />
                    </div>
                    {descricao && <p className="mb-2 text-[0.85rem] text-muted">{descricao}</p>}
                    {podeDecidir && (
                      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-end">
                        <input
                          type="text"
                          maxLength={300}
                          placeholder="Observações da decisão (opcional)"
                          className={`${fieldClasses} w-full sm:min-w-[220px] sm:flex-1`}
                          value={observacoes[chave] || ""}
                          onChange={(e) => setObservacoes((current) => ({ ...current, [chave]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`${approveButtonClasses} flex-1 sm:flex-initial`}
                            disabled={enviando === chave}
                            onClick={() => handleDecisao(avaliacao, tipo, "APROVADO")}
                          >
                            <Icon id="icon-check" />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            className={`${deleteButtonClasses} flex-1 sm:flex-initial`}
                            disabled={enviando === chave}
                            onClick={() => handleDecisao(avaliacao, tipo, "REPROVADO")}
                          >
                            <Icon id="icon-trash" />
                            Reprovar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}
