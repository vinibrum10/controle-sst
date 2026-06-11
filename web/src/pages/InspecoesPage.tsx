import { Panel } from "../components/ui/Panel";
import { ModuleItem } from "../components/ui/ModuleItem";

export function InspecoesPage() {
  return (
    <Panel
      className="max-w-[920px]"
      title="Inspeções e auditorias"
      description="Organização das inspeções planejadas, achados, responsáveis e prazos de correção."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ModuleItem
          badge="Checklists"
          title="Inspeções programadas"
          description="Base para criar checklists por área ou unidade."
        />
        <ModuleItem
          badge="Pendências"
          title="Planos de correção"
          description="Preparado para gerar tarefas a partir dos achados."
        />
      </div>
    </Panel>
  );
}
