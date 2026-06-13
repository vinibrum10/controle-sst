import { useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../../../components/ui/Panel";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/IconSprite";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useToast } from "../../../hooks/useToast";
import { apiFetch } from "../../../lib/api";
import { extractErrorMessage, fieldClasses, labelClasses, deleteButtonClasses, editButtonClasses, twoColLayout } from "../../../lib/formClasses";
import { formatDate, toDateInputValue } from "../../../lib/format";
import type { RsEdicaoPrograma } from "../../../types/rotaSegura2026";

interface EdicoesTabProps {
  edicoes: RsEdicaoPrograma[];
  carregando: boolean;
  erro: string | null;
  criar: (dados: Record<string, unknown>) => Promise<RsEdicaoPrograma>;
  atualizar: (id: string, dados: Record<string, unknown>) => Promise<RsEdicaoPrograma>;
  remover: (id: string) => Promise<void>;
}

interface EdicaoFormState {
  nome: string;
  ano: number;
  slogan: string;
  objetivo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  observacoes: string;
}

function defaultForm(): EdicaoFormState {
  const anoAtual = new Date().getFullYear();
  return { nome: "", ano: anoAtual + 1, slogan: "", objetivo: "", descricao: "", dataInicio: "", dataFim: "", ativo: false, observacoes: "" };
}

function toForm(edicao: RsEdicaoPrograma): EdicaoFormState {
  return {
    nome: edicao.nome,
    ano: edicao.ano,
    slogan: edicao.slogan || "",
    objetivo: edicao.objetivo || "",
    descricao: edicao.descricao || "",
    dataInicio: edicao.dataInicio ? toDateInputValue(new Date(edicao.dataInicio)) : "",
    dataFim: edicao.dataFim ? toDateInputValue(new Date(edicao.dataFim)) : "",
    ativo: edicao.ativo,
    observacoes: edicao.observacoes || "",
  };
}

