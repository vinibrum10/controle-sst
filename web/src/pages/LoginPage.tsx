import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/IconSprite";
import { DEFAULT_PATH } from "../components/sidebar/navigation";

const inputClasses = "w-full min-h-[40px] px-2.5 rounded-[8px] border border-line bg-surface-soft text-text outline-none focus:border-teal";
const labelClasses = "grid gap-1.5 text-[#c8d6d2] text-[0.83rem] font-extrabold";

export function LoginPage() {
  const { usuario, carregando, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  const [registerNome, setRegisterNome] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerSenha, setRegisterSenha] = useState("");

  if (!carregando && usuario) {
    const from = (location.state as { from?: string } | null)?.from || DEFAULT_PATH;
    return <Navigate to={from} replace />;
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(loginEmail.trim(), loginSenha);
      navigate(DEFAULT_PATH, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(registerNome.trim(), registerEmail.trim(), registerSenha);
      navigate(DEFAULT_PATH, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar conta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "register" : "login"));
    setError("");
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 60% 40%, #0f2d28 0%, #060f0d 100%)" }}
    >
      <div className="w-full max-w-[400px] p-9 rounded-2xl bg-white/4 border border-white/10 backdrop-blur-xl shadow-floating text-center">
        <div className="grid place-items-center w-[60px] h-[60px] mx-auto mb-5 rounded-[8px] bg-gradient-to-b from-[#1ee0cb] to-teal text-[#06231f] shadow-card">
          <Icon id="icon-shield" className="h-7 w-7" />
        </div>
        <h1 className="text-[1.8rem] mb-1 font-extrabold tracking-tight text-white">SGEPI</h1>
        <p className="text-[#91a39e] text-eyebrow uppercase mb-5">Sistema de Gestão de Equipes, Programas e Indicadores</p>
        <p className="text-[#91a39e] text-[0.92rem] mb-7 leading-relaxed">
          {mode === "login"
            ? "Entre com seu e-mail e senha para acessar o sistema."
            : "Crie sua conta para acessar o sistema."}
        </p>

        {mode === "login" ? (
          <form className="grid gap-3 text-left mb-2" onSubmit={handleLogin}>
            <label className={labelClasses}>
              E-mail
              <input
                type="email"
                required
                autoComplete="email"
                className={inputClasses}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              Senha
              <input
                type="password"
                required
                autoComplete="current-password"
                className={inputClasses}
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
              />
            </label>
            <Button type="submit" size="lg" full disabled={submitting}>
              Entrar
            </Button>
          </form>
        ) : (
          <form className="grid gap-3 text-left mb-2" onSubmit={handleRegister}>
            <label className={labelClasses}>
              Nome
              <input
                type="text"
                required
                autoComplete="name"
                className={inputClasses}
                value={registerNome}
                onChange={(e) => setRegisterNome(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              E-mail
              <input
                type="email"
                required
                autoComplete="email"
                className={inputClasses}
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </label>
            <label className={labelClasses}>
              Senha
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClasses}
                value={registerSenha}
                onChange={(e) => setRegisterSenha(e.target.value)}
              />
            </label>
            <Button type="submit" size="lg" full disabled={submitting}>
              Criar conta
            </Button>
          </form>
        )}

        <p className="min-h-[1.2em] mb-3 text-[#ff8a80] text-[0.85rem]">{error}</p>

        <Button type="button" variant="ghost" full onClick={toggleMode}>
          {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
        </Button>
      </div>
    </div>
  );
}
