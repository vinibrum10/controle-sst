import { NavLink, Outlet } from "react-router-dom";

const TABS: { to: string; label: string; end?: boolean }[] = [
  { to: "/dashboard", label: "Visão Geral", end: true },
  { to: "/dashboard/tarefas", label: "Tarefas da Equipe" },
  { to: "/dashboard/rota-segura", label: "Rota Segura" },
  { to: "/dashboard/treinamentos", label: "Treinamentos" },
  { to: "/dashboard/inspecoes", label: "Inspeções" },
];

export function DashboardLayout() {
  return (
    <div className="grid gap-[18px]">
      <div className="relative -mx-1">
        <nav className="flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Visões do dashboard">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `inline-flex min-h-[42px] shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] border px-3.5 text-[0.85rem] font-extrabold transition-colors ${
                  isActive ? "border-teal bg-teal text-white shadow-card" : "border-line bg-surface text-text hover:border-teal/40"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg to-transparent" aria-hidden="true" />
      </div>
      <Outlet />
    </div>
  );
}
