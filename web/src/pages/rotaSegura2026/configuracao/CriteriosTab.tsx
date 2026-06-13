import { useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../../../components/ui/Panel";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/IconSprite";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useQueryCrud } from "../../../hooks/useQueryCrud";
import { useToast } from "../../../hooks/useToast";
import {
  deleteButtonClasses,
  editButtonClasses,
  extractErrorMessage,
  fieldClasses,
  labelClasses,
  twoColLayout,
} from "../../../lib/formClasses";
import { CATEGORIA_CRITERIO_OPTIONS, TIPO_CRITERIO_OPTIONS, categoriaCriterioLabel, tipoCriterioLabel } from "../../../lib/rotaSegura2026";
import type { RsCategoriaCriterio, RsCriterio, RsTipoCriterio } from "../../../types/rotaSegura2026";

interface CriteriosTabProps {
  edicaoId: string;
  edicaoNome: string;
  podeEditar: boolean;
}

interface CriterioFormState {
  codigo: string;
  nome: string;
  descricao: string;
  tipo: RsTipoCriterio;
  pontuacao: number;
  categoria: RsCategoriaCriterio;
  exigeComite: boolean;
  exigeEvidencia: boolean;
  aplicaAmostral: boolean;
  aplicaForms: boolean;
  ativo: boolean;
  ordem: number;
}

function defaultForm(): CriterioFormState {
  return {
    codigo: "",
    nome: "",
    descricao: "",
    tipo: "PROATIVO",
    pontuacao: 1,
    categoria: "OUTRO",
    exigeComite: false,
    exigeEvidencia: false,
    aplicaAmostral: true,
    aplicaForms: true,
    ativo: true,
    ordem: 0,
  };
}

function toForm(criterio: RsCriterio): CriterioFormState {
  return {
    codigo: criterio.codigo || "",
    nome: criterio.nome,
    descricao: criterio.descricao || "",
    tipo: criterio.tipo,
    pontuacao: criterio.pontuacao,
    categoria: criterio.categoria,
    exigeComite: criterio.exigeComite,
    exigeEvidencia: criterio.exigeEvidencia,
    aplicaAmostral: criterio.aplicaAmostral,
    aplicaForms: criterio.aplicaForms,
    ativo: criterio.ativo,
    ordem: criterio.ordem,
  };
}

