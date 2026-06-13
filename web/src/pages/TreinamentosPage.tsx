import { useMemo, useState, type FormEvent } from "react";
import { Panel, EmptyState } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/IconSprite";
import { StatusBadge } from "../components/ui/StatusBadge";
import { SummaryCard } from "../components/ui/SummaryCard";
import { useCrud } from "../hooks/useCrud";
import { useFuncionarios } from "../hooks/useFuncionarios";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { podeGerenciarProgramasSST } from "../lib/permissions";
import { ApiError } from "../lib/api";
import { programaStatusLabel } from "../lib/enums";
import { formatDate, startOfToday } from "../lib/format";
import type { StatusTreinamento, Treinamento } from "../types/programas";

const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";
const selectInlineClasses =
  "min-h-[38px] rounded-[8px] border border-line bg-surface-soft px-2 text-[0.85rem] text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const deleteButtonClasses =
  "inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[8px] border border-red/25 bg-red-soft px-2.5 text-[0.8rem] font-extrabold text-red transition-transform duration-150 hover:-translate-y-px active:translate-y-0";

const STATUS_OPTIONS: StatusTreinamento[] = ["PLANEJADO", "REALIZADO", "CANCELADO", "VENCIDO"];

function defaultForm() {
  return {
    titulo: "",
    norma: "",
    cargaHoraria: 8,
    responsavelId: "",
    dataRealizacao: "",
    validade: "",
    status: "PLANEJADO" as StatusTreinamento,
    descricao: "",
  };
}

