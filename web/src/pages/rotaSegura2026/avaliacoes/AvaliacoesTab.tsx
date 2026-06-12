import { useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../../../components/ui/Panel";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/IconSprite";
import { useQueryCrud } from "../../../hooks/useQueryCrud";
import { useToast } from "../../../hooks/useToast";
import {
  deleteButtonClasses,
  editButtonClasses,
  extractErrorMessage,
  fieldClasses,
  labelClasses,
  selectInlineClasses,
  twoColLayout,
} from "../../../lib/formClasses";
import { mesAtualReferencia, TIPO_APR_OPTIONS, tipoAprLabel } from "../../../lib/rotaSegura2026";
import { toDateInputValue } from "../../../lib/format";
import type { Papel } from "../../../types";
import type { RsAprAvaliacao, RsEquipe, RsTipoApr } from "../../../types/rotaSegura2026";

interface AvaliacoesTabProps {
  edicaoId: string;
  equipes: RsEquipe[];
  podeLancar: boolean;
  papel?: Papel | null;
}

interface AvaliacaoFormState {
  mesReferencia: string;
  dataAvaliacao: string;
  equipeId: string;
  tipo: RsTipoApr;
  numeroOs: string;
  numeroApr: string;
  atividade: string;
  local: string;
  avaliador: string;
  observacoes: string;
  cabecalhoOk: boolean;
  enderecoOk: boolean;
  assinaturasOk: boolean;
  riscosMinimosOk: boolean;
  medidasMinimasOk: boolean;
  coerenciaOk: boolean;
  arquivadaEam: boolean;
  legivel: boolean;
  aprovacaoBasica: boolean;
  riscosAdicionais: boolean;
  riscosAdicionaisDescricao: string;
  medidasAdicionais: boolean;
  medidasAdicionaisDescricao: string;
}

const CHECKLIST_ITEMS: { key: keyof AvaliacaoFormState; label: string }[] = [
  { key: "cabecalhoOk", label: "Cabeçalho preenchido" },
  { key: "enderecoOk", label: "Endereço/local correto" },
  { key: "assinaturasOk", label: "Assinaturas completas" },
  { key: "riscosMinimosOk", label: "Riscos mínimos identificados" },
  { key: "medidasMinimasOk", label: "Medidas mínimas de controle" },
  { key: "coerenciaOk", label: "Coerência com a atividade" },
  { key: "arquivadaEam", label: "Arquivada no EAM" },
  { key: "legivel", label: "Legível" },
  { key: "aprovacaoBasica", label: "Aprovação básica (sem erros)" },
];

function defaultForm(): AvaliacaoFormState {
  return {
    mesReferencia: mesAtualReferencia(),
    dataAvaliacao: toDateInputValue(new Date()),
    equipeId: "",
    tipo: "AMOSTRAL",
    numeroOs: "",
    numeroApr: "",
    atividade: "",
    local: "",
    avaliador: "",
    observacoes: "",
    cabecalhoOk: false,
    enderecoOk: false,
    assinaturasOk: false,
    riscosMinimosOk: false,
    medidasMinimasOk: false,
    coerenciaOk: false,
    arquivadaEam: false,
    legivel: false,
    aprovacaoBasica: false,
    riscosAdicionais: false,
    riscosAdicionaisDescricao: "",
    medidasAdicionais: false,
    medidasAdicionaisDescricao: "",
  };
}

function toForm(avaliacao: RsAprAvaliacao): AvaliacaoFormState {
  return {
    mesReferencia: avaliacao.mesReferencia,
    dataAvaliacao: toDateInputValue(new Date(avaliacao.dataAvaliacao)),
    equipeId: avaliacao.equipeId,
    tipo: avaliacao.tipo,
    numeroOs: avaliacao.numeroOs || "",
    numeroApr: avaliacao.numeroApr || "",
    atividade: avaliacao.atividade || "",
    local: avaliacao.local || "",
    avaliador: avaliacao.avaliador || "",
    observacoes: avaliacao.observacoes || "",
    cabecalhoOk: avaliacao.cabecalhoOk,
    enderecoOk: avaliacao.enderecoOk,
    assinaturasOk: avaliacao.assinaturasOk,
    riscosMinimosOk: avaliacao.riscosMinimosOk,
    medidasMinimasOk: avaliacao.medidasMinimasOk,
    coerenciaOk: avaliacao.coerenciaOk,
    arquivadaEam: avaliacao.arquivadaEam,
    legivel: avaliacao.legivel,
    aprovacaoBasica: avaliacao.aprovacaoBasica,
    riscosAdicionais: avaliacao.riscosAdicionais,
    riscosAdicionaisDescricao: avaliacao.riscosAdicionaisDescricao || "",
    medidasAdicionais: avaliacao.medidasAdicionais,
    medidasAdicionaisDescricao: avaliacao.medidasAdicionaisDescricao || "",
  };
}

export function AvaliacoesTab({ edicaoId, equipes, podeLancar, papel }: AvaliacoesTabProps) {
  const { showToast } = useToast();

  const [filtroEquipeId, setFiltroEquipeId] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const params = new URLSearchParams();
  if (edicaoId) params.set("edicaoId", edicaoId);
  if (filtroEquipeId) params.set("equipeId", filtroEquipeId);
  if (filtroMes) params.set("mes", filtroMes);
  if (filtroTipo) params.set("tipo", filtroTipo);
  const query = `?${params.toString()}`;

  const { items, carregando, erro, criar, atualizar, remover } = useQueryCrud<RsAprAvaliacao>(
    "/rota-segura/avaliacoes",
    query,
    "Não foi possível carregar as avaliações.",
  );

  const [form, setForm] = useState<AvaliacaoFormState>(defaultForm);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function podeEditarAvaliacao(avaliacao: RsAprAvaliacao): boolean {
    if (!podeLancar) return false;
    if (avaliacao.tipo === "AMOSTRAL" && papel !== "ADMIN") return false;
    return true;
  }

  function iniciarEdicao(avaliacao: RsAprAvaliacao) {
    setEditandoId(avaliacao.id);
    setForm(toForm(avaliacao));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(defaultForm());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!edicaoId) return;

    if (!form.equipeId) {
      showToast("Selecione a equipe.");
      return;
    }

    const payload = {
      edicaoId,
      mesReferencia: form.mesReferencia,
      dataAvaliacao: form.dataAvaliacao,
      equipeId: form.equipeId,
      tipo: form.tipo,
      numeroOs: form.numeroOs.trim() || null,
      numeroApr: form.numeroApr.trim() || null,
      atividade: form.atividade.trim() || null,
      local: form.local.trim() || null,
      avaliador: form.avaliador.trim() || null,
      observacoes: form.observacoes.trim() || null,
      cabecalhoOk: form.cabecalhoOk,
      enderecoOk: form.enderecoOk,
      assinaturasOk: form.assinaturasOk,
      riscosMinimosOk: form.riscosMinimosOk,
      medidasMinimasOk: form.medidasMinimasOk,
      coerenciaOk: form.coerenciaOk,
      arquivadaEam: form.arquivadaEam,
      legivel: form.legivel,
      aprovacaoBasica: form.aprovacaoBasica,
      riscosAdicionais: form.riscosAdicionais,
      riscosAdicionaisDescricao: form.riscosAdicionaisDescricao.trim() || null,
      medidasAdicionais: form.medidasAdicionais,
      medidasAdicionaisDescricao: form.medidasAdicionaisDescricao.trim() || null,
    };

    setSubmitting(true);
    try {
      if (editandoId) {
        await atualizar(editandoId, payload);
        showToast("Avaliação atualizada.");
      } else {
        await criar(payload);
        showToast("Avaliação registrada.");
      }
      cancelarEdicao();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao salvar a avaliação."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir(avaliacao: RsAprAvaliacao) {
    if (!window.confirm("Excluir esta avaliação de APR?")) return;

    try {
      await remover(avaliacao.id);
      if (editandoId === avaliacao.id) cancelarEdicao();
      showToast("Avaliação excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir a avaliação."));
    }
  }

  if (!edicaoId) {
    return <EmptyState message="Selecione uma edição para lançar e consultar avaliações de APR." />;
  }

  return (
    <div className={twoColLayout}>
      <Panel
        title="Avaliações de APR"
        description="Avaliações lançadas para a edição selecionada, com a pontuação calculada conforme os critérios configurados."
        headerExtra={
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-end sm:justify-end">
            <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
              Equipe
              <select className={`${selectInlineClasses} w-full sm:min-w-[160px]`} value={filtroEquipeId} onChange={(e) => setFiltroEquipeId(e.target.value)}>
                <option value="">Todas</option>
                {equipes.map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
              Mês
              <input type="month" className={`${selectInlineClasses} w-full sm:min-w-[140px]`} value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} />
            </label>
            <label className="grid gap-1.5 text-[0.82rem] font-bold text-muted">
              Tipo
              <select className={`${selectInlineClasses} w-full sm:min-w-[140px]`} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="">Todos</option>
                {TIPO_APR_OPTIONS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipoAprLabel(tipo)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="text-muted">Carregando avaliações...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma avaliação de APR lançada com os filtros atuais." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Mês / Data</th>
                  <th className="py-2 pr-3">Equipe</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">OS / APR</th>
                  <th className="py-2 pr-3">Pontuação</th>
                  {podeLancar && <th className="py-2 pr-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((avaliacao) => (
                  <tr key={avaliacao.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3">
                      <strong className="block">{avaliacao.mesReferencia}</strong>
                      <small className="text-muted">{toDateInputValue(new Date(avaliacao.dataAvaliacao))}</small>
                    </td>
                    <td className="py-2 pr-3 text-muted">{avaliacao.equipe?.nome || "-"}</td>
                    <td className="py-2 pr-3 text-muted">{tipoAprLabel(avaliacao.tipo)}</td>
                    <td className="py-2 pr-3 text-muted">{[avaliacao.numeroOs, avaliacao.numeroApr].filter(Boolean).join(" / ") || "-"}</td>
                    <td className="py-2 pr-3 font-extrabold">{avaliacao.pontuacao > 0 ? `+${avaliacao.pontuacao}` : avaliacao.pontuacao}</td>
                    {podeLancar && (
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          {podeEditarAvaliacao(avaliacao) && (
                            <button type="button" className={editButtonClasses} onClick={() => iniciarEdicao(avaliacao)}>
                              <Icon id="icon-check" />
                              Editar
                            </button>
                          )}
                          {papel === "ADMIN" && (
                            <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(avaliacao)}>
                              <Icon id="icon-trash" />
                              Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {podeLancar && (
        <Panel
          title={editandoId ? "Editar avaliação" : "Nova avaliação"}
          description="Preencha o checklist da APR avaliada. A pontuação é calculada automaticamente a partir dos critérios da edição."
        >
          {equipes.length === 0 ? (
            <EmptyState message="Cadastre equipes antes de lançar avaliações." />
          ) : (
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Mês de referência
                  <input
                    type="month"
                    required
                    className={fieldClasses}
                    value={form.mesReferencia}
                    onChange={(e) => setForm((current) => ({ ...current, mesReferencia: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Data da avaliação
                  <input
                    type="date"
                    required
                    className={fieldClasses}
                    value={form.dataAvaliacao}
                    onChange={(e) => setForm((current) => ({ ...current, dataAvaliacao: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Equipe
                  <select
                    required
                    className={fieldClasses}
                    value={form.equipeId}
                    onChange={(e) => setForm((current) => ({ ...current, equipeId: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {equipes.map((equipe) => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClasses}>
                  Tipo de APR
                  <select
                    className={fieldClasses}
                    value={form.tipo}
                    onChange={(e) => setForm((current) => ({ ...current, tipo: e.target.value as RsTipoApr }))}
                  >
                    {TIPO_APR_OPTIONS.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipoAprLabel(tipo)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Número da OS
                  <input
                    type="text"
                    maxLength={60}
                    className={fieldClasses}
                    value={form.numeroOs}
                    onChange={(e) => setForm((current) => ({ ...current, numeroOs: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Número da APR
                  <input
                    type="text"
                    maxLength={60}
                    className={fieldClasses}
                    value={form.numeroApr}
                    onChange={(e) => setForm((current) => ({ ...current, numeroApr: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Atividade
                  <input
                    type="text"
                    maxLength={160}
                    className={fieldClasses}
                    value={form.atividade}
                    onChange={(e) => setForm((current) => ({ ...current, atividade: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Local
                  <input
                    type="text"
                    maxLength={160}
                    className={fieldClasses}
                    value={form.local}
                    onChange={(e) => setForm((current) => ({ ...current, local: e.target.value }))}
                  />
                </label>
              </div>

              <label className={labelClasses}>
                Avaliador
                <input
                  type="text"
                  maxLength={120}
                  className={fieldClasses}
                  value={form.avaliador}
                  onChange={(e) => setForm((current) => ({ ...current, avaliador: e.target.value }))}
                />
              </label>

              <div className="grid grid-cols-1 gap-2 text-[0.85rem] font-bold text-text sm:grid-cols-2">
                {CHECKLIST_ITEMS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.checked }))}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <label className="flex items-center gap-2 text-[0.85rem] font-bold text-text">
                <input
                  type="checkbox"
                  checked={form.riscosAdicionais}
                  onChange={(e) => setForm((current) => ({ ...current, riscosAdicionais: e.target.checked }))}
                />
                Identificados riscos adicionais (sujeito à aprovação do comitê)
              </label>
              {form.riscosAdicionais && (
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Descreva os riscos adicionais identificados."
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={form.riscosAdicionaisDescricao}
                  onChange={(e) => setForm((current) => ({ ...current, riscosAdicionaisDescricao: e.target.value }))}
                />
              )}

              <label className="flex items-center gap-2 text-[0.85rem] font-bold text-text">
                <input
                  type="checkbox"
                  checked={form.medidasAdicionais}
                  onChange={(e) => setForm((current) => ({ ...current, medidasAdicionais: e.target.checked }))}
                />
                Propostas medidas de controle adicionais (sujeito à aprovação do comitê)
              </label>
              {form.medidasAdicionais && (
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Descreva as medidas de controle adicionais propostas."
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={form.medidasAdicionaisDescricao}
                  onChange={(e) => setForm((current) => ({ ...current, medidasAdicionaisDescricao: e.target.value }))}
                />
              )}

              <label className={labelClasses}>
                Observações
                <textarea
                  rows={2}
                  maxLength={500}
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={form.observacoes}
                  onChange={(e) => setForm((current) => ({ ...current, observacoes: e.target.value }))}
                />
              </label>

              <div className="flex gap-2">
                <Button type="submit" full disabled={submitting}>
                  <Icon id={editandoId ? "icon-check" : "icon-plus"} />
                  {editandoId ? "Salvar alterações" : "Registrar avaliação"}
                </Button>
                {editandoId && (
                  <Button type="button" variant="secondary" onClick={cancelarEdicao}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          )}
        </Panel>
      )}
    </div>
  );
}
