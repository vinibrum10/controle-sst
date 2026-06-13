import { useState } from "react";
import { Panel } from "../components/ui/Panel";
import { Icon } from "../components/ui/IconSprite";
import { AparenciaTab } from "../components/configuracoes/AparenciaTab";
import { MinhaContaTab } from "../components/configuracoes/MinhaContaTab";
import { PermissoesTab } from "../components/configuracoes/PermissoesTab";

type TabId = "aparencia" | "conta" | "permissoes";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "aparencia", label: "Aparência", icon: "icon-grid" },
  { id: "conta", label: "Minha Conta", icon: "icon-team" },
  { id: "permissoes", label: "Permissões e Perfis", icon: "icon-shield" },
];

export function ConfiguracoesPage() {
  const [tab, setTab] = useState<TabId>("aparencia");

  return (
    <Panel
      className="mx-auto max-w-[920px]"
      title="Configurações"
      description="Preferências de aparência, informações da conta e perfis de acesso do sistema."
    >
      <div className="mb-4 flex flex-wrap gap-2 border-b border-line pb-3.5">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-[8px] px-3 text-[0.85rem] font-extrabold transition-all ${
              tab === item.id
                ? "bg-teal text-white shadow-card"
                : "bg-neutral-button text-text hover:bg-surface-strong"
            }`}
            onClick={() => setTab(item.id)}
          >
            <Icon id={item.icon} />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "aparencia" && <AparenciaTab />}
      {tab === "conta" && <MinhaContaTab />}
      {tab === "permissoes" && <PermissoesTab />}
    </Panel>
  );
}
