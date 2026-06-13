import { useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../../../components/ui/Panel";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/IconSprite";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useToast } from "../../../hooks/useToast";
import {
  deleteButtonClasses,
  editButtonClasses,
  extractErrorMessage,
  fieldClasses,
  labelClasses,
  twoColLayout,
} from "../../../lib/formClasses";
import { AREA_EQUIPE_OPTIONS, areaEquipeLabel } from "../../../lib/rotaSegura2026";
import type { RsAreaEquipe, RsEquipe } from "../../../types/rotaSegura2026";

interface EquipesTabProps {
  equipes: RsEquipe[];
  carregando: boolean;
  erro: string | null;
  criar: (dados: Record<string, unknown>) => Promise<RsEquipe>;
  atualizar: (id: string, dados: Record<string, unknown>) => Promise<RsEquipe>;
  remover: (id: string) => Promise<void>;
  podeEditar: boolean;
}

interface EquipeFormState {
  nome: string;
  area: RsAreaEquipe;
  supervisor: string;
  tst: string;
  ativo: boolean;
  observacoes: string;
}

function defaultForm(): EquipeFormState {
  return { nome: "", area: "LINHAS_LIMPEZA_FAIXA", supervisor: "", tst: "", ativo: true, observacoes: "" };
}

function toForm(equipe: RsEquipe): EquipeFormState {
  return {
    nome: equipe.nome,
    area: equipe.area,
    supervisor: equipe.supervisor || "",
    tst: equipe.tst || "",
    ativo: equipe.ativo,
    observacoes: equipe.observacoes || "",
  };
}

export function EquipesTab({ equipes, carregando, erro, criar, atualizar, remover, podeEditar }: EquipesTabProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<EquipeFormState>(defaultForm);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function iniciarEdicao(equipe: RsEquipe) {
    setEditandoId(equipe.id);
    setForm(toForm(equipe));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(defaultForm());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nome = form.nome.trim();
    if (!nome) {
      showToast("Informe o nome da equipe.");
      return;
    }

    const payload = {
      nome,
      area: form.area,
      supervisor: form.supervisor.trim() || null,
      tst: form.tst.trim() || null,
      ativo: form.ativo,
      observacoes: form.observacoes.trim() || null,
    };

    setSubmitting(true);
    try {
      if (editandoId) {
        await atualizar(editandoId, payload);
        showToast("Equipe atualizada.");
      } else {
        await criar(payload);
        showToast("Equipe cadastrada.");
      }
      cancelarEdicao();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao salvar a equipe."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir(equipe: RsEquipe) {
    if (!window.confirm(`Excluir a equipe "${equipe.nome}"? Os colaboradores vinculados ficarão sem equipe.`)) return;

    try {
      await remover(equipe.id);
      if (editandoId === equipe.id) cancelarEdicao();
      showToast("Equipe excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir a equipe."));
    }
  }

  return (
    <div className={twoColLayout}>
      <Panel title="Equipes" description="Equipes de campo do programa Rota Segura, agrupadas por área/especialidade.">
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="text-muted">Carregando equipes...</p>
        ) : equipes.length === 0 ? (
          <EmptyState message="Nenhuma equipe cadastrada ainda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Equipe</th>
                  <th className="py-2 pr-3">Área</th>
                  <th className="py-2 pr-3">Supervisor</th>
                  <th className="py-2 pr-3">TST</th>
                  <th className="py-2 pr-3">Colaboradores</th>
                  <th className="py-2 pr-3">Status</th>
                  {podeEditar && <th className="py-2 pr-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {equipes.map((equipe) => (
                  <tr key={equipe.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3">
                      <strong className="block">{equipe.nome}</strong>
                      {equipe.observacoes && <small className="text-muted">{equipe.observacoes}</small>}
                    </td>
                    <td className="py-2 pr-3 text-muted">{areaEquipeLabel(equipe.area)}</td>
                    <td className="py-2 pr-3 text-muted">{equipe.supervisor || "-"}</td>
                    <td className="py-2 pr-3 text-muted">{equipe.tst || "-"}</td>
                    <td className="py-2 pr-3 text-muted">{equipe.colaboradores?.length || 0}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={equipe.ativo ? "ATIVA" : "INATIVA"} />
                    </td>
                    {podeEditar && (
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" className={editButtonClasses} onClick={() => iniciarEdicao(equipe)}>
                            <Icon id="icon-check" />
                            Editar
                          </button>
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(equipe)}>
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
        <Panel title={editandoId ? "Editar equipe" : "Nova equipe"} description="Nome, área/especialidade, supervisor e TST responsável.">
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className={labelClasses}>
              Nome da equipe
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
              Área / especialidade
              <select
                className={fieldClasses}
                value={form.area}
                onChange={(e) => setForm((current) => ({ ...current, area: e.target.value as RsAreaEquipe }))}
              >
                {AREA_EQUIPE_OPTIONS.map((area) => (
                  <option key={area} value={area}>
                    {areaEquipeLabel(area)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className={labelClasses}>
                Supervisor
                <input
                  type="text"
                  maxLength={120}
                  className={fieldClasses}
                  value={form.supervisor}
                  onChange={(e) => setForm((current) => ({ ...current, supervisor: e.target.value }))}
                />
              </label>
              <label className={labelClasses}>
                TST
                <input
                  type="text"
                  maxLength={120}
                  className={fieldClasses}
                  value={form.tst}
                  onChange={(e) => setForm((current) => ({ ...current, tst: e.target.value }))}
                />
              </label>
            </div>

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

            <label className="flex items-center gap-2 text-[0.85rem] font-bold text-text">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm((current) => ({ ...current, ativo: e.target.checked }))}
              />
              Equipe ativa
            </label>

            <div className="flex gap-2">
              <Button type="submit" full disabled={submitting}>
                <Icon id={editandoId ? "icon-check" : "icon-plus"} />
                {editandoId ? "Salvar alterações" : "Cadastrar equipe"}
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
