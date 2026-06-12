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
import { areaEquipeLabel } from "../../../lib/rotaSegura2026";
import type { RsColaborador, RsEquipe } from "../../../types/rotaSegura2026";

interface ColaboradoresTabProps {
  colaboradores: RsColaborador[];
  equipes: RsEquipe[];
  carregando: boolean;
  erro: string | null;
  criar: (dados: Record<string, unknown>) => Promise<RsColaborador>;
  atualizar: (id: string, dados: Record<string, unknown>) => Promise<RsColaborador>;
  remover: (id: string) => Promise<void>;
  podeEditar: boolean;
}

interface ColaboradorFormState {
  nome: string;
  matricula: string;
  funcao: string;
  equipeId: string;
  ativo: boolean;
}

function defaultForm(): ColaboradorFormState {
  return { nome: "", matricula: "", funcao: "", equipeId: "", ativo: true };
}

function toForm(colaborador: RsColaborador): ColaboradorFormState {
  return {
    nome: colaborador.nome,
    matricula: colaborador.matricula || "",
    funcao: colaborador.funcao || "",
    equipeId: colaborador.equipeId || "",
    ativo: colaborador.ativo,
  };
}

export function ColaboradoresTab({ colaboradores, equipes, carregando, erro, criar, atualizar, remover, podeEditar }: ColaboradoresTabProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<ColaboradorFormState>(defaultForm);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function iniciarEdicao(colaborador: RsColaborador) {
    setEditandoId(colaborador.id);
    setForm(toForm(colaborador));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(defaultForm());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nome = form.nome.trim();
    if (!nome) {
      showToast("Informe o nome do colaborador.");
      return;
    }

    const payload = {
      nome,
      matricula: form.matricula.trim() || null,
      funcao: form.funcao.trim() || null,
      equipeId: form.equipeId || null,
      ativo: form.ativo,
    };

    setSubmitting(true);
    try {
      if (editandoId) {
        await atualizar(editandoId, payload);
        showToast("Colaborador atualizado.");
      } else {
        await criar(payload);
        showToast("Colaborador cadastrado.");
      }
      cancelarEdicao();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao salvar o colaborador."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir(colaborador: RsColaborador) {
    if (!window.confirm(`Excluir o colaborador "${colaborador.nome}"?`)) return;

    try {
      await remover(colaborador.id);
      if (editandoId === colaborador.id) cancelarEdicao();
      showToast("Colaborador excluído.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir o colaborador."));
    }
  }

  return (
    <div className={twoColLayout}>
      <Panel title="Colaboradores" description="Pessoas vinculadas às equipes de campo do programa Rota Segura.">
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="text-muted">Carregando colaboradores...</p>
        ) : colaboradores.length === 0 ? (
          <EmptyState message="Nenhum colaborador cadastrado ainda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Colaborador</th>
                  <th className="py-2 pr-3">Matrícula</th>
                  <th className="py-2 pr-3">Função</th>
                  <th className="py-2 pr-3">Equipe</th>
                  <th className="py-2 pr-3">Status</th>
                  {podeEditar && <th className="py-2 pr-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((colaborador) => (
                  <tr key={colaborador.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3 font-extrabold">{colaborador.nome}</td>
                    <td className="py-2 pr-3 text-muted">{colaborador.matricula || "-"}</td>
                    <td className="py-2 pr-3 text-muted">{colaborador.funcao || "-"}</td>
                    <td className="py-2 pr-3 text-muted">
                      {colaborador.equipe ? `${colaborador.equipe.nome} (${areaEquipeLabel(colaborador.equipe.area)})` : "-"}
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={colaborador.ativo ? "ATIVA" : "INATIVA"} />
                    </td>
                    {podeEditar && (
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" className={editButtonClasses} onClick={() => iniciarEdicao(colaborador)}>
                            <Icon id="icon-check" />
                            Editar
                          </button>
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(colaborador)}>
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
        <Panel title={editandoId ? "Editar colaborador" : "Novo colaborador"} description="Nome, matrícula, função e equipe à qual pertence.">
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

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <label className={labelClasses}>
                Matrícula
                <input
                  type="text"
                  maxLength={60}
                  className={fieldClasses}
                  value={form.matricula}
                  onChange={(e) => setForm((current) => ({ ...current, matricula: e.target.value }))}
                />
              </label>
              <label className={labelClasses}>
                Função
                <input
                  type="text"
                  maxLength={120}
                  className={fieldClasses}
                  value={form.funcao}
                  onChange={(e) => setForm((current) => ({ ...current, funcao: e.target.value }))}
                />
              </label>
            </div>

            <label className={labelClasses}>
              Equipe
              <select
                className={fieldClasses}
                value={form.equipeId}
                onChange={(e) => setForm((current) => ({ ...current, equipeId: e.target.value }))}
              >
                <option value="">Sem equipe</option>
                {equipes.map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nome} ({areaEquipeLabel(equipe.area)})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-[0.85rem] font-bold text-text">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm((current) => ({ ...current, ativo: e.target.checked }))}
              />
              Colaborador ativo
            </label>

            <div className="flex gap-2">
              <Button type="submit" full disabled={submitting}>
                <Icon id={editandoId ? "icon-check" : "icon-plus"} />
                {editandoId ? "Salvar alterações" : "Cadastrar colaborador"}
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
