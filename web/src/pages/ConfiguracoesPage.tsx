import { Panel } from "../components/ui/Panel";
import { ModuleItem } from "../components/ui/ModuleItem";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import type { Papel } from "../types";

const PAPEL_LABELS: Record<Papel, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  COLABORADOR: "Colaborador",
};

export function ConfiguracoesPage() {
  const { usuario, logout } = useAuth();

  function handleLogout() {
    if (window.confirm("Sair da conta?")) logout();
  }

  return (
    <Panel
      className="mx-auto max-w-[920px]"
      title="Configurações"
      description="Preferências gerais e informações da conta conectada."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ModuleItem
          badge="Aparência"
          title="Tema claro ou escuro"
          description="O alternador permanece disponível no topo da tela."
        />
        <article className="grid gap-2 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
          <span className="inline-flex min-h-[24px] items-center whitespace-nowrap rounded-full bg-surface-strong px-2 text-[0.76rem] font-extrabold text-muted">
            Conta
          </span>
          <strong className="text-[1rem]">Dados da conta</strong>
          {usuario && (
            <div className="my-1 grid gap-1 text-[0.9rem] [&_p]:m-0">
              <p>
                <strong>Nome:</strong> {usuario.nome}
              </p>
              <p>
                <strong>E-mail:</strong> {usuario.email}
              </p>
              <p>
                <strong>Perfil:</strong> {PAPEL_LABELS[usuario.papel] || usuario.papel}
              </p>
            </div>
          )}
          <Button variant="secondary" className="w-fit" onClick={handleLogout}>
            Sair da conta
          </Button>
        </article>
      </div>
    </Panel>
  );
}
