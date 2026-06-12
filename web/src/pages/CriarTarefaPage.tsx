import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Panel } from "../components/ui/Panel";
import { Icon } from "../components/ui/IconSprite";
import { Button } from "../components/ui/Button";
import { useFuncionarios } from "../hooks/useFuncionarios";
import { useToast } from "../hooks/useToast";
import { criarTarefa } from "../lib/tarefas";
import { currentWeekValue, shiftDate } from "../lib/format";
import { ApiError } from "../lib/api";
import type { PeriodoRotina, PrioridadeTarefa, TipoTarefa } from "../types/tarefa";

const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";

function defaultState(responsavelId = "") {
  return {
    titulo: "",
    responsavelId,
    semana: currentWeekValue(),
    prazo: shiftDate(2),
    tipo: "EVENTUAL" as TipoTarefa,
    prioridade: "MEDIA" as PrioridadeTarefa,
    periodoRotina: "SEMANAL" as PeriodoRotina,
    horasEstimadas: 4,
    descricao: "",
  };
}

export function CriarTarefaPage() {
  const { funcionarios } = useFuncionarios();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultState);
  const [submitting, setSubmitting] = useState(false);

  const ativos = funcionarios.filter((f) => f.ativo);
  const responsavelId = form.responsavelId || ativos[0]?.id || "";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.titulo.trim() || !responsavelId || !form.prazo || !form.horasEstimadas) {
      showToast("Preencha os campos obrigatórios da tarefa.");
      return;
    }

    setSubmitting(true);
    try {
      const tarefa = await criarTarefa({
        titulo: form.titulo.trim(),
        responsavelId,
        semana: form.semana,
        prazo: form.prazo,
        tipo: form.tipo,
        prioridade: form.prioridade,
        periodoRotina: form.tipo === "ROTINEIRA" ? form.periodoRotina : null,
        horasEstimadas: Number(form.horasEstimadas),
        descricao: form.descricao.trim(),
      });

      setForm(() => defaultState(responsavelId));

      if (tarefa.notificacaoEmail?.enviado) {
        showToast("Tarefa adicionada ao plano semanal. E-mail de notificação enviado ao responsável.");
      } else if (tarefa.notificacaoEmail?.motivo) {
        showToast(`Tarefa adicionada ao plano semanal. ${tarefa.notificacaoEmail.motivo}`);
      } else {
        showToast("Tarefa adicionada ao plano semanal.");
      }
      navigate("/tarefas/executar");
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.detalhes) && err.detalhes.length > 0) {
        const primeiro = err.detalhes[0] as { mensagem?: string };
        showToast(primeiro.mensagem || err.message);
      } else {
        showToast(err instanceof Error ? err.message : "Erro ao criar a tarefa.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel
      title="Criação de tarefas"
      description="Registre responsável, tipo de tarefa, prazo e esforço estimado."
      className="max-w-[780px]"
    >
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className={labelClasses}>
          Título
          <input
            type="text"
            maxLength={90}
            placeholder="Ex.: Revisar APR da manutenção"
            required
            className={fieldClasses}
            value={form.titulo}
            onChange={(e) => setForm((current) => ({ ...current, titulo: e.target.value }))}
          />
        </label>

        <label className={labelClasses}>
          Responsável
          <select
            required
            className={fieldClasses}
            value={responsavelId}
            onChange={(e) => setForm((current) => ({ ...current, responsavelId: e.target.value }))}
          >
            {ativos.map((funcionario) => (
              <option key={funcionario.id} value={funcionario.id}>
                {funcionario.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label className={labelClasses}>
            Semana
            <input
              type="week"
              required
              className={fieldClasses}
              value={form.semana}
              onChange={(e) => setForm((current) => ({ ...current, semana: e.target.value }))}
            />
          </label>
          <label className={labelClasses}>
            Prazo
            <input
              type="date"
              required
              className={fieldClasses}
              value={form.prazo}
              onChange={(e) => setForm((current) => ({ ...current, prazo: e.target.value }))}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label className={labelClasses}>
            Tipo
            <select
              required
              className={fieldClasses}
              value={form.tipo}
              onChange={(e) => setForm((current) => ({ ...current, tipo: e.target.value as TipoTarefa }))}
            >
              <option value="ROTINEIRA">Rotineira</option>
              <option value="EVENTUAL">Eventual</option>
            </select>
          </label>
          <label className={labelClasses}>
            Prioridade
            <select
              required
              className={fieldClasses}
              value={form.prioridade}
              onChange={(e) => setForm((current) => ({ ...current, prioridade: e.target.value as PrioridadeTarefa }))}
            >
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </label>
        </div>

        {form.tipo === "ROTINEIRA" && (
          <label className={labelClasses}>
            Período da rotina
            <select
              className={fieldClasses}
              value={form.periodoRotina}
              onChange={(e) => setForm((current) => ({ ...current, periodoRotina: e.target.value as PeriodoRotina }))}
            >
              <option value="SEMANAL">Semanal</option>
              <option value="MENSAL">Mensal</option>
              <option value="TRIMESTRAL">Trimestral</option>
              <option value="SEMESTRAL">Semestral</option>
              <option value="ANUAL">Anual</option>
            </select>
          </label>
        )}

        <label className={labelClasses}>
          Horas estimadas
          <input
            type="number"
            min={1}
            max={80}
            required
            className={fieldClasses}
            value={form.horasEstimadas}
            onChange={(e) => setForm((current) => ({ ...current, horasEstimadas: Number(e.target.value) }))}
          />
        </label>

        <label className={labelClasses}>
          Observações
          <textarea
            rows={4}
            maxLength={420}
            placeholder="Detalhe a demanda, local, documento ou área envolvida."
            className={`${fieldClasses} min-h-[40px] resize-y py-2.5`}
            value={form.descricao}
            onChange={(e) => setForm((current) => ({ ...current, descricao: e.target.value }))}
          />
        </label>

        <Button type="submit" full disabled={submitting}>
          <Icon id="icon-plus" />
          Criar tarefa
        </Button>
      </form>
    </Panel>
  );
}
