import { useEffect, useState } from "react";
import { NavLink, useLocation, type Location } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
import { Logo } from "../ui/Logo";
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
  `flex min-h-[40px] items-center gap-2.5 rounded-[8px] px-3 text-[0.875rem] font-medium transition-all ${
    isActive
      ? "bg-white/[0.11] text-white font-semibold border-l-[3px] border-[#4A8FE8] pl-[9px]"
      : "text-[#7BA7CC] hover:bg-white/[0.06] hover:text-white/90 border-l-[3px] border-transparent pl-[9px]"
  }`;

const groupLabelClass = "px-4 text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#4A7099] mt-5 mb-1.5 flex items-center gap-2";

const sectionToggleClass = (isOpen: boolean) =>
  `flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] transition-colors mt-5 ${
    isOpen ? "text-[#7BA7CC]" : "text-[#4A7099] hover:text-[#7BA7CC]"
  }`;

const subGroupToggleClass = (isOpen: boolean) =>
  `flex min-h-[40px] w-full items-center justify-between rounded-[8px] px-3 text-[0.875rem] font-medium transition-all border-l-[3px] border-transparent pl-[9px] ${
    isOpen ? "bg-white/[0.07] text-white/90" : "text-[#7BA7CC] hover:bg-white/[0.05] hover:text-white/80"
  }`;

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className = "", onNavigate }: SidebarProps) {
  const location = useLocation();
  const { temPermissao } = usePermissoes();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(readNavGroupState);

  const visibleGroups = NAVIGATION_GROUPS
    .filter((group) => !group.hidden)
    .map((group) => ({
      ...group,
      items: filterEntries(group.items, temPermissao),
    }))
    .filter((group) => group.items.length > 0);

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
      className={`flex h-screen flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden bg-sidebar dark:bg-[#060F1C] border-r border-white/[0.05] ${className}`}
      aria-label="Navegação principal"
    >
      {/* Logo */}
      <div className="flex min-h-[56px] items-center gap-3 px-5 shrink-0">
        <Logo variant="light" className="min-w-0 flex-1" />
        <button
          type="button"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#5A82A6] transition-colors hover:bg-white/[0.07] hover:text-white lg:hidden"
          aria-label="Fechar menu"
          title="Fechar menu"
          onClick={onNavigate}
        >
          <Icon id="icon-close" className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-4 h-px bg-white/[0.07] shrink-0" />

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-2 py-3 grid content-start gap-0.5" aria-label="Áreas do programa">
        {visibleGroups.map((group) => {
          const isActiveGroup = containsPath(group.items, location.pathname);

          if (group.items.length === 1 && !isNavSubGroup(group.items[0])) {
            const item = group.items[0];
            return (
              <NavLink key={group.id} to={item.path} onClick={onNavigate} className={navLinkClass}>
                <Icon id={group.icon} className="h-[17px] w-[17px] shrink-0" />
                <span className="truncate">{group.label}</span>
              </NavLink>
            );
          }

          const collapsible = !group.defaultOpen;
          const isOpen = isGroupOpen(group.id, group.defaultOpen, isActiveGroup);

          return (
            <div key={group.id} className="grid gap-0.5">
              {collapsible ? (
                <button
                  type="button"
                  className={sectionToggleClass(isOpen)}
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(group.id, group.defaultOpen, isActiveGroup)}
                >
                  <span className="flex items-center gap-2">
                    <Icon id={group.icon} className="h-[15px] w-[15px] shrink-0" />
                    {group.label}
                  </span>
                  <Icon id="icon-chevron" className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <div className={groupLabelClass}>
                  <Icon id={group.icon} className="h-[13px] w-[13px] shrink-0 opacity-70" />
                  {group.label}
                </div>
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

      {/* Footer */}
      <div className="mx-4 h-px bg-white/[0.06] shrink-0" />
      <div className="px-5 py-3 shrink-0">
        <p className="text-[0.65rem] text-[#324E6A] font-medium tracking-wide">SGEPI · v2.0</p>
      </div>
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
        <Icon id="icon-chevron" className={`h-3 w-3 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="ml-3 grid gap-0.5 border-l border-white/[0.07] pl-2">
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
