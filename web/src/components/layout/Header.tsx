import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
import { Avatar } from "../ui/Avatar";
import { buttonClasses } from "../../lib/buttonClasses";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { formatLongDate } from "../../lib/format";
import { NAV_ITEMS } from "../sidebar/navigation";

const iconButtonClasses =
  "inline-flex min-h-[42px] min-w-[42px] items-center justify-center gap-2 rounded-[8px] border border-line bg-neutral-button px-2.5 font-extrabold text-text transition-all hover:-translate-y-px hover:shadow-card-lg active:translate-y-0 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const PAPEL_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  TST: "Técnico de Segurança",
  VISUALIZADOR: "Visualizador",
  COLABORADOR: "Colaborador",
};

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
    const matches = NAV_ITEMS.filter((item) => location.pathname.startsWith(item.path));
    const best = matches.reduce<typeof matches[number] | null>(
      (acc, item) => (!acc || item.path.length > acc.path.length ? item : acc),
      null,
    );
    return best?.title ?? "SGEPI";
  }, [location.pathname]);

  const ROTAS_SEM_CRIAR_TAREFA = ["/programas/rota-segura", "/treinamentos", "/inspecoes", "/funcionarios"];
  const mostrarCriarTarefa = !ROTAS_SEM_CRIAR_TAREFA.some((rota) => location.pathname.startsWith(rota));

  return (
    <header className="mb-6 flex flex-col gap-[14px] sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className={`${iconButtonClasses} min-w-[44px] shrink-0 bg-white dark:bg-surface`}
          aria-label="Abrir/ocultar menu lateral"
          title="Abrir/ocultar menu lateral"
          onClick={onToggleSidebar}
        >
          <Icon id="icon-sidebar" />
        </button>
        <div className="min-w-0">
          <p className="m-0 mb-[5px] text-eyebrow text-teal">{today}</p>
          <h1 className="m-0 break-words text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          className={iconButtonClasses}
          aria-label="Alternar tema"
          title="Alternar tema"
          onClick={toggleTheme}
        >
          <Icon id={theme === "dark" ? "icon-sun" : "icon-moon"} />
        </button>

        {usuario && (
          <div className="flex min-h-[42px] min-w-0 items-center gap-2.5 rounded-[8px] border border-line bg-surface-strong px-2.5 text-[0.85rem]">
            <Avatar nome={usuario.nome} size="small" />
            <div className="min-w-0 leading-tight">
              <span className="block max-w-[140px] truncate font-extrabold text-text">{usuario.nome}</span>
              <span className="block truncate text-[0.74rem] text-muted">{PAPEL_LABELS[usuario.papel] || usuario.papel}</span>
            </div>
          </div>
        )}

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

        {mostrarCriarTarefa && (
          <Link to="/tarefas/criar" className={buttonClasses({ className: "min-w-0" })}>
            <Icon id="icon-plus" />
            <span className="hidden sm:inline">Criar tarefa</span>
            <span className="sm:hidden">Criar</span>
          </Link>
        )}
      </div>
    </header>
  );
}