export function EdicoesTab({ edicoes, carregando, erro, criar, atualizar, remover }: EdicoesTabProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<EdicaoFormState>(defaultForm);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cloneTarget, setCloneTarget] = useState<RsEdicaoPrograma | null>(null);
  const [cloneForm, setCloneForm] = useState({ nome: "", ano: new Date().getFullYear() + 1 });
  const [cloning, setCloning] = useState(false);

  function iniciarEdicao(edicao: RsEdicaoPrograma) {
    setEditandoId(edicao.id);
    setForm(toForm(edicao));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(defaultForm());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nome = form.nome.trim();
    if (!nome) {
      showToast("Informe o nome da edição.");
      return;
    }

    const payload = {
      nome,
      ano: Number(form.ano),
      slogan: form.slogan.trim() || null,
      objetivo: form.objetivo.trim() || null,
      descricao: form.descricao.trim() || null,
      dataInicio: form.dataInicio || null,
      dataFim: form.dataFim || null,
      ativo: form.ativo,
      observacoes: form.observacoes.trim() || null,
    };

    setSubmitting(true);
    try {
      if (editandoId) {
        await atualizar(editandoId, payload);
        showToast("Edição atualizada.");
      } else {
        await criar(payload);
        showToast("Edição cadastrada.");
      }
      cancelarEdicao();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao salvar a edição."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir(edicao: RsEdicaoPrograma) {
    if (!window.confirm(`Excluir a edição "${edicao.nome}" (${edicao.ano})? Critérios, regras e premiação também serão removidos.`)) return;

    try {
      await remover(edicao.id);
      if (editandoId === edicao.id) cancelarEdicao();
      showToast("Edição excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir a edição."));
    }
  }

  function abrirClonagem(edicao: RsEdicaoPrograma) {
    setCloneTarget(edicao);
    setCloneForm({ nome: `Rota Segura ${edicao.ano + 1}`, ano: edicao.ano + 1 });
  }

  async function handleClonar(event: FormEvent) {
    event.preventDefault();
    if (!cloneTarget) return;

    const nome = cloneForm.nome.trim();
    if (!nome) {
      showToast("Informe o nome da nova edição.");
      return;
    }

    setCloning(true);
    try {
      await apiFetch(`/rota-segura/edicoes/${cloneTarget.id}/clonar`, {
        method: "POST",
        body: { nome, ano: Number(cloneForm.ano) },
      });
      showToast(`Edição "${nome}" criada a partir de ${cloneTarget.nome}. Proposta, critérios, regras e premiação foram copiados.`);
      setCloneTarget(null);
      window.location.reload();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao clonar a edição."));
    } finally {
      setCloning(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className={twoColLayout}>
        <Panel
          title="Edições do programa"
          description="Cada edição anual tem sua própria proposta, critérios, regras condicionais e premiação."
        >
          {erro && <p className="text-red">{erro}</p>}
          {carregando ? (
            <p className="text-muted">Carregando edições...</p>
          ) : edicoes.length === 0 ? (
            <EmptyState message="Nenhuma edição cadastrada ainda." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Edição</th>
                    <th className="py-2 pr-3">Período</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Configuração</th>
                    <th className="py-2 pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {edicoes.map((edicao) => (
                    <tr key={edicao.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3">
                        <strong className="block">
                          {edicao.nome} ({edicao.ano})
                        </strong>
                        {edicao.slogan && <small className="text-muted">{edicao.slogan}</small>}
                      </td>
                      <td className="py-2 pr-3 text-muted">
                        {formatDate(edicao.dataInicio)} - {formatDate(edicao.dataFim)}
                      </td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={edicao.ativo ? "ATIVA" : "INATIVA"} />
                      </td>
                      <td className="py-2 pr-3 text-muted">
                        {edicao._count
                          ? `${edicao._count.criterios} critérios · ${edicao._count.regras} regras · ${edicao._count.premiacoes} premiações`
                          : "-"}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" className={editButtonClasses} onClick={() => iniciarEdicao(edicao)}>
                            <Icon id="icon-check" />
                            Editar
                          </button>
                          <button type="button" className={editButtonClasses} onClick={() => abrirClonagem(edicao)}>
                            <Icon id="icon-upload" />
                            Clonar
                          </button>
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(edicao)}>
                            <Icon id="icon-trash" />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title={editandoId ? "Editar edição" : "Nova edição"}
          description="Nome, ano, período de vigência e status (ativa/inativa)."
        >
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className={labelClasses}>
              Nome
              <input
                type="text"
                maxLength={120}
                placeholder="Ex.: Rota Segura 2027"
                required
                className={fieldClasses}
                value={form.nome}
                onChange={(e) => setForm((current) => ({ ...current, nome: e.target.value }))}
              />
            </label>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className={labelClasses}>
                Ano
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  required
                  className={fieldClasses}
                  value={form.ano}
                  onChange={(e) => setForm((current) => ({ ...current, ano: Number(e.target.value) }))}
                />
              </label>
              <label className={labelClasses}>
                Slogan
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Ex.: O básico bem feito"
                  className={fieldClasses}
                  value={form.slogan}
                  onChange={(e) => setForm((current) => ({ ...current, slogan: e.target.value }))}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className={labelClasses}>
                Início
                <input
                  type="date"
                  className={fieldClasses}
                  value={form.dataInicio}
                  onChange={(e) => setForm((current) => ({ ...current, dataInicio: e.target.value }))}
                />
              </label>
              <label className={labelClasses}>
                Fim
                <input
                  type="date"
                  className={fieldClasses}
                  value={form.dataFim}
                  onChange={(e) => setForm((current) => ({ ...current, dataFim: e.target.value }))}
                />
              </label>
            </div>

            <label className={labelClasses}>
              Objetivo
              <textarea
                rows={2}
                maxLength={500}
                className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                value={form.objetivo}
                onChange={(e) => setForm((current) => ({ ...current, objetivo: e.target.value }))}
              />
            </label>

            <label className={labelClasses}>
              Descrição
              <textarea
                rows={3}
                maxLength={1000}
                className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                value={form.descricao}
                onChange={(e) => setForm((current) => ({ ...current, descricao: e.target.value }))}
              />
            </label>

            <label className="flex items-center gap-2 text-[0.85rem] font-bold text-text">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm((current) => ({ ...current, ativo: e.target.checked }))}
              />
              Edição ativa (usada por padrão no dashboard, avaliações e ranking)
            </label>

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
                {editandoId ? "Salvar alterações" : "Cadastrar edição"}
              </Button>
              {editandoId && (
                <Button type="button" variant="secondary" onClick={cancelarEdicao}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Panel>
      </div>

      {cloneTarget && (
        <Panel
          title={`Clonar edição "${cloneTarget.nome}"`}
          description="Cria uma nova edição copiando proposta, critérios, regras condicionais e premiação. Avaliações, pontuações, penalidades e histórico do comitê não são copiados."
        >
          <form className="grid grid-cols-1 gap-2.5 sm:grid-cols-[2fr_1fr_auto_auto] sm:items-end" onSubmit={handleClonar}>
            <label className={labelClasses}>
              Nome da nova edição
              <input
                type="text"
                maxLength={120}
                required
                className={fieldClasses}
                value={cloneForm.nome}
                onChange={(e) => setCloneForm((current) => ({ ...current, nome: e.target.value }))}
              />
            </label>
            <label className={labelClasses}>
              Ano
              <input
                type="number"
                min={2000}
                max={2100}
                required
                className={fieldClasses}
                value={cloneForm.ano}
                onChange={(e) => setCloneForm((current) => ({ ...current, ano: Number(e.target.value) }))}
              />
            </label>
            <Button type="submit" disabled={cloning}>
              <Icon id="icon-upload" />
              Clonar
            </Button>
            <Button type="button" variant="secondary" onClick={() => setCloneTarget(null)}>
              Cancelar
            </Button>
          </form>
        </Panel>
      )}
    </div>
  );
}
