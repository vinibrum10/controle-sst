import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "../ui/IconSprite";
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(readNavGroupState);

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
      className={`sticky top-0 flex h-screen flex-col gap-[22px] overflow-y-auto bg-gradient-to-b from-sidebar to-[#0b1917] p-[22px] text-[#f7fbfa] shadow-[12px_0_34px_rgba(15,37,34,0.14)] dark:from-[#080f0e] dark:to-[#080f0e] ${className}`}
      aria-label="Navegação principal"
    >
      <div className="flex min-h-[48px] items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-[#dff4ef] font-extrabold text-teal-strong">
          SST
        </div>
        <div>
          <strong className="block text-base">Controle SST</strong>
          <span className="mt-0.5 block text-[0.82rem] text-[#b9c9c5]">tarefas e apoio</span>
        </div>
      </div>

      <nav className="grid content-start gap-2.5 overflow-y-auto pr-0.5" aria-label="Áreas do programa">
        {NAVIGATION_GROUPS.map((group) => {
          const isActiveGroup = group.items.some((item) => location.pathname.startsWith(item.path));
          const isOpen = (openGroups[group.id] ?? group.defaultOpen) || isActiveGroup;

          return (
            <div key={group.id} className="grid gap-1.5">
              <button
                type="button"
                className={`flex min-h-[42px] w-full items-center justify-between gap-2.5 rounded-[8px] border border-transparent px-2.5 font-extrabold text-[#e6f0ed] transition-colors ${
                  isOpen ? "border-[#7ed6cc]/18 bg-sidebar-strong dark:bg-[#16221f]" : "hover:border-[#7ed6cc]/18 hover:bg-sidebar-strong dark:hover:bg-[#16221f]"
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
                <div className="ml-[18px] grid gap-1.5 border-l border-[#d4e1de]/14 pl-2.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex min-h-[38px] w-full items-center justify-start rounded-[8px] px-2.5 text-[0.88rem] font-extrabold transition-colors ${
                          isActive
                            ? "bg-[#213d38] text-white shadow-[inset_3px_0_0_#7ed6cc]"
                            : "text-[#c6d6d2] hover:bg-[#213d38] hover:text-white"
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
