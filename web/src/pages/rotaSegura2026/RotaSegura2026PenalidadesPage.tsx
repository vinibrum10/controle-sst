import { useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../../components/ui/Panel";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/IconSprite";
import { EdicaoSelector } from "../../components/rotaSegura2026/EdicaoSelector";
import { useCrud } from "../../hooks/useCrud";
import { useEdicoesRotaSegura } from "../../hooks/useEdicoesRotaSegura";
import { usePermissao } from "../../hooks/usePermissao";
import { useQueryCrud } from "../../hooks/useQueryCrud";
import { useToast } from "../../hooks/useToast";
import {
  deleteButtonClasses,
  extractErrorMessage,
  fieldClasses,
  labelClasses,
  selectInlineClasses,
  twoColLayout,
} from "../../lib/formClasses";
import { toDateInputValue } from "../../lib/format";
import { TIPO_INFRACAO_OPTIONS, tipoInfracaoLabel } from "../../lib/rotaSegura2026";
import type { RsColaborador, RsEquipe, RsPenalidade, RsTipoInfracao } from "../../types/rotaSegura2026";

interface PenalidadeFormState {
  mesReferencia: string;
  equipeId: string;
  colaboradorId: string;
  tipo: RsTipoInfracao;
  descricao: string;
  dataOcorrencia: string;
  responsavel: string;
  observacoes: string;
}

function defaultForm(): PenalidadeFormState {
  return {
    mesReferencia: new Date().toISOString().slice(0, 7),
    equipeId: "",
    colaboradorId: "",
    tipo: "LEVE",
    descricao: "",
    dataOcorrencia: toDateInputValue(new Date()),
    responsavel: "",
    observacoes: "",
  };
}

export function RotaSegura2026PenalidadesPage() {
  const { showToast } = useToast();
  const podeLancar = usePermissao("LANCAR_AVALIACAO_ROTA_SEGURA");
  const podeExcluir = usePermissao("EXCLUIR_AVALIACAO_ROTA_SEGURA");

  const { edicoes, edicaoAtiva } = useEdicoesRotaSegura();
  const [edicaoIdSelecionada, setEdicaoIdSelecionada] = useState("");

  const edicaoId = edicaoIdSelecionada || edicaoAtiva?.id || "";

  const { items: equipes } = useCrud<RsEquipe>("/rota-segura/equipes", "Não foi possível carregar as equipes.");
  const { items: colaboradores } = useCrud<RsColaborador>("/rota-segura/colaboradores", "Não foi possível carregar os colaboradores.");

  const [filtroEquipeId, setFiltroEquipeId] = useState("");
  const [filtroMes, setFiltroMes] = useState("");

  const params = new URLSearchParams();
  if (edicaoId) params.set("edicaoId", edicaoId);
  if (filtroEquipeId) params.set("equipeId", filtroEquipeId);
  if (filtroMes) params.set("mes", filtroMes);
  const query = `?${params.toString()}`;

  const { items, carregando, erro, criar, remover } = useQueryCrud<RsPenalidade>(
    "/rota-segura/penalidades",
    query,
    "Não foi possível carregar as penalidades.",
  );

  const [form, setForm] = useState<PenalidadeFormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const colaboradoresDaEquipe = colaboradores.filter((colaborador) => colaborador.equipeId === form.equipeId);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!edicaoId) return;

    if (!form.equipeId) {
      showToast("Selecione a equipe.");
      return;
    }

    const descricao = form.descricao.trim();
    if (!descricao) {
      showToast("Descreva a penalidade.");
      return;
    }

    const payload = {
      edicaoId,
      mesReferencia: form.mesReferencia,
      equipeId: form.equipeId,
      colaboradorId: form.colaboradorId || null,
      tipo: form.tipo,
      descricao,
      dataOcorrencia: form.dataOcorrencia,
      responsavel: form.responsavel.trim() || null,
      observacoes: form.observacoes.trim() || null,
    };

    setSubmitting(true);
    try {
      await criar(payload);
      showToast("Penalidade registrada.");
      setForm((current) => ({ ...defaultForm(), equipeId: current.equipeId }));
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao registrar a penalidade."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir(penalidade: RsPenalidade) {
    if (!window.confirm("Excluir esta penalidade?")) return;

    try {
      await remover(penalidade.id);
      showToast("Penalidade excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir a penalidade."));
    }
  }

  return (
    <div className={twoColLayout}>
      <Panel
        title="Penalidades"
        description="Infrações registradas por equipe/colaborador, com a pontuação de penalidade calculada conforme os critérios da edição."
        headerExtra={
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-end sm:justify-end">
            {edicoes.length > 0 && <EdicaoSelector edicoes={edicoes} value={edicaoId} onChange={setEdicaoIdSelecionada} />}
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
          </div>
        }
      >
        {!edicaoId ? (
          <EmptyState message="Selecione uma edição para consultar as penalidades." />
        ) : erro ? (
          <p className="text-red">{erro}</p>
        ) : carregando ? (
          <p className="text-muted">Carregando penalidades...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma penalidade registrada com os filtros atuais." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Data / Mês</th>
                  <th className="py-2 pr-3">Equipe</th>
                  <th className="py-2 pr-3">Colaborador</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">Pontos</th>
                  <th className="py-2 pr-3">Descrição</th>
                  {podeExcluir && <th className="py-2 pr-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((penalidade) => (
                  <tr key={penalidade.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3">
                      <strong className="block">{toDateInputValue(new Date(penalidade.dataOcorrencia))}</strong>
                      <small className="text-muted">{penalidade.mesReferencia}</small>
                    </td>
                    <td className="py-2 pr-3 text-muted">{penalidade.equipe?.nome || "-"}</td>
                    <td className="py-2 pr-3 text-muted">{penalidade.colaborador?.nome || "-"}</td>
                    <td className="py-2 pr-3 text-muted">{tipoInfracaoLabel(penalidade.tipo)}</td>
                    <td className="py-2 pr-3 font-extrabold text-red">{penalidade.pontos}</td>
                    <td className="py-2 pr-3 text-muted">{penalidade.descricao}</td>
                    {podeExcluir && (
                      <td className="py-2 pr-3">
                        <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(penalidade)}>
                          <Icon id="icon-trash" />
                          Excluir
                        </button>
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
        <Panel title="Nova penalidade" description="Os pontos são calculados automaticamente conforme o critério de penalidade configurado na edição.">
          {!edicaoId || equipes.length === 0 ? (
            <EmptyState message="Selecione uma edição e cadastre equipes antes de registrar penalidades." />
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
                  Data da ocorrência
                  <input
                    type="date"
                    required
                    className={fieldClasses}
                    value={form.dataOcorrencia}
                    onChange={(e) => setForm((current) => ({ ...current, dataOcorrencia: e.target.value }))}
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
                    onChange={(e) => setForm((current) => ({ ...current, equipeId: e.target.value, colaboradorId: "" }))}
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
                  Colaborador (opcional)
                  <select
                    className={fieldClasses}
                    value={form.colaboradorId}
                    onChange={(e) => setForm((current) => ({ ...current, colaboradorId: e.target.value }))}
                  >
                    <option value="">Não identificado</option>
                    {colaboradoresDaEquipe.map((colaborador) => (
                      <option key={colaborador.id} value={colaborador.id}>
                        {colaborador.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={labelClasses}>
                Tipo de infração
                <select
                  className={fieldClasses}
                  value={form.tipo}
                  onChange={(e) => setForm((current) => ({ ...current, tipo: e.target.value as RsTipoInfracao }))}
                >
                  {TIPO_INFRACAO_OPTIONS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipoInfracaoLabel(tipo)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Descrição
                <textarea
                  rows={2}
                  maxLength={500}
                  required
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={form.descricao}
                  onChange={(e) => setForm((current) => ({ ...current, descricao: e.target.value }))}
                />
              </label>

              <label className={labelClasses}>
                Responsável pelo registro
                <input
                  type="text"
                  maxLength={120}
                  className={fieldClasses}
                  value={form.responsavel}
                  onChange={(e) => setForm((current) => ({ ...current, responsavel: e.target.value }))}
                />
              </label>

              <label className={labelClasses}>
                Observações
                <textarea
                  rows={2}
                  maxLength={300}
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={form.observacoes}
                  onChange={(e) => setForm((current) => ({ ...current, observacoes: e.target.value }))}
                />
              </label>

              <Button type="submit" full disabled={submitting}>
                <Icon id="icon-plus" />
                Registrar penalidade
              </Button>
            </form>
          )}
        </Panel>
      )}
    </div>
  );
}
