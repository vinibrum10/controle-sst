import { useState } from "react";
import { SummaryCard } from "../components/ui/SummaryCard";
import { QuickAccessCard } from "../components/home/QuickAccessCard";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { useApiResource } from "../hooks/useApiResource";
import { currentWeekValue } from "../lib/format";
import { preferenciasPadraoDashboard, type PreferenciaDashboardItem } from "../lib/dashboard";
import { QUICK_LINKS_BY_ID, buildSummaryCard } from "../lib/dashboardWidgets";

export function HomePage() {
  const { usuario } = useAuth();
  const [semana] = useState(currentWeekValue);
  const { dashboard, carregando, erro } = useDashboard(semana);
  const { data: preferencias } = useApiResource<PreferenciaDashboardItem[]>("/dashboard/preferencias");

  const primeiroNome = usuario?.nome?.split(" ")[0] || "";

  const prefs = preferencias ?? preferenciasPadraoDashboard();
  const metricasVisiveis = prefs.filter((item) => item.tipo === "metric" && item.visivel).sort((a, b) => a.ordem - b.ordem);
  const linksVisiveis = prefs
    .filter((item) => item.tipo === "link" && item.visivel)
    .sort((a, b) => a.ordem - b.ordem)
    .map((item) => QUICK_LINKS_BY_ID[item.id])
    .filter(Boolean);

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
        ) : metricasVisiveis.length === 0 ? (
          <p className="text-muted">Nenhum indicador selecionado. Configure em Configurações → Dashboards.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {metricasVisiveis.map((item) => {
              const card = buildSummaryCard(item.id, dashboard.metrics);
              return card && <SummaryCard key={item.id} label={card.label} value={card.value} hint={card.hint} />;
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-muted">Acesso rápido</h2>
        {linksVisiveis.length === 0 ? (
          <p className="text-muted">Nenhum acesso rápido selecionado. Configure em Configurações → Dashboards.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {linksVisiveis.map((link) => (
              <QuickAccessCard key={link.to} {...link} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
