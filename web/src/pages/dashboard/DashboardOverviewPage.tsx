import { useState, type ReactNode } from "react";
import { Icon } from "../../components/ui/IconSprite";
import { WeekSelector } from "../../components/ui/WeekSelector";
import { WorkloadList } from "../../components/dashboard/WorkloadList";
import { StatusChart } from "../../components/dashboard/StatusChart";
import { PriorityActionPanel } from "../../components/dashboard/PriorityActionPanel";
import { CriticalTasksPanel } from "../../components/dashboard/CriticalTasksPanel";
import { UpcomingDeliveriesPanel } from "../../components/dashboard/UpcomingDeliveriesPanel";
import { HelpRequestsPanel } from "../../components/dashboard/HelpRequestsPanel";
import { ActiveTravelsList } from "../../components/dashboard/ActiveTravelsList";
import { FinishedTravelsList } from "../../components/dashboard/FinishedTravelsList";
import { TravelsByTechnicianPanel } from "../../components/dashboard/TravelsByTechnicianPanel";
import { useDashboard } from "../../hooks/useDashboard";
import { useFuncionarios } from "../../hooks/useFuncionarios";
import { useTarefasDetalhadas } from "../../hooks/useTarefasDetalhadas";
import { useViagensDetalhadas } from "../../hooks/useViagensDetalhadas";
import { addWeeks, currentWeekValue, formatWeekLabel } from "../../lib/format";

/* ── Helpers ── */

function formatHoras(horas: number): string {
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}min`;
}

/* ── MetricCard ── */

type Accent = "teal" | "blue" | "green" | "amber" | "red" | "purple" | "neutral";

const ACCENT_ICON: Record<Accent, string> = {
  teal: "bg-teal-soft text-teal-strong dark:text-teal",
  blue: "bg-[#e8f0fd] text-blue",
  green: "bg-[#e2f4e6] text-green-strong dark:text-green",
  amber: "bg-[#fff4d8] text-[#7b4a00] dark:text-amber",
  red: "bg-red-soft text-red",
  purple: "bg-[#f0ebff] text-[#5B4DA8]",
  neutral: "bg-surface-strong text-muted",
};

interface MetricCardProps {
  icon: string;
  value: string | number;
  label: string;
  hint: string;
  accent?: Accent;
  alert?: boolean;
}

function MetricCard({ icon, value, label, hint, accent = "neutral", alert = false }: MetricCardProps) {
  return (
    <article
      className={`min-h-[110px] rounded-xl border p-4 shadow-card transition-shadow hover:shadow-card-lg ${
        alert ? "border-red/30 bg-red/02" : "border-line bg-surface"
      }`}
    >
      <div className={`mb-3 grid h-9 w-9 place-items-center rounded-lg ${ACCENT_ICON[accent]}`} aria-hidden="true">
        <Icon id={icon} className="h-4.5 w-4.5" />
      </div>
      <p className="text-eyebrow text-muted">{label}</p>
      <strong className={`my-1 block text-[1.8rem] font-extrabold leading-tight tabular-nums ${alert ? "text-red" : "text-text"}`}>
        {value}
      </strong>
      <small className="text-muted">{hint}</small>
    </article>
  );
}

/* ── BlockHeader ── */

function BlockHeader({ icon, color, title, description }: { icon: string; color: string; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${color} text-white shadow-card`} aria-hidden="true">
        <Icon id={icon} className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-[1.15rem] font-extrabold tracking-tight">{title}</h2>
        <p className="text-[0.82rem] text-muted">{description}</p>
      </div>
    </div>
  );
}

/* ── PanelCard ── */

function PanelCard({ title, description, children, headerRight }: { title: string; description?: string; children: ReactNode; headerRight?: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[0.97rem] font-extrabold tracking-tight">{title}</h3>
          {description && <p className="mt-0.5 text-[0.8rem] text-muted">{description}</p>}
        </div>
        {headerRight}
      </div>
      {children}
    </section>
  );
}

/* ── select classes ── */

const selectClasses = "min-h-[38px] rounded-[8px] border border-line bg-surface-soft px-2.5 text-[0.85rem] text-text outline-none transition-colors focus:border-teal";

/* ── DashboardOverviewPage ── */