export function TreinamentosPage() {
  const { items: treinamentos, carregando, erro, criar, atualizar, remover } = useCrud<Treinamento>("/treinamentos");
  const { funcionarios } = useFuncionarios();
  const { showToast } = useToast();
  const { usuario } = useAuth();
  const canManage = podeGerenciarProgramasSST(usuario?.papel);

  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const ativos = funcionarios.filter((f) => f.ativo);

  const resumo = useMemo(() => {
    const hoje = startOfToday();
    const em30Dias = new Date(hoje);
    em30Dias.setDate(em30Dias.getDate() + 30);

    const total = treinamentos.length;
    const planejados = treinamentos.filter((t) => t.status === "PLANEJADO").length;
    const realizados = treinamentos.filter((t) => t.status === "REALIZADO").length;
    const vencendo = treinamentos.filter((t) => {
      if (t.status !== "REALIZADO" || !t.validade) return false;
      const validade = new Date(t.validade);
      return validade >= hoje && validade <= em30Dias;
    }).length;

    return { total, planejados, realizados, vencendo };
  }, [treinamentos]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const titulo = form.titulo.trim();
    if (!titulo) {
      showToast("Informe o título do treinamento.");
      return;
    }

    setSubmitting(true);
    try {
      await criar({
        titulo,
        norma: form.norma.trim() || null,
        cargaHoraria: form.cargaHoraria ? Number(form.cargaHoraria) : null,
        responsavelId: form.responsavelId || null,
        dataRealizacao: form.dataRealizacao || null,
        validade: form.validade || null,
        status: form.status,
        descricao: form.descricao.trim() || null,
      });
      setForm(defaultForm());
      showToast("Treinamento cadastrado.");
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.detalhes) && err.detalhes.length > 0) {
        const primeiro = err.detalhes[0] as { mensagem?: string };
        showToast(primeiro.mensagem || err.message);
      } else {
        showToast(err instanceof Error ? err.message : "Erro ao cadastrar treinamento.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(treinamento: Treinamento, status: StatusTreinamento) {
    try {
      await atualizar(treinamento.id, { status });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao atualizar o status do treinamento.");
    }
  }

  async function handleExcluir(treinamento: Treinamento) {
    if (!window.confirm(`Excluir o treinamento "${treinamento.titulo}"? Esta ação não poderá ser desfeita.`)) return;

    try {
      await remover(treinamento.id);
      showToast("Treinamento excluído.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao excluir treinamento.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <SummaryCard label="Treinamentos cadastrados" value={resumo.total} hint="todos os registros do programa" />
        <SummaryCard label="Planejados" value={resumo.planejados} hint="aguardando realização" />
        <SummaryCard label="Realizados" value={resumo.realizados} hint="com conclusão registrada" />
        <SummaryCard label="Vencendo em 30 dias" value={resumo.vencendo} hint="renovação de certificado" />
      </div>

      <div className={`grid gap-6 lg:items-start ${canManage ? "lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]" : ""}`}>
        <Panel
          title="Treinamentos de SST"
          description="Capacitações obrigatórias, normas regulamentadoras, carga horária e validade dos certificados."
        >
          {erro && <p className="text-red">{erro}</p>}
          {carregando ? (
            <p className="text-muted">Carregando treinamentos...</p>
          ) : treinamentos.length === 0 ? (
            <EmptyState message="Nenhum treinamento cadastrado." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-[0.9rem]">
                <thead>
                  <tr className="border-b border-line text-left text-[0.76rem] font-extrabold uppercase text-muted">
                    <th className="py-2 pr-3">Treinamento</th>
                    <th className="py-2 pr-3">Carga</th>
                    <th className="py-2 pr-3">Responsável</th>
                    <th className="py-2 pr-3">Realização</th>
                    <th className="py-2 pr-3">Validade</th>
                    <th className="py-2 pr-3">Status</th>
                    {canManage && <th className="py-2 pr-3">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {treinamentos.map((treinamento) => (
                    <tr key={treinamento.id} className="border-b border-line last:border-b-0">
                      <td className="py-2 pr-3">
                        <strong className="block">{treinamento.titulo}</strong>
                        <small className="text-muted">{treinamento.norma || "Sem norma associada"}</small>
                      </td>
                      <td className="py-2 pr-3 text-muted">{treinamento.cargaHoraria ? `${treinamento.cargaHoraria}h` : "-"}</td>
                      <td className="py-2 pr-3 text-muted">{treinamento.responsavel?.nome || "Sem responsável"}</td>
                      <td className="py-2 pr-3 text-muted">{formatDate(treinamento.dataRealizacao)}</td>
                      <td className="py-2 pr-3 text-muted">{formatDate(treinamento.validade)}</td>
                      <td className="py-2 pr-3">
                        {canManage ? (
                          <select
                            className={selectInlineClasses}
                            value={treinamento.status}
                            onChange={(e) => handleStatusChange(treinamento, e.target.value as StatusTreinamento)}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {programaStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={treinamento.status} />
                        )}
                      </td>
                      {canManage && (
                        <td className="py-2 pr-3">
                          <button type="button" className={deleteButtonClasses} onClick={() => handleExcluir(treinamento)}>
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

        {canManage && (
          <Panel title="Novo treinamento" description="Cadastre um treinamento, sua norma de referência e a validade do certificado.">
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <label className={labelClasses}>
                Título
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Ex.: NR-35 Trabalho em altura"
                  required
                  className={fieldClasses}
                  value={form.titulo}
                  onChange={(e) => setForm((current) => ({ ...current, titulo: e.target.value }))}
                />
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Norma
                  <input
                    type="text"
                    maxLength={40}
                    placeholder="Ex.: NR-35"
                    className={fieldClasses}
                    value={form.norma}
                    onChange={(e) => setForm((current) => ({ ...current, norma: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Carga horária
                  <input
                    type="number"
                    min={1}
                    max={200}
                    className={fieldClasses}
                    value={form.cargaHoraria}
                    onChange={(e) => setForm((current) => ({ ...current, cargaHoraria: Number(e.target.value) }))}
                  />
                </label>
              </div>

              <label className={labelClasses}>
                Responsável
                <select
                  className={fieldClasses}
                  value={form.responsavelId}
                  onChange={(e) => setForm((current) => ({ ...current, responsavelId: e.target.value }))}
                >
                  <option value="">Sem responsável definido</option>
                  {ativos.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className={labelClasses}>
                  Data de realização
                  <input
                    type="date"
                    className={fieldClasses}
                    value={form.dataRealizacao}
                    onChange={(e) => setForm((current) => ({ ...current, dataRealizacao: e.target.value }))}
                  />
                </label>
                <label className={labelClasses}>
                  Validade do certificado
                  <input
                    type="date"
                    className={fieldClasses}
                    value={form.validade}
                    onChange={(e) => setForm((current) => ({ ...current, validade: e.target.value }))}
                  />
                </label>
              </div>

              <label className={labelClasses}>
                Status
                <select
                  className={fieldClasses}
                  value={form.status}
                  onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as StatusTreinamento }))}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {programaStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClasses}>
                Observações
                <textarea
                  rows={3}
                  maxLength={420}
                  placeholder="Público previsto, instrutor, local ou material de apoio."
                  className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
                  value={form.descricao}
                  onChange={(e) => setForm((current) => ({ ...current, descricao: e.target.value }))}
                />
              </label>

              <Button type="submit" full disabled={submitting}>
                <Icon id="icon-plus" />
                Cadastrar treinamento
              </Button>
            </form>
          </Panel>
        )}
      </div>
    </div>
  );
}
