import { Panel } from "../components/ui/Panel";
import { ModuleItem } from "../components/ui/ModuleItem";

export function TreinamentosPage() {
  return (
    <Panel
      className="max-w-[920px]"
      title="Treinamentos"
      description="Controle dos treinamentos de SST, validade, público previsto e responsáveis."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ModuleItem
          badge="Agenda"
          title="Calendário de treinamentos"
          description="Estrutura pronta para integrar prazos e recorrências."
        />
        <ModuleItem
          badge="Registros"
          title="Evidências e listas"
          description="Espaço reservado para certificados e presença."
        />
      </div>
    </Panel>
  );
}
