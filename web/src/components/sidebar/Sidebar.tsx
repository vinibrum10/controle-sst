import { useEffect, useState } from "react";
import { NavLink, useLocation, type Location } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
import { useAuth } from "../../hooks/useAuth";
import { NAVIGATION_GROUPS, isNavSubGroup, type NavEntry, type NavItem } from "./navigation";
import type { Papel } from "../../types";

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

function filterEntries(entries: NavEntry[], papel?: Papel): NavEntry[] {
  return entries
    .map((entry) => {
      if (isNavSubGroup(entry)) {
        const items = filterEntries(entry.items, papel) as NavItem[];
        return items.length > 0 ? { ...entry, items } : null;
      }
      return !entry.roles || (papel && entry.roles.includes(papel)) ? entry : null;
    })
    .filter((entry): entry is NavEntry => entry !== null);
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[38px] w-full items-center justify-start rounded-[8px] px-2.5 text-[0.88rem] font-extrabold transition-colors ${
    isActive ? "bg-[#1f3a52] text-white shadow-[inset_3px_0_0_#6fa0c8]" : "text-[#c9d4dc] hover:bg-[#1f3a52] hover:text-white"
  }`;

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
    items: filterEntries(group.items, usuario?.papel),
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
      className={`flex h-screen flex-col gap-6 overflow-y-auto bg-gradient-to-b from-sidebar to-[#0a1825] p-5 text-[#f5f8fb] shadow-[12px_0_34px_rgba(13,27,40,0.18)] dark:from-[#070f1a] dark:to-[#070f1a] ${className}`}
      aria-label="Navegação principal"
    >
      <div className="flex min-h-[48px] items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-gradient-to-b from-[#6fa0c8] to-teal text-white shadow-card" aria-hidden="true">
          <Icon id="icon-shield" className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <strong className="block text-base tracking-tight">SGEPI</strong>
          <span className="mt-0.5 block truncate text-eyebrow text-[#93a7b8]">Equipes, Programas e Indicadores</span>
        </div>
        <button
          type="button"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-white/15 text-[#c9d4dc] transition-colors hover:border-white/30 hover:text-white lg:hidden"
          aria-label="Fechar menu"
          title="Fechar menu"
          onClick={onNavigate}
        >
          <Icon id="icon-close" className="h-4 w-4" />
        </button>
      </div>

      <nav className="grid content-start gap-2.5 overflow-y-auto pr-0.5" aria-label="Áreas do programa">
        {visibleGroups.map((group) => {
          const isActiveGroup = containsPath(group.items, location.pathname);

          if (group.items.length === 1 && !isNavSubGroup(group.items[0])) {
            const item = group.items[0];
            return (
              <NavLink
                key={group.id}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex min-h-[42px] w-full items-center gap-2.5 rounded-[8px] border border-transparent px-2.5 font-extrabold transition-colors ${
                    isActive
                      ? "border-[#6fa0c8]/18 bg-sidebar-strong text-white dark:bg-[#17283c]"
                      : "text-[#e8eef5] hover:border-[#6fa0c8]/18 hover:bg-sidebar-strong dark:hover:bg-[#17283c]"
                  }`
                }
              >
                <Icon id={group.icon} />
                {group.label}
              </NavLink>
            );
          }

          const isOpen = isGroupOpen(group.id, group.defaultOpen, isActiveGroup);

          return (
            <div key={group.id} className="grid gap-1.5">
              <button
                type="button"
                className={`flex min-h-[42px] w-full items-center justify-between gap-2.5 rounded-[8px] border border-transparent px-2.5 font-extrabold text-[#e8eef5] transition-colors ${
                  isOpen ? "border-[#6fa0c8]/18 bg-sidebar-strong dark:bg-[#17283c]" : "hover:border-[#6fa0c8]/18 hover:bg-sidebar-strong dark:hover:bg-[#17283c]"
                }`}
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group.id, group.defaultOpen, isActiveGroup)}
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Icon id={group.icon} />
                  {group.label}
                </span>
                <Icon id="icon-chevron" className={`h-4 w-4 text-[#91a39e] transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="ml-[18px] grid gap-1.5 border-l border-[#d6e0e8]/14 pl-2.5">
                  {group.items.map((entry) => {
                    if (isNavSubGroup(entry)) {
                      return (
                        <NavSubGroupNav
                          key={entry.id}
                          subGroup={entry}
                          location={location}
                          isGroupOpen={isGroupOpen}
                          toggleGroup={toggleGroup}
                          onNavigate={onNavigate}
                        />
                      );
                    }

                    return (
                      <NavLink key={entry.path} to={entry.path} onClick={onNavigate} className={linkClass}>
                        {entry.label}
                      </NavLink>
                    );
                  })}
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
    <div className="grid gap-1.5">
      <button
        type="button"
        className={`flex min-h-[38px] w-full items-center justify-between rounded-[8px] px-2.5 text-[0.88rem] font-extrabold transition-colors ${
          isOpen ? "bg-[#1f3a52] text-white" : "text-[#c9d4dc] hover:bg-[#1f3a52] hover:text-white"
        }`}
        aria-expanded={isOpen}
        onClick={() => toggleGroup(subGroup.id, subGroup.defaultOpen, isActiveSub)}
      >
        <span>{subGroup.label}</span>
        <Icon id="icon-chevron" className={`h-3.5 w-3.5 text-[#91a39e] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="ml-2.5 grid gap-1.5 border-l border-[#d6e0e8]/14 pl-2.5">
          {subGroup.items.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={onNavigate} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
