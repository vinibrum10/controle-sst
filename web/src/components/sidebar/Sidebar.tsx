import { useEffect, useState } from "react";
import { NavLink, useLocation, type Location } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
import { usePermissoes } from "../../hooks/usePermissao";
import { NAVIGATION_GROUPS, isNavSubGroup, type NavEntry, type NavItem } from "./navigation";
import type { ChavePermissao } from "../../lib/permissions";

const NAV_GROUP_STORAGE_KEY = "controle-sst-nav-groups";

function readNavGroupState(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(NAV_GROUP_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function containsPath(entries: NavEntry[], pathname: string): boolean {
  return entries.some((entry) => (isNavSubGroup(entry) ? containsPath(entry.items, pathname) : pathname.startsWith(entry.path)));
}

function filterEntries(entries: NavEntry[], temPermissao: (chave: ChavePermissao) => boolean): NavEntry[] {
  return entries
    .map((entry) => {
      if (isNavSubGroup(entry)) {
        const items = filterEntries(entry.items, temPermissao) as NavItem[];
        return items.length > 0 ? { ...entry, items } : null;
      }
      return !entry.permissao || temPermissao(entry.permissao) ? entry : null;
    })
    .filter((entry): entry is NavEntry => entry !== null);
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[38px] items-center gap-3 rounded-lg px-3 text-[0.86rem] font-medium transition-colors ${
    isActive ? "bg-white/[0.08] text-white" : "text-[#a3b7cc] hover:bg-white/[0.05] hover:text-white"
  }`;

const sectionLabelClass = "px-3 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[#5e7488]";

const sectionToggleClass = (isOpen: boolean) =>
  `flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] transition-colors ${
    isOpen ? "text-[#a3b7cc]" : "text-[#5e7488] hover:text-[#a3b7cc]"
  }`;

const subGroupToggleClass = (isOpen: boolean) =>
  `flex min-h-[38px] w-full items-center justify-between rounded-lg px-3 text-[0.86rem] font-medium transition-colors ${
    isOpen ? "bg-white/[0.08] text-white" : "text-[#a3b7cc] hover:bg-white/[0.05] hover:text-white"
  }`;

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className = "", onNavigate }: SidebarProps) {
  const location = useLocation();
  const { temPermissao } = usePermissoes();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(readNavGroupState);

  const visibleGroups = NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: filterEntries(group.items, temPermissao),
  })).filter((group) => group.items.length > 0);

  useEffect(() => {
    localStorage.setItem(NAV_GROUP_STORAGE_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  function isGroupOpen(groupId: string, defaultOpen: boolean, isActiveGroup: boolean) {
    return openGroups[groupId] ?? (defaultOpen || isActiveGroup);
  }

  function toggleGroup(groupId: string, defaultOpen: boolean, isActiveGroup: boolean) {
    setOpenGroups((current) => ({ ...current, [groupId]: !isGroupOpen(groupId, defaultOpen, isActiveGroup) }));
  }

  return (
    <aside
      className={`flex h-screen flex-col gap-5 overflow-y-auto border-r border-white/[0.06] bg-sidebar p-4 text-[#dbe5ee] dark:bg-[#0a141f] ${className}`}
      aria-label="Navegação principal"
    >
      <div className="flex min-h-[44px] items-center gap-3 px-1">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-white" aria-hidden="true">
          <Icon id="icon-shield" className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <strong className="block text-[0.95rem] font-bold leading-tight tracking-tight text-white">SGEPI</strong>
          <span className="mt-0.5 block truncate text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#5e7488]">
            Equipes, Programas e Indicadores
          </span>
        </div>
        <button
          type="button"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#a3b7cc] transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
          aria-label="Fechar menu"
          title="Fechar menu"
          onClick={onNavigate}
        >
          <Icon id="icon-close" className="h-4 w-4" />
        </button>
      </div>

      <nav className="grid gap-0.5 overflow-y-auto pr-0.5" aria-label="Áreas do programa">
        {visibleGroups.map((group) => {
          const isActiveGroup = containsPath(group.items, location.pathname);

          if (group.items.length === 1 && !isNavSubGroup(group.items[0])) {
            const item = group.items[0];
            return (
              <NavLink key={group.id} to={item.path} onClick={onNavigate} className={navLinkClass}>
                <Icon id={group.icon} className="h-[18px] w-[18px]" />
                <span className="truncate">{group.label}</span>
              </NavLink>
            );
          }

          const collapsible = !group.defaultOpen;
          const isOpen = isGroupOpen(group.id, group.defaultOpen, isActiveGroup);

          return (
            <div key={group.id} className="mt-4 grid gap-0.5 first:mt-0">
              {collapsible ? (
                <button
                  type="button"
                  className={sectionToggleClass(isOpen)}
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(group.id, group.defaultOpen, isActiveGroup)}
                >
                  <span>{group.label}</span>
                  <Icon id="icon-chevron" className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <div className={sectionLabelClass}>{group.label}</div>
              )}

              {isOpen && (
                <div className="grid gap-0.5">
                  {group.items.map((entry) =>
                    isNavSubGroup(entry) ? (
                      <NavSubGroupNav
                        key={entry.id}
                        subGroup={entry}
                        location={location}
                        isGroupOpen={isGroupOpen}
                        toggleGroup={toggleGroup}
                        onNavigate={onNavigate}
                      />
                    ) : (
                      <NavLink key={entry.path} to={entry.path} onClick={onNavigate} className={navLinkClass}>
                        <span className="truncate">{entry.label}</span>
                      </NavLink>
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

interface NavSubGroupNavProps {
  subGroup: Extract<NavEntry, { items: NavItem[] }>;
  location: Location;
  isGroupOpen: (groupId: string, defaultOpen: boolean, isActiveGroup: boolean) => boolean;
  toggleGroup: (groupId: string, defaultOpen: boolean, isActiveGroup: boolean) => void;
  onNavigate?: () => void;
}

function NavSubGroupNav({ subGroup, location, isGroupOpen, toggleGroup, onNavigate }: NavSubGroupNavProps) {
  const isActiveSub = containsPath(subGroup.items, location.pathname);
  const isOpen = isGroupOpen(subGroup.id, subGroup.defaultOpen, isActiveSub);

  return (
    <div className="grid gap-0.5">
      <button
        type="button"
        className={subGroupToggleClass(isOpen)}
        aria-expanded={isOpen}
        onClick={() => toggleGroup(subGroup.id, subGroup.defaultOpen, isActiveSub)}
      >
        <span className="truncate">{subGroup.label}</span>
        <Icon id="icon-chevron" className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="ml-3 grid gap-0.5 border-l border-white/[0.06] pl-3">
          {subGroup.items.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={onNavigate} className={navLinkClass}>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