export function CriteriosTab({ edicaoId, edicaoNome, podeEditar }: CriteriosTabProps) {
  const { showToast } = useToast();
  const { items, carregando, erro, criar, atualizar, remover } = useQueryCrud<RsCriterio>(
    "/rota-segura/criterios",
    edicaoId ? `?edicaoId=${edicaoId}` : "",
    "Não foi possível carregar os critérios.",
  );

  const [form, setForm] = useState<CriterioFormState>(defaultForm);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function iniciarEdicao(criterio: RsCriterio) {
    setEditandoId(criterio.id);
    setForm(toForm(criterio));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(defaultForm());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!edicaoId) return;

    const nome = form.nome.trim();
    if (!nome) {
      showToast("Informe o nome do critério.");
      return;
    }

    const payload = {
      edicaoId,
      codigo: form.codigo.trim() || null,
      nome,
      descricao: form.descricao.trim() || null,
      tipo: form.tipo,
      pontuacao: Number(form.pontuacao),
      categoria: form.categoria,
      exigeComite: form.exigeComite,
      exigeEvidencia: form.exigeEvidencia,
      aplicaAmostral: form.aplicaAmostral,
      aplicaForms: form.aplicaForms,
      ativo: form.ativo,
      ordem: Number(form.ordem),
    };

    setSubmitting(true);
    try {
      if (editandoId) {
        await atualizar(editandoId, payload);
        showToast("Critério atualizado.");
      } else {
        await criar(payload);
        showToast("Critério cadastrado.");
      }
      cancelarEdicao();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao salvar o critério."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir(criterio: RsCriterio) {
    if (!window.confirm(`Excluir o critério "${criterio.nome}"?`)) return;

    try {
      await remover(criterio.id);
      if (editandoId === criterio.id) cancelarEdicao();
      showToast("Critério excluído.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir o critério."));
    }
  }

  if (!edicaoId) {
    return <EmptyState message="Selecione uma edição para configurar os critérios de pontuação." />;
  }

  return (
    <div className={twoColLayout}>
      <Panel
        title={`Critérios de pontuação - ${edicaoNome}`}
        description="Pontuação proativa (soma pontos) e reativa (penalidades), aplicável a APR amostral e/ou via Forms."
      >
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="text-muted">Carregando critérios...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Nenhum critério cadastrado para esta edição." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Ordem</th>
                  <th className="py-2 pr-3">Critério</th>
                  <th className="py-2 pr-3">Categoria</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">Pontos</th>
                  <th className="py-2 pr-3">Aplica-se a</th>
                  <th className="py-2 pr-3">Status</th>
                  {podeEditar && <th className="py-2 pr-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((criterio) => (
                  <tr key={criterio.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3 text-muted">{criterio.ordem}</td>
                    <td className="py-2 pr-3">
                      <strong className="block">{criterio.nome}</strong>
                      {criterio.codigo && <small className="text-muted">{criterio.codigo}</small>}
                    </td>
                    <td className="py-2 pr-3 text-muted">{categoriaCriterioLabel(criterio.categoria)}</td>
                    <td className="py-2 pr-3 text-muted">{tipoCriterioLabel(criterio.tipo)}</td>
                    <td className="py-2 pr-3 font-extrabold">{criterio.pontuacao > 0 ? `+${criterio.pontuacao}` : criterio.pontuacao}</td>
                    <td className="py-2 pr-3 text-muted">
                      {[criterio.aplicaAmostral && "Amostral", criterio.aplicaForms && "Forms"].filter(Boolean).join(" / ") || "-"}
                      {criterio.exigeComite && " · comitê"}
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={criterio.ativo ? "ATIVA" : "INATIVA"} />
                    </td>
                    {podeEditar && (
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" className={editButtonClasses} onClick={() => iniciarEdicao(criterio)}>
                            <Icon id="icon-check" />
                            Editar
                          </button>
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(criterio)}>
                            <Icon id="icon-trash" />
                            Excluir
                          </button>
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

      {podeEditar && (
        <Panel
          title={editandoId ? "Editar critério" : "Novo critério"}
          description="Critérios com 'código' reconhecido (ex.: APR_ERRO_ZERO) são calculados automaticamente pelo motor de pontuação."
        >
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className={labelClasses}>
              Nome
              <input
                type="text"
                maxLength={120}
                required
                className={fieldClasses}
                value={form.nome}
                onChange={(e) => setForm((current) => ({ ...current, nome: e.target.value }))}
              />
            </label>

            <label className={labelClasses}>
              Descrição
              <textarea
                rows={2}
                maxLength={500}
                className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                value={form.descricao}
                onChange={(e) => setForm((current) => ({ ...current, descricao: e.target.value }))}
              />
            </label>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className={labelClasses}>
                Tipo
                <select
                  className={fieldClasses}
                  value={form.tipo}
                  onChange={(e) => setForm((current) => ({ ...current, tipo: e.target.value as RsTipoCriterio }))}
                >
                  {TIPO_CRITERIO_OPTIONS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipoCriterioLabel(tipo)}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClasses}>
                Categoria
                <select
                  className={fieldClasses}
                  value={form.categoria}
                  onChange={(e) => setForm((current) => ({ ...current, categoria: e.target.value as RsCategoriaCriterio }))}
                >
                  {CATEGORIA_CRITERIO_OPTIONS.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoriaCriterioLabel(categoria)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className={labelClasses}>
                Pontuação (negativa = penalidade)
                <input
                  type="number"
                  className={fieldClasses}
                  value={form.pontuacao}
                  onChange={(e) => setForm((current) => ({ ...current, pontuacao: Number(e.target.value) }))}
                />
              </label>
              <label className={labelClasses}>
                Ordem de exibição
                <input
                  type="number"
                  min={0}
                  className={fieldClasses}
                  value={form.ordem}
                  onChange={(e) => setForm((current) => ({ ...current, ordem: Number(e.target.value) }))}
                />
              </label>
            </div>

            <label className={labelClasses}>
              Código (opcional - usado pelo motor de pontuação)
              <input
                type="text"
                maxLength={60}
                placeholder="Ex.: APR_ERRO_ZERO"
                className={fieldClasses}
                value={form.codigo}
                onChange={(e) => setForm((current) => ({ ...current, codigo: e.target.value }))}
              />
            </label>

            <div className="grid grid-cols-2 gap-2 text-[0.85rem] font-bold text-text">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.aplicaAmostral}
                  onChange={(e) => setForm((current) => ({ ...current, aplicaAmostral: e.target.checked }))}
                />
                Aplica-se à APR amostral
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.aplicaForms}
                  onChange={(e) => setForm((current) => ({ ...current, aplicaForms: e.target.checked }))}
                />
                Aplica-se à APR via Forms
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.exigeComite}
                  onChange={(e) => setForm((current) => ({ ...current, exigeComite: e.target.checked }))}
                />
                Exige aprovação do comitê
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.exigeEvidencia}
                  onChange={(e) => setForm((current) => ({ ...current, exigeEvidencia: e.target.checked }))}
                />
                Exige evidência/anexo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm((current) => ({ ...current, ativo: e.target.checked }))}
                />
                Ativo
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" full disabled={submitting}>
                <Icon id={editandoId ? "icon-check" : "icon-plus"} />
                {editandoId ? "Salvar alterações" : "Cadastrar critério"}
              </Button>
              {editandoId && (
                <Button type="button" variant="secondary" onClick={cancelarEdicao}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
