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
import { TIPO_CONDICAO_OPTIONS, tipoCondicaoLabel } from "../../../lib/rotaSegura2026";
import type { RsCriterio, RsRegraCondicional, RsTipoCondicao } from "../../../types/rotaSegura2026";

interface RegrasTabProps {
  edicaoId: string;
  edicaoNome: string;
  criterios: RsCriterio[];
  podeEditar: boolean;
}

interface RegraFormState {
  criterioId: string;
  criterioDependenteId: string;
  tipoCondicao: RsTipoCondicao;
  parametrosTexto: string;
  descricao: string;
  ativo: boolean;
}

function defaultForm(criterios: RsCriterio[]): RegraFormState {
  return {
    criterioId: criterios[0]?.id || "",
    criterioDependenteId: "",
    tipoCondicao: "REQUER_CRITERIO_APROVADO",
    parametrosTexto: "",
    descricao: "",
    ativo: true,
  };
}

function toForm(regra: RsRegraCondicional): RegraFormState {
  return {
    criterioId: regra.criterioId,
    criterioDependenteId: regra.criterioDependenteId || "",
    tipoCondicao: regra.tipoCondicao,
    parametrosTexto: regra.parametros ? JSON.stringify(regra.parametros, null, 2) : "",
    descricao: regra.descricao || "",
    ativo: regra.ativo,
  };
}

export function RegrasTab({ edicaoId, edicaoNome, criterios, podeEditar }: RegrasTabProps) {
  const { showToast } = useToast();
  const { items, carregando, erro, criar, atualizar, remover } = useQueryCrud<RsRegraCondicional>(
    "/rota-segura/regras",
    edicaoId ? `?edicaoId=${edicaoId}` : "",
    "Não foi possível carregar as regras condicionais.",
  );

  const [form, setForm] = useState<RegraFormState>(() => defaultForm(criterios));
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const criteriosPorId = Object.fromEntries(criterios.map((criterio) => [criterio.id, criterio]));

  function iniciarEdicao(regra: RsRegraCondicional) {
    setEditandoId(regra.id);
    setForm(toForm(regra));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(defaultForm(criterios));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!edicaoId) return;

    if (!form.criterioId) {
      showToast("Selecione o critério.");
      return;
    }

    let parametros: Record<string, unknown> | null = null;
    if (form.parametrosTexto.trim()) {
      try {
        parametros = JSON.parse(form.parametrosTexto);
      } catch {
        showToast("Parâmetros inválidos: informe um JSON válido ou deixe em branco.");
        return;
      }
    }

    const payload = {
      edicaoId,
      criterioId: form.criterioId,
      criterioDependenteId: form.criterioDependenteId || null,
      tipoCondicao: form.tipoCondicao,
      parametros,
      descricao: form.descricao.trim() || null,
      ativo: form.ativo,
    };

    setSubmitting(true);
    try {
      if (editandoId) {
        await atualizar(editandoId, payload);
        showToast("Regra atualizada.");
      } else {
        await criar(payload);
        showToast("Regra cadastrada.");
      }
      cancelarEdicao();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao salvar a regra."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir(regra: RsRegraCondicional) {
    if (!window.confirm("Excluir esta regra condicional?")) return;

    try {
      await remover(regra.id);
      if (editandoId === regra.id) cancelarEdicao();
      showToast("Regra excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir a regra."));
    }
  }

  if (!edicaoId) {
    return <EmptyState message="Selecione uma edição para configurar as regras condicionais." />;
  }

  return (
    <div className={twoColLayout}>
      <Panel
        title={`Regras condicionais - ${edicaoNome}`}
        description="Dependências entre critérios, bloqueios por tipo de APR e limites mensais por equipe."
      >
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="text-muted">Carregando regras...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma regra condicional cadastrada para esta edição." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Critério</th>
                  <th className="py-2 pr-3">Condição</th>
                  <th className="py-2 pr-3">Depende de</th>
                  <th className="py-2 pr-3">Parâmetros</th>
                  <th className="py-2 pr-3">Status</th>
                  {podeEditar && <th className="py-2 pr-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((regra) => (
                  <tr key={regra.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3">
                      <strong className="block">{criteriosPorId[regra.criterioId]?.nome || "-"}</strong>
                      {regra.descricao && <small className="text-muted">{regra.descricao}</small>}
                    </td>
                    <td className="py-2 pr-3 text-muted">{tipoCondicaoLabel(regra.tipoCondicao)}</td>
                    <td className="py-2 pr-3 text-muted">
                      {regra.criterioDependenteId ? criteriosPorId[regra.criterioDependenteId]?.nome || "-" : "-"}
                    </td>
                    <td className="py-2 pr-3 text-muted">
                      {regra.parametros ? <code className="text-[0.78rem]">{JSON.stringify(regra.parametros)}</code> : "-"}
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={regra.ativo ? "ATIVA" : "INATIVA"} />
                    </td>
                    {podeEditar && (
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" className={editButtonClasses} onClick={() => iniciarEdicao(regra)}>
                            <Icon id="icon-check" />
                            Editar
                          </button>
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(regra)}>
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
          title={editandoId ? "Editar regra" : "Nova regra"}
          description="Estrutura flexível: cada regra associa um critério a uma condição (dependência de outro critério, bloqueio por tipo de APR ou limite mensal por equipe)."
        >
          {criterios.length === 0 ? (
            <EmptyState message="Cadastre critérios para esta edição antes de configurar regras condicionais." />
          ) : (
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <label className={labelClasses}>
                Critério
                <select
                  className={fieldClasses}
                  value={form.criterioId}
                  onChange={(e) => setForm((current) => ({ ...current, criterioId: e.target.value }))}
                >
                  {criterios.map((criterio) => (
                    <option key={criterio.id} value={criterio.id}>
                      {criterio.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Tipo de condição
                <select
                  className={fieldClasses}
                  value={form.tipoCondicao}
                  onChange={(e) => setForm((current) => ({ ...current, tipoCondicao: e.target.value as RsTipoCondicao }))}
                >
                  {TIPO_CONDICAO_OPTIONS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipoCondicaoLabel(tipo)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Depende do critério (opcional)
                <select
                  className={fieldClasses}
                  value={form.criterioDependenteId}
                  onChange={(e) => setForm((current) => ({ ...current, criterioDependenteId: e.target.value }))}
                >
                  <option value="">Nenhum</option>
                  {criterios.map((criterio) => (
                    <option key={criterio.id} value={criterio.id}>
                      {criterio.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Parâmetros (JSON, opcional)
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder={'Ex.: {"tipoApr": "FORMS"} ou {"tipoApr": "AMOSTRAL", "limite": 2}'}
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5 font-mono text-[0.8rem]`}
                  value={form.parametrosTexto}
                  onChange={(e) => setForm((current) => ({ ...current, parametrosTexto: e.target.value }))}
                />
              </label>

              <label className={labelClasses}>
                Descrição
                <textarea
                  rows={2}
                  maxLength={300}
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
                Ativa
              </label>

              <div className="flex gap-2">
                <Button type="submit" full disabled={submitting}>
                  <Icon id={editandoId ? "icon-check" : "icon-plus"} />
                  {editandoId ? "Salvar alterações" : "Cadastrar regra"}
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
