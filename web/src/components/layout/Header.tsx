import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
import { buttonClasses } from "../../lib/buttonClasses";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { formatLongDate } from "../../lib/format";
import { NAV_ITEMS } from "../sidebar/navigation";

const iconButtonClasses =
  "inline-flex min-h-[42px] min-w-[42px] items-center justify-center gap-2 rounded-[8px] border border-line bg-neutral-button px-2.5 font-extrabold text-text transition-transform hover:-translate-y-px hover:shadow-[0_10px_20px_rgba(20,33,31,0.1)] active:translate-y-0 active:shadow-none";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const today = useMemo(() => {
    const formatted = formatLongDate(new Date());
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, []);

  const pageTitle = useMemo(() => {
    const match = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
    return match?.title ?? "SGEPI";
  }, [location.pathname]);

  return (
    <header className="mb-[22px] flex flex-wrap items-end justify-between gap-[18px]">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className={`${iconButtonClasses} min-w-[44px] bg-white dark:bg-surface`}
          aria-label="Abrir/ocultar menu lateral"
          title="Abrir/ocultar menu lateral"
          onClick={onToggleSidebar}
        >
          <Icon id="icon-sidebar" />
        </button>
        <div>
          <p className="m-0 mb-[5px] text-[0.78rem] font-extrabold uppercase text-teal">{today}</p>
          <h1 className="m-0 text-xl font-extrabold">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-end gap-2.5">
        <button
          type="button"
          className={iconButtonClasses}
          aria-label="Alternar tema"
          title="Alternar tema"
          onClick={toggleTheme}
        >
          <Icon id={theme === "dark" ? "icon-sun" : "icon-moon"} />
        </button>

        <div className="flex min-h-[42px] items-center gap-2.5 rounded-[8px] border border-line bg-surface-strong px-3.5 text-[0.85rem] text-muted">
          <span className="font-extrabold text-text">{usuario?.nome}</span>
        </div>

        <button
          type="button"
          className={iconButtonClasses}
          aria-label="Sair"
          title="Sair"
          onClick={() => {
            if (confirm("Sair da conta?")) logout();
          }}
        >
          <Icon id="icon-logout" />
        </button>

        <Link to="/tarefas/criar" className={buttonClasses()}>
          <Icon id="icon-plus" />
          Criar tarefa
        </Link>
      </div>
    </header>
  );
}