export function DashboardOverviewPage() {
  const [semana, setSemana] = useState(currentWeekValue);
  const [tecnicoFiltro, setTecnicoFiltro] = useState("");
  const semanaAtual = currentWeekValue();

  const { funcionarios } = useFuncionarios();
  const { dashboard, carregando: carregandoDash } = useDashboard(semana);
  const { tarefas, kpis, priorityTasks, criticalTasks, upcomingToday, upcomingTomorrow, upcoming3days, carregando: carregandoTarefas } =
    useTarefasDetalhadas(semana, tecnicoFiltro || undefined);
  const { ativas, finalizadas, horasTotais, carregando: carregandoViagens, alertaAbertas, tecnicosEmViagem, byTecnico, topTecnico } =
    useViagensDetalhadas(semana, tecnicoFiltro || undefined);

  const cargaFiltrada = dashboard?.cargaPorPessoa
    ? tecnicoFiltro
      ? dashboard.cargaPorPessoa.filter((c) => c.funcionario.id === tecnicoFiltro)
      : dashboard.cargaPorPessoa
    : [];
  const funcionariosFiltrados = tecnicoFiltro ? funcionarios.filter((f) => f.id === tecnicoFiltro) : funcionarios;

  /* ── KPI tasks ── */
  const kpiTasks: MetricCardProps[] = [
    { icon: "icon-task", value: kpis.total, label: "Total de tarefas da semana", hint: "planejadas na semana", accent: "teal" },
    { icon: "icon-clock", value: kpis.pendentes, label: "Pendentes", hint: "aguardando início", accent: "neutral" },
    { icon: "icon-check", value: kpis.emAndamento, label: "Em andamento", hint: "em execução pela equipe", accent: "blue" },
    { icon: "icon-check", value: kpis.concluidas, label: "Concluídas", hint: "finalizadas na semana", accent: "green" },
    {
      icon: "icon-alert", value: kpis.atrasadas, label: "Atrasadas", hint: "exigem ação imediata",
      accent: kpis.atrasadas > 0 ? "red" : "neutral", alert: kpis.atrasadas > 0,
    },
    {
      icon: "icon-clock", value: kpis.venceEm3, label: "Vencem em 3 dias", hint: "prevenir novos atrasos",
      accent: kpis.venceEm3 > 0 ? "amber" : "neutral",
    },
    {
      icon: "icon-check", value: `${kpis.taxaNoPrazo}%`, label: "No prazo", hint: "meta sugerida: 90%",
      accent: kpis.taxaNoPrazo >= 80 ? "green" : kpis.taxaNoPrazo >= 60 ? "amber" : "red",
    },
    {
      icon: "icon-team", value: kpis.comApoioAberto, label: "Pedidos de ajuda abertos", hint: "aguardando apoio",
      accent: kpis.comApoioAberto > 0 ? "amber" : "neutral",
    },
  ];

  /* ── KPI viagens ── */
  const kpiViagens: MetricCardProps[] = [
    { icon: "icon-team", value: ativas.length, label: "Em andamento", hint: "viagens abertas agora", accent: "teal" },
    { icon: "icon-check", value: finalizadas.length, label: "Finalizadas", hint: "encerradas na semana", accent: "green" },
    { icon: "icon-team", value: tecnicosEmViagem, label: "Técnicos em viagem", hint: "em deslocamento", accent: "blue" },
    { icon: "icon-clock", value: formatHoras(horasTotais), label: "Tempo total", hint: "consumido em deslocamento", accent: "neutral" },
    {
      icon: "icon-alert", value: alertaAbertas.length, label: "Alertas (> 8h)", hint: "abertas acima do limite",
      accent: alertaAbertas.length > 0 ? "red" : "neutral", alert: alertaAbertas.length > 0,
    },
    {
      icon: "icon-dashboard", value: topTecnico?.nome ?? "—", label: "Maior tempo", hint: topTecnico ? formatHoras(topTecnico.horasTotais) + " em viagem" : "sem dados",
      accent: "purple",
    },
  ];

  return (
    <div className="grid gap-8">
      {/* ── CABEÇALHO ── */}
      <header className="grid gap-4">
        <div>
          <h1 className="text-[1.35rem] font-extrabold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-[0.85rem] text-muted">
            Acompanhamento de tarefas e viagens da equipe — {formatWeekLabel(semana)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="grid gap-1">
            <span className="text-[0.78rem] font-bold text-muted">Semana</span>
            <div className="flex items-center gap-2">
              <WeekSelector value={semana} onChange={setSemana} className="w-full sm:w-[280px]" />
            </div>
          </div>

          <div className="grid gap-1 sm:ml-2">
            <span className="text-[0.78rem] font-bold text-muted">Técnico</span>
            <select
              aria-label="Filtrar por técnico"
              className={`${selectClasses} w-full sm:w-[200px]`}
              value={tecnicoFiltro}
              onChange={(e) => setTecnicoFiltro(e.target.value)}
            >
              <option value="">Todos os técnicos</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}{!f.ativo ? " (inativo)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 sm:ml-auto sm:self-end">
            <button
              type="button"
              onClick={() => setSemana(addWeeks(semana, -1))}
              className="rounded-[8px] border border-line bg-surface-soft px-3 py-2 text-[0.8rem] font-bold text-text transition-colors hover:border-teal"
            >
              Semana anterior
            </button>
            <button
              type="button"
              onClick={() => setSemana(addWeeks(semana, 1))}
              className="rounded-[8px] border border-line bg-surface-soft px-3 py-2 text-[0.8rem] font-bold text-text transition-colors hover:border-teal"
            >
              Próxima semana
            </button>
            <button
              type="button"
              onClick={() => setSemana(semanaAtual)}
              className="rounded-[8px] border border-teal bg-teal px-3 py-2 text-[0.8rem] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={semana === semanaAtual}
            >
              Semana atual
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* BLOCO 1 — EXECUÇÃO DE TAREFAS                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="grid gap-5">
        <BlockHeader
          icon="icon-task"
          color="bg-teal"
          title="Execução de Tarefas"
          description="Indicadores semanais de planejamento e execução da equipe"
        />

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {carregandoTarefas
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[110px] animate-pulse rounded-xl bg-surface-strong" />
              ))
            : kpiTasks.map((card) => <MetricCard key={card.label} {...card} />)}
        </div>

        {/* Prioridade de Ação + Carga por Técnico */}
        <div className="grid gap-5 lg:grid-cols-2">
          <PanelCard
            title="Prioridade de Ação"
            description="Tarefas que exigem atenção imediata do gestor"
          >
            <PriorityActionPanel tasks={priorityTasks} loading={carregandoTarefas} />
          </PanelCard>

          <PanelCard
            title="Carga por Técnico"
            description="Horas estimadas em tarefas abertas na semana"
          >
            {carregandoDash ? (
              <div className="grid gap-2.5">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-strong" />)}
              </div>
            ) : (
              <WorkloadList cargaPorPessoa={cargaFiltrada} />
            )}
          </PanelCard>
        </div>

        {/* Status das Tarefas + Tarefas Críticas */}
        <div className="grid gap-5 lg:grid-cols-2">
          <PanelCard
            title="Status das Tarefas"
            description="Visão rápida por situação e tipo de demanda"
          >
            {!dashboard || carregandoDash ? (
              <div className="h-40 animate-pulse rounded-xl bg-surface-strong" />
            ) : (
              <StatusChart statusChart={dashboard.statusChart} typeChart={dashboard.typeChart} />
            )}
          </PanelCard>

          <PanelCard
            title="Tarefas Críticas da Semana"
            description="Até 5 tarefas com maior risco de não entrega"
          >
            <CriticalTasksPanel tasks={criticalTasks} loading={carregandoTarefas} />
          </PanelCard>
        </div>

        {/* Próximas Entregas */}
        <PanelCard
          title="Próximas Entregas"
          description="Tarefas com vencimento nos próximos 3 dias"
        >
          <UpcomingDeliveriesPanel
            today={upcomingToday}
            tomorrow={upcomingTomorrow}
            in3days={upcoming3days}
            loading={carregandoTarefas}
          />
        </PanelCard>

        <PanelCard
          title="Pedidos de Ajuda"
          description="Solicitações, apoios e relação entre ajuda e atraso"
        >
          <HelpRequestsPanel
            tasks={tarefas}
            funcionarios={funcionariosFiltrados}
            loading={carregandoTarefas}
          />
        </PanelCard>
      </section>

      <hr className="border-line" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* BLOCO 2 — VIAGENS                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="grid gap-5">
        <BlockHeader
          icon="icon-team"
          color="bg-blue"
          title="Viagens"
          description="Deslocamentos em andamento e histórico da semana"
        />

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {carregandoViagens
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[110px] animate-pulse rounded-xl bg-surface-strong" />
              ))
            : kpiViagens.map((card) => <MetricCard key={card.label} {...card} />)}
        </div>

        {/* Viagens em andamento + Últimas finalizadas */}
        <div className="grid gap-5 lg:grid-cols-2">
          <PanelCard
            title="Viagens em Andamento"
            description="Deslocamentos ativos no momento"
            headerRight={
              ativas.length > 0 ? (
                <span className="inline-flex min-h-[24px] items-center rounded-full bg-teal px-2.5 text-[0.75rem] font-bold text-white">
                  {ativas.length} ativa{ativas.length > 1 ? "s" : ""}
                </span>
              ) : undefined
            }
          >
            <ActiveTravelsList viagens={ativas} loading={carregandoViagens} />
          </PanelCard>

          <PanelCard
            title="Últimas Viagens Finalizadas"
            description="Encerradas na semana selecionada"
          >
            <FinishedTravelsList viagens={finalizadas} loading={carregandoViagens} />
          </PanelCard>
        </div>

        {/* Viagens por técnico */}
        <PanelCard
          title="Viagens por Técnico"
          description="Totais e horas consumidas por pessoa na semana"
        >
          <TravelsByTechnicianPanel byTecnico={byTecnico} loading={carregandoViagens} />
        </PanelCard>
      </section>
    </div>
  );
}
