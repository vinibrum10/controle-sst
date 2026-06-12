import { useState, type FormEvent } from "react";
import { Panel } from "../components/ui/Panel";
import { ModuleItem } from "../components/ui/ModuleItem";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { changePassword } from "../lib/auth";
import { ApiError } from "../lib/api";
import type { Papel } from "../types";

const PAPEL_LABELS: Record<Papel, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  COLABORADOR: "Colaborador",
};

const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";

export function ConfiguracoesPage() {
  const { usuario, logout } = useAuth();
  const { showToast } = useToast();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  function handleLogout() {
    if (window.confirm("Sair da conta?")) logout();
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();

    if (novaSenha.length < 6) {
      showToast("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      showToast("A confirmação não corresponde à nova senha.");
      return;
    }

    setTrocandoSenha(true);
    try {
      await changePassword(senhaAtual, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      showToast("Senha atualizada com sucesso.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao atualizar a senha.");
    } finally {
      setTrocandoSenha(false);
    }
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
        <article className="grid gap-2 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
          <span className="inline-flex min-h-[24px] items-center whitespace-nowrap rounded-full bg-surface-strong px-2 text-[0.76rem] font-extrabold text-muted">
            Conta
          </span>
          <strong className="text-[1rem]">Trocar senha</strong>
          <form className="grid gap-3" onSubmit={handleChangePassword}>
            <label className={labelClasses}>
              Senha atual
              <input
                type="password"
                required
                autoComplete="current-password"
                className={fieldClasses}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              Nova senha
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={fieldClasses}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              Confirmar nova senha
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={fieldClasses}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </label>
            <Button type="submit" className="w-fit" disabled={trocandoSenha}>
              Atualizar senha
            </Button>
          </form>
        </article>
      </div>
    </Panel>
  );
}
