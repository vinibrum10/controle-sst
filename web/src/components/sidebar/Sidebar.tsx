import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
import { useAuth } from "../../hooks/useAuth";
import { NAVIGATION_GROUPS } from "./navigation";

const NAV_GROUP_STORAGE_KEY = "controle-sst-nav-groups";

function readNavGroupState(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(NAV_GROUP_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className = "", onNavigate }: SidebarProps) {
  const location = useLocation();
  const { usuario } = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(readNavGroupState);

  const visibleGroups = NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || (usuario && item.roles.includes(usuario.papel))),
  })).filter((group) => group.items.length > 0);

  useEffect(() => {
    localStorage.setItem(NAV_GROUP_STORAGE_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  function toggleGroup(groupId: string, defaultOpen: boolean) {
    setOpenGroups((current) => {
      const isOpen = current[groupId] ?? defaultOpen;
      return { ...current, [groupId]: !isOpen };
    });
  }

  return (
    <aside
      className={`flex h-screen flex-col gap-[22px] overflow-y-auto bg-gradient-to-b from-sidebar to-[#0a1825] p-[22px] text-[#f5f8fb] shadow-[12px_0_34px_rgba(13,27,40,0.18)] dark:from-[#070f1a] dark:to-[#070f1a] ${className}`}
      aria-label="Navegação principal"
    >
      <div className="flex min-h-[48px] items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-gradient-to-b from-[#6fa0c8] to-teal text-white shadow-card" aria-hidden="true">
          <Icon id="icon-shield" className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <strong className="block text-base tracking-tight">SGEPI</strong>
          <span className="mt-0.5 block truncate text-eyebrow text-[#93a7b8]">Equipes, Programas e Indicadores</span>
        </div>
      </div>

      <nav className="grid content-start gap-2.5 overflow-y-auto pr-0.5" aria-label="Áreas do programa">
        {visibleGroups.map((group) => {
          const isActiveGroup = group.items.some((item) => location.pathname.startsWith(item.path));
          const isOpen = (openGroups[group.id] ?? group.defaultOpen) || isActiveGroup;

          return (
            <div key={group.id} className="grid gap-1.5">
              <button
                type="button"
                className={`flex min-h-[42px] w-full items-center justify-between gap-2.5 rounded-[8px] border border-transparent px-2.5 font-extrabold text-[#e8eef5] transition-colors ${
                  isOpen ? "border-[#6fa0c8]/18 bg-sidebar-strong dark:bg-[#17283c]" : "hover:border-[#6fa0c8]/18 hover:bg-sidebar-strong dark:hover:bg-[#17283c]"
                }`}
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group.id, group.defaultOpen)}
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Icon id={group.icon} />
                  {group.label}
                </span>
                <Icon id="icon-chevron" className={`h-4 w-4 text-[#91a39e] transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="ml-[18px] grid gap-1.5 border-l border-[#d6e0e8]/14 pl-2.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex min-h-[38px] w-full items-center justify-start rounded-[8px] px-2.5 text-[0.88rem] font-extrabold transition-colors ${
                          isActive
                            ? "bg-[#1f3a52] text-white shadow-[inset_3px_0_0_#6fa0c8]"
                            : "text-[#c9d4dc] hover:bg-[#1f3a52] hover:text-white"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
