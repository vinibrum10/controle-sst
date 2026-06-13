import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { changePassword, updateMe } from "../../lib/auth";
import { resizePhoto } from "../../lib/image";
import { PAPEL_LABELS } from "../../lib/permissions";
import { ApiError } from "../../lib/api";

const fieldClasses =
  "min-h-[40px] w-full rounded-[8px] border border-line bg-surface-soft px-2.5 text-text outline-none transition-colors focus:border-teal focus:bg-white dark:focus:bg-surface-soft";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-muted";
const sectionTitleClasses = "text-[0.95rem] font-extrabold tracking-tight";

export function MinhaContaTab() {
  const { usuario, logout, atualizarUsuario } = useAuth();
  const { showToast } = useToast();

  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [cargo, setCargo] = useState(usuario?.cargo ?? "");
  const [setor, setSetor] = useState(usuario?.setor ?? "");
  const [telefone, setTelefone] = useState(usuario?.telefone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(usuario?.avatarUrl ?? "");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  if (!usuario) return null;

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizePhoto(file);
      setAvatarUrl(resized);
    } catch {
      event.target.value = "";
      showToast("Não consegui carregar essa imagem. Tente outra foto.");
    }
  }

  async function handleSalvarPerfil(event: FormEvent) {
    event.preventDefault();
    setSalvandoPerfil(true);
    try {
      const { usuario: atualizado } = await updateMe({
        nome,
        email,
        telefone: telefone || null,
        cargo: cargo || null,
        setor: setor || null,
        avatarUrl: avatarUrl || null,
      });
      atualizarUsuario(atualizado);
      showToast("Dados da conta atualizados com sucesso.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Erro ao atualizar os dados da conta.");
    } finally {
      setSalvandoPerfil(false);
    }
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
    <div className="grid gap-4">
      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Dados da conta</h3>
        <form className="grid gap-3" onSubmit={handleSalvarPerfil}>
          <div className="flex items-center gap-3">
            <Avatar nome={nome || usuario.nome} foto={avatarUrl} size="large" />
            <label className={`${labelClasses} flex-1`}>
              Foto de perfil
              <input type="file" accept="image/*" className={`${fieldClasses} py-1.5`} onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClasses}>
              Nome
              <input
                type="text"
                required
                className={fieldClasses}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              E-mail
              <input
                type="email"
                required
                className={fieldClasses}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              Cargo / Função
              <input
                type="text"
                className={fieldClasses}
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              Área / Setor
              <input
                type="text"
                className={fieldClasses}
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              Telefone
              <input
                type="tel"
                className={fieldClasses}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              Perfil de acesso
              <input
                type="text"
                disabled
                className={`${fieldClasses} cursor-not-allowed opacity-70`}
                value={PAPEL_LABELS[usuario.papel] || usuario.papel}
              />
            </label>
          </div>
          <p className="m-0 text-[0.78rem] text-muted">
            O perfil de acesso e a ativação da conta são definidos por um administrador em Usuários.
          </p>
          <Button type="submit" className="w-fit" disabled={salvandoPerfil}>
            Salvar dados da conta
          </Button>
        </form>
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Trocar senha</h3>
        <form className="grid gap-3" onSubmit={handleChangePassword}>
          <div className="grid gap-3 sm:grid-cols-3">
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
          </div>
          <Button type="submit" className="w-fit" disabled={trocandoSenha}>
            Atualizar senha
          </Button>
        </form>
      </article>

      <article className="grid gap-3 rounded-[8px] border border-line bg-surface-soft p-3.5 dark:bg-surface">
        <h3 className={sectionTitleClasses}>Sessão</h3>
        <p className="m-0 text-[0.85rem] text-muted">Encerrar a sessão atual neste dispositivo.</p>
        <Button
          variant="secondary"
          className="w-fit"
          onClick={() => {
            if (confirm("Sair da conta?")) logout();
          }}
        >
          Sair da conta
        </Button>
      </article>
    </div>
  );
}
