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
  twoColLayout,
} from "../../../lib/formClasses";
import { AREA_EQUIPE_OPTIONS, areaEquipeLabel } from "../../../lib/rotaSegura2026";
import type { RsAreaEquipe, RsPremiacao } from "../../../types/rotaSegura2026";

interface PremiacaoTabProps {
  edicaoId: string;
  edicaoNome: string;
  podeEditar: boolean;
}

interface PremiacaoFormState {
  area: RsAreaEquipe;
  quantidade: number;
  posicaoInicial: number;
  posicaoFinal: number;
  descricaoPremio: string;
  observacoes: string;
}

function defaultForm(): PremiacaoFormState {
  return {
    area: "LINHAS_LIMPEZA_FAIXA",
    quantidade: 1,
    posicaoInicial: 1,
    posicaoFinal: 1,
    descricaoPremio: "",
    observacoes: "",
  };
}

function toForm(premiacao: RsPremiacao): PremiacaoFormState {
  return {
    area: premiacao.area,
    quantidade: premiacao.quantidade,
    posicaoInicial: premiacao.posicaoInicial,
    posicaoFinal: premiacao.posicaoFinal,
    descricaoPremio: premiacao.descricaoPremio,
    observacoes: premiacao.observacoes || "",
  };
}

export function PremiacaoTab({ edicaoId, edicaoNome, podeEditar }: PremiacaoTabProps) {
  const { showToast } = useToast();
  const { items, carregando, erro, criar, atualizar, remover } = useQueryCrud<RsPremiacao>(
    "/rota-segura/premiacoes",
    edicaoId ? `?edicaoId=${edicaoId}` : "",
    "Não foi possível carregar a premiação.",
  );

  const [form, setForm] = useState<PremiacaoFormState>(defaultForm);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function iniciarEdicao(premiacao: RsPremiacao) {
    setEditandoId(premiacao.id);
    setForm(toForm(premiacao));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(defaultForm());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!edicaoId) return;

    const descricaoPremio = form.descricaoPremio.trim();
    if (!descricaoPremio) {
      showToast("Descreva o prêmio.");
      return;
    }

    if (Number(form.posicaoFinal) < Number(form.posicaoInicial)) {
      showToast("A posição final deve ser maior ou igual à posição inicial.");
      return;
    }

    const payload = {
      edicaoId,
      area: form.area,
      quantidade: Number(form.quantidade),
      posicaoInicial: Number(form.posicaoInicial),
      posicaoFinal: Number(form.posicaoFinal),
      descricaoPremio,
      observacoes: form.observacoes.trim() || null,
    };

    setSubmitting(true);
    try {
      if (editandoId) {
        await atualizar(editandoId, payload);
        showToast("Premiação atualizada.");
      } else {
        await criar(payload);
        showToast("Premiação cadastrada.");
      }
      cancelarEdicao();
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao salvar a premiação."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExcluir(premiacao: RsPremiacao) {
    if (!window.confirm(`Excluir a premiação de "${premiacao.descricaoPremio}"?`)) return;

    try {
      await remover(premiacao.id);
      if (editandoId === premiacao.id) cancelarEdicao();
      showToast("Premiação excluída.");
    } catch (err) {
      showToast(extractErrorMessage(err, "Erro ao excluir a premiação."));
    }
  }

  if (!edicaoId) {
    return <EmptyState message="Selecione uma edição para configurar a premiação." />;
  }

  return (
    <div className={twoColLayout}>
      <Panel
        title={`Premiação - ${edicaoNome}`}
        description="Faixas de posição no ranking final por área/especialidade e o prêmio correspondente."
      >
        {erro && <p className="text-red">{erro}</p>}
        {carregando ? (
          <p className="text-muted">Carregando premiação...</p>
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma premiação cadastrada para esta edição." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                  <th className="py-2 pr-3">Área</th>
                  <th className="py-2 pr-3">Posições</th>
                  <th className="py-2 pr-3">Qtd. premiados</th>
                  <th className="py-2 pr-3">Prêmio</th>
                  <th className="py-2 pr-3">Observações</th>
                  {podeEditar && <th className="py-2 pr-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((premiacao) => (
                  <tr key={premiacao.id} className="border-b border-line last:border-b-0">
                    <td className="py-2 pr-3 font-extrabold">{areaEquipeLabel(premiacao.area)}</td>
                    <td className="py-2 pr-3 text-muted">
                      {premiacao.posicaoInicial === premiacao.posicaoFinal
                        ? `${premiacao.posicaoInicial}º`
                        : `${premiacao.posicaoInicial}º a ${premiacao.posicaoFinal}º`}
                    </td>
                    <td className="py-2 pr-3 text-muted">{premiacao.quantidade}</td>
                    <td className="py-2 pr-3">{premiacao.descricaoPremio}</td>
                    <td className="py-2 pr-3 text-muted">{premiacao.observacoes || "-"}</td>
                    {podeEditar && (
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" className={editButtonClasses} onClick={() => iniciarEdicao(premiacao)}>
                            <Icon id="icon-check" />
                            Editar
                          </button>
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(premiacao)}>
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
          title={editandoId ? "Editar premiação" : "Nova premiação"}
          description="Defina a faixa de posições do ranking final (por área) que recebe este prêmio."
        >
          <form className="grid gap-3" onSubmit={handleSubmit}>
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

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <label className={labelClasses}>
                Posição inicial
                <input
                  type="number"
                  min={1}
                  required
                  className={fieldClasses}
                  value={form.posicaoInicial}
                  onChange={(e) => setForm((current) => ({ ...current, posicaoInicial: Number(e.target.value) }))}
                />
              </label>
              <label className={labelClasses}>
                Posição final
                <input
                  type="number"
                  min={1}
                  required
                  className={fieldClasses}
                  value={form.posicaoFinal}
                  onChange={(e) => setForm((current) => ({ ...current, posicaoFinal: Number(e.target.value) }))}
                />
              </label>
              <label className={labelClasses}>
                Qtd. premiados
                <input
                  type="number"
                  min={1}
                  required
                  className={fieldClasses}
                  value={form.quantidade}
                  onChange={(e) => setForm((current) => ({ ...current, quantidade: Number(e.target.value) }))}
                />
              </label>
            </div>

            <label className={labelClasses}>
              Descrição do prêmio
              <input
                type="text"
                maxLength={200}
                required
                placeholder="Ex.: Troféu + brinde personalizado"
                className={fieldClasses}
                value={form.descricaoPremio}
                onChange={(e) => setForm((current) => ({ ...current, descricaoPremio: e.target.value }))}
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

            <div className="flex gap-2">
              <Button type="submit" full disabled={submitting}>
                <Icon id={editandoId ? "icon-check" : "icon-plus"} />
                {editandoId ? "Salvar alterações" : "Cadastrar premiação"}
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
