import { useMemo, useState, type DragEvent } from "react";
import { Panel, EmptyState } from "../components/ui/Panel";
import { TaskCard } from "../components/tarefas/TaskCard";
import { AtendimentoOSCard } from "../components/tarefas/AtendimentoOSCard";
import { WeekSelector } from "../components/ui/WeekSelector";
import { useFuncionarios } from "../hooks/useFuncionarios";
import { useTarefas } from "../hooks/useTarefas";
import { useToast } from "../hooks/useToast";
import { KANBAN_COLUMNS, statusLabel } from "../lib/enums";
import { currentWeekValue } from "../lib/format";
import { isDone } from "../lib/tarefaHelpers";
import type { StatusTarefa, Tarefa } from "../types/tarefa";

const fieldClasses =
  "min-h-[40px] rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";

export function ExecucaoPage() {
  const [semana, setSemana] = useState(currentWeekValue);
  const [responsavelFiltro, setResponsavelFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<StatusTarefa | null>(null);

  const { funcionarios } = useFuncionarios();
  const { tarefas, carregando, erro, alterarStatus, iniciar, pausar, remover, pedirAjuda } = useTarefas(semana);
  const { showToast } = useToast();

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((tarefa) => {
      if (responsavelFiltro !== "todos" && tarefa.responsavelId !== responsavelFiltro && tarefa.apoioId !== responsavelFiltro) return false;
      if (tipoFiltro !== "todos" && tarefa.tipo !== tipoFiltro) return false;
      return true;
    });
  }, [tarefas, responsavelFiltro, tipoFiltro]);

  const porStatus = useMemo(() => {
    const grupos: Record<StatusTarefa, Tarefa[]> = { PENDENTE: [], EM_ANDAMENTO: [], CONCLUIDA: [] };
    tarefasFiltradas.forEach((tarefa) => grupos[tarefa.status].push(tarefa));
    return grupos;
  }, [tarefasFiltradas]);

  async function handleIniciar(tarefa: Tarefa) {
    try {
      await iniciar(tarefa.id);
      showToast("Timer iniciado.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao iniciar o timer.");
    }
  }

  async function handlePausar(tarefa: Tarefa) {
    try {
      await pausar(tarefa.id);
      showToast("Timer pausado. Horas registradas.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao pausar o timer.");
    }
  }

  async function handleToggleConcluida(tarefa: Tarefa) {
    try {
      const novoStatus: StatusTarefa = isDone(tarefa) ? "EM_ANDAMENTO" : "CONCLUIDA";
      await alterarStatus(tarefa.id, novoStatus);
      showToast(novoStatus === "CONCLUIDA" ? "Tarefa concluída." : "Tarefa reaberta.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao atualizar a tarefa.");
    }
  }

  async function handleExcluir(tarefa: Tarefa) {
    if (!window.confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) return;
    try {
      await remover(tarefa.id);
      showToast("Tarefa excluída.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao excluir a tarefa.");
    }
  }

  async function handleSolicitarAjuda(tarefa: Tarefa) {
    try {
      const resultado = await pedirAjuda(tarefa.id);
      showToast(resultado.mensagem);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao solicitar apoio.");
    }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, tarefa: Tarefa) {
    setDraggedTaskId(tarefa.id);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>, status: StatusTarefa) {
    event.preventDefault();
    setDragOverStatus(null);
    if (!draggedTaskId) return;

    const tarefa = tarefas.find((item) => item.id === draggedTaskId);
    if (tarefa && tarefa.status !== status) {
      try {
        await alterarStatus(tarefa.id, status);
        showToast(`Tarefa movida para ${statusLabel(status)}.`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Erro ao mover a tarefa.");
      }
    }
  }

  return (
    <>
      <Panel
        title="Execução de tarefa"
        description="Arraste os cards entre colunas ou use os botões para atualizar o andamento."
        headerExtra={
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-end sm:justify-end">
            <label className="grid gap-1 text-[0.82rem] font-bold text-muted">
              Semana
              <WeekSelector
                value={semana}
                onChange={setSemana}
                className="w-full sm:w-[260px]"
              />
            </label>
            <select
              aria-label="Filtrar por responsável"
              className={`${fieldClasses} w-full sm:w-[200px]`}
              value={responsavelFiltro}
              onChange={(event) => setResponsavelFiltro(event.target.value)}
            >
              <option value="todos">Todos os responsáveis</option>
              {funcionarios.map((funcionario) => (
                <option key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome}
                  {!funcionario.ativo && " (inativo)"}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrar por tipo"
              className={`${fieldClasses} w-full sm:w-[160px]`}
              value={tipoFiltro}
              onChange={(event) => setTipoFiltro(event.target.value)}
            >
              <option value="todos">Todos os tipos</option>
              <option value="ROTINEIRA">Rotineiras</option>
              <option value="EVENTUAL">Eventuais</option>
            </select>
          </div>
        }
      >
        {erro && <p className="text-red">{erro}</p>}

        {carregando ? (
          <p className="text-muted">Carregando tarefas...</p>
        ) : (
          <div className="mt-3.5 grid gap-3.5 lg:grid-cols-3">
            {KANBAN_COLUMNS.map(({ status, titulo }) => (
              <div
                key={status}
                data-status={status}
                className={`flex min-h-[300px] flex-col gap-2.5 rounded-[8px] border-2 border-transparent bg-surface-strong p-3 transition-colors ${
                  dragOverStatus === status ? "border-teal bg-bg" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverStatus(status);
                }}
                onDragLeave={() => setDragOverStatus((current) => (current === status ? null : current))}
                onDrop={(event) => handleDrop(event, status)}
              >
                <div className="flex items-center justify-between border-b border-line px-1 pb-2 text-[0.9rem] font-extrabold">
                  {titulo}
                  <span className="inline-flex min-h-[24px] items-center whitespace-nowrap rounded-full bg-surface-strong px-2 text-[0.76rem] font-extrabold text-muted">
                    {porStatus[status].length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5">
                  {porStatus[status].length === 0 ? (
                    <EmptyState message={`Nenhuma tarefa ${statusLabel(status).toLowerCase()}.`} />
                  ) : (
                    porStatus[status].map((tarefa) => (
                      <TaskCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        dragging={draggedTaskId === tarefa.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onIniciar={handleIniciar}
                        onPausar={handlePausar}
                        onToggleConcluida={handleToggleConcluida}
                        onExcluir={handleExcluir}
                        onSolicitarAjuda={handleSolicitarAjuda}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <AtendimentoOSCard
        responsavelId={responsavelFiltro !== "todos" ? responsavelFiltro : undefined}
      />
    </>
  );
}
