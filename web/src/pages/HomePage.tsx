import { useState } from "react";
import { SummaryCard } from "../components/ui/SummaryCard";
import { QuickAccessCard, type QuickAccessLink } from "../components/home/QuickAccessCard";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { currentWeekValue } from "../lib/format";

const QUICK_LINKS: QuickAccessLink[] = [
  { to: "/dashboard", label: "Dashboard", description: "Indicadores gerais de todos os programas de SST.", icon: "icon-dashboard" },
  { to: "/dashboard/tarefas", label: "Tarefas da Equipe", description: "Plano semanal, carga por pessoa e status das tarefas.", icon: "icon-task" },
  { to: "/dashboard/rota-segura", label: "Rota Segura", description: "Ranking, avaliações de APR e penalidades das equipes.", icon: "icon-shield" },
  { to: "/dashboard/treinamentos", label: "Treinamentos", description: "Status, vencimentos e indicadores de treinamentos.", icon: "icon-check" },
  { to: "/dashboard/inspecoes", label: "Inspeções", description: "Inspeções, auditorias e achados em aberto.", icon: "icon-alert" },
  { to: "/funcionarios", label: "Funcionários", description: "Cadastro, carga de trabalho e gestão da equipe.", icon: "icon-team" },
  { to: "/ajuda", label: "Apoio / Ajuda", description: "Solicitações de apoio entre os membros da equipe.", icon: "icon-help" },
];

export function HomePage() {
  const { usuario } = useAuth();
  const [semana] = useState(currentWeekValue);
  const { dashboard, carregando, erro } = useDashboard(semana);

  const primeiroNome = usuario?.nome?.split(" ")[0] || "";

  return (
    <div className="grid gap-7">
      <div>
        <h1 className="m-0 text-[1.6rem] font-extrabold tracking-tight sm:text-[1.9rem]">
          {primeiroNome ? `Bem-vindo(a), ${primeiroNome}` : "Bem-vindo(a)"}
        </h1>
        <p className="mt-1.5 max-w-[640px] text-[0.92rem] text-muted">
          Acompanhe os indicadores das suas equipes e acesse rapidamente o Dashboard, a gestão de tarefas e os
          programas de Segurança e Saúde no Trabalho.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-muted">Resumo da semana</h2>
        {erro && <p className="text-red">{erro}</p>}
        {!dashboard ? (
          <p className={carregando ? "animate-pulse text-muted" : "text-muted"}>Carregando indicadores...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <SummaryCard label="Tarefas ativas" value={dashboard.metrics.tarefasAtivas} hint="pendentes ou em andamento" />
            <SummaryCard label="Concluídas na semana" value={dashboard.metrics.concluidas} hint="entregas registradas" />
            <SummaryCard label="Vencidas" value={dashboard.metrics.vencidas} hint={dashboard.metrics.vencidas ? "precisam de atenção" : "sem atraso aberto"} />
            <SummaryCard label="Entregas no prazo" value={`${dashboard.metrics.entregasNoPrazoPercent}%`} hint="da semana atual" />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-muted">Acesso rápido</h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <QuickAccessCard key={link.to} {...link} />
          ))}
        </div>
      </section>
    </div>
  );
}
