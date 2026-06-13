import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Panel, EmptyState } from "../components/ui/Panel";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/IconSprite";
import { Avatar } from "../components/ui/Avatar";
import { PersonCard } from "../components/funcionarios/PersonCard";
import { useFuncionarios } from "../hooks/useFuncionarios";
import { useToast } from "../hooks/useToast";
import { usePermissao } from "../hooks/usePermissao";
import { ApiError } from "../lib/api";
import { listarTarefas } from "../lib/tarefas";
import { currentWeekValue } from "../lib/format";
import { isDone, isLate, wasOnTime } from "../lib/tarefaHelpers";
import { resizePhoto } from "../lib/image";
import type { Funcionario } from "../types/funcionario";
import type { Tarefa } from "../types/tarefa";

const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";

function defaultForm() {
  return { nome: "", funcao: "", email: "", capacidade: 32 };
}

export function FuncionariosPage() {
  const { funcionarios, carregando, criar, alternarAtivo, remover } = useFuncionarios();
  const { showToast } = useToast();
  const canManage = usePermissao("GERENCIAR_EQUIPE");
  const canDelete = usePermissao("EXCLUIR_FUNCIONARIO");

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [foto, setFoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listarTarefas({}).then((data) => {
      if (!cancelled) setTarefas(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    const semanaAtual = currentWeekValue();

    return funcionarios.map((funcionario) => {
      const tarefasDaSemana = tarefas.filter((t) => t.semana === semanaAtual);

      const carga = tarefasDaSemana
        .filter((t) => !isDone(t) && (t.responsavelId === funcionario.id || t.apoioId === funcionario.id))
        .reduce((soma, t) => soma + Number(t.horasEstimadas || 0), 0);

      const tarefasProprias = tarefasDaSemana.filter((t) => t.responsavelId === funcionario.id && !isDone(t));
      const tarefasApoio = tarefasDaSemana.filter((t) => t.apoioId === funcionario.id && !isDone(t));

      const onTime = tarefas.filter((t) => t.responsavelId === funcionario.id && isDone(t) && wasOnTime(t)).length;
      const atrasos = tarefas.filter((t) => {
        if (t.responsavelId !== funcionario.id) return false;
        return isDone(t) ? !wasOnTime(t) : isLate(t);
      }).length;
      const ajudaPedida = tarefas.reduce(
        (soma, t) => soma + (t.pedidosAjuda || []).filter((p) => p.solicitanteId === funcionario.id).length,
        0,
      );
      const linkedTasks = tarefas.filter(
        (t) =>
          t.responsavelId === funcionario.id ||
          t.apoioId === funcionario.id ||
          (t.pedidosAjuda || []).some((p) => p.solicitanteId === funcionario.id || p.atendentePorId === funcionario.id),
      ).length;

      return {
        funcionario,
        info: { carga, onTime, atrasos, ajudaPedida, tarefasProprias, tarefasApoio, linkedTasks },
      };
    });
  }, [funcionarios, tarefas]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nome = form.nome.trim();
    const funcao = form.funcao.trim();
    const email = form.email.trim();
    const capacidade = Number(form.capacidade);

    if (!nome || !funcao || !email || !capacidade) {
      showToast("Preencha nome, função, e-mail e capacidade.");
      return;
    }

    setSubmitting(true);
    try {
      await criar({ nome, funcao, email, capacidade, foto: foto || null });
      setForm(defaultForm());
      setFoto(null);
      showToast("Pessoa adicionada à equipe.");
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.detalhes) && err.detalhes.length > 0) {
        const primeiro = err.detalhes[0] as { mensagem?: string };
        showToast(primeiro.mensagem || err.message);
      } else {
        showToast(err instanceof Error ? err.message : "Erro ao adicionar pessoa.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFoto(null);
      return;
    }

    try {
      const resized = await resizePhoto(file);
      setFoto(resized);
    } catch {
      setFoto(null);
      event.target.value = "";
      showToast("Não consegui carregar essa imagem. Tente outra foto.");
    }
  }

  async function handleToggleAtivo(funcionario: Funcionario) {
    const nextAtivo = !funcionario.ativo;
    const message = nextAtivo
      ? `Reativar ${funcionario.nome} para permitir novas tarefas e apoios?`
      : `Inativar ${funcionario.nome}? O histórico será mantido, mas esta pessoa não receberá novas tarefas nem apoios.`;
    if (!window.confirm(message)) return;

    try {
      await alternarAtivo(funcionario.id, nextAtivo);
      showToast(nextAtivo ? "Funcionário reativado." : "Funcionário inativado. Histórico preservado.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao atualizar funcionário.");
    }
  }

  async function handleExcluir(funcionario: Funcionario) {
    if (!window.confirm("Tem certeza que deseja excluir este funcionário? Esta ação não poderá ser desfeita.")) return;

    try {
      await remover(funcionario.id);
      showToast("Funcionário excluído.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        window.alert(`Não é possível excluir ${funcionario.nome}: ${err.message}`);
      } else {
        showToast(err instanceof Error ? err.message : "Erro ao excluir funcionário.");
      }
    }
  }

  return (
    <div className={`grid gap-6 lg:items-start ${canManage ? "lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]" : ""}`}>
      <Panel title="Funcionários" description="Capacidade semanal, tarefas próprias, tarefas de apoio e desempenho.">
        {carregando ? (
          <p className="text-muted">Carregando equipe...</p>
        ) : cards.length === 0 ? (
          <EmptyState message="Nenhuma pessoa cadastrada." />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {cards.map(({ funcionario, info }) => (
              <PersonCard
                key={funcionario.id}
                funcionario={funcionario}
                info={info}
                canManage={canManage}
                canDelete={canDelete}
                onToggleAtivo={handleToggleAtivo}
                onExcluir={handleExcluir}
              />
            ))}
          </div>
        )}
      </Panel>

      {canManage && (
      <Panel title="Cadastro de funcionário" description="Inclua membros da equipe de SST e a capacidade semanal.">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className={labelClasses}>
            Nome
            <input
              type="text"
              maxLength={70}
              placeholder="Nome da pessoa"
              required
              className={fieldClasses}
              value={form.nome}
              onChange={(e) => setForm((current) => ({ ...current, nome: e.target.value }))}
            />
          </label>
          <label className={labelClasses}>
            Função
            <input
              type="text"
              maxLength={70}
              placeholder="Ex.: Técnica de segurança"
              required
              className={fieldClasses}
              value={form.funcao}
              onChange={(e) => setForm((current) => ({ ...current, funcao: e.target.value }))}
            />
          </label>
          <label className={labelClasses}>
            E-mail
            <input
              type="email"
              maxLength={120}
              placeholder="nome@empresa.com.br"
              required
              className={fieldClasses}
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
            />
          </label>
          <label className={labelClasses}>
            Capacidade semanal em horas
            <input
              type="number"
              min={1}
              max={80}
              required
              className={fieldClasses}
              value={form.capacidade}
              onChange={(e) => setForm((current) => ({ ...current, capacidade: Number(e.target.value) }))}
            />
          </label>
          <label className={labelClasses}>
            Foto do TST
            <input type="file" accept="image/*" className={`${fieldClasses} py-1.5`} onChange={handlePhotoChange} />
          </label>
          <div className="flex min-h-[58px] items-center gap-2.5 rounded-[8px] border border-dashed border-line p-2 text-[0.84rem] text-muted">
            {foto ? (
              <>
                <Avatar nome={form.nome || "?"} foto={foto} size="large" />
                <span>Foto carregada</span>
              </>
            ) : (
              <span>Sem foto</span>
            )}
          </div>
          <Button type="submit" full disabled={submitting}>
            <Icon id="icon-plus" />
            Adicionar pessoa
          </Button>
        </form>
      </Panel>
      )}
    </div>
  );
}

