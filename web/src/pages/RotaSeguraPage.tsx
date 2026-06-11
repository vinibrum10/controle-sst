import { Panel } from "../components/ui/Panel";
import { ModuleItem } from "../components/ui/ModuleItem";

export function RotaSeguraPage() {
  return (
    <Panel
      className="max-w-[920px]"
      title="Rota Segura"
      description="Programa para acompanhamento de rotas, desvios, inspeções de campo e planos de ação."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ModuleItem
          badge="Planejamento"
          title="Rotas da semana"
          description="Base preparada para cadastro de rotas e responsáveis."
        />
        <ModuleItem
          badge="Ações"
          title="Desvios encontrados"
          description="Área reservada para vincular ocorrências às tarefas do sistema."
        />
      </div>
    </Panel>
  );
}
