import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/IconSprite";
import { Logo } from "../components/ui/Logo";
import { DEFAULT_PATH } from "../components/sidebar/navigation";

const inputClasses = "w-full min-h-[40px] px-2.5 rounded-[8px] border border-line bg-surface-soft text-text outline-none focus:border-teal";
const labelClasses = "grid gap-1.5 text-[0.83rem] font-extrabold text-text";

const DESTAQUES = [
  {
    icon: "icon-task",
    title: "Gestão de Tarefas",
    description: "Plano semanal, distribuição de carga por pessoa e acompanhamento do status das entregas da equipe.",
  },
  {
    icon: "icon-shield",
    title: "Rota Segura",
    description: "Ranking de equipes, avaliações de APR e controle de penalidades, tudo em um só lugar.",
  },
  {
    icon: "icon-graduation-cap",
    title: "Treinamentos",
    description: "Status, vencimentos e indicadores de treinamentos obrigatórios de toda a equipe.",
  },
];

const PREVIEW_ITEMS = [
  { icon: "icon-dashboard", label: "Dashboard", hint: "Indicadores gerais de SST" },
  { icon: "icon-task", label: "Tarefas da Equipe", hint: "Plano semanal e status" },
  { icon: "icon-shield", label: "Rota Segura", hint: "Ranking e avaliações de APR" },
  { icon: "icon-graduation-cap", label: "Treinamentos", hint: "Vencimentos e indicadores" },
];

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
    <div className="flex min-h-screen flex-col bg-bg text-text">
      {/* CABEÇALHO */}
      <header className="border-b border-line bg-surface px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo size="lg" />
          <span className="hidden text-eyebrow uppercase text-muted md:inline">Plataforma de Gestão de SST</span>
        </div>
      </header>

      <main className="flex-1">
        {/* SEÇÃO PRINCIPAL */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:gap-14 lg:px-8 lg:py-20">
          <div>
            <h1 className="mb-3 text-display font-extrabold tracking-tight">Gestão de SST centralizada para sua equipe</h1>
            <p className="mb-8 max-w-md text-[0.95rem] leading-relaxed text-muted">
              Acompanhe tarefas, Rota Segura, treinamentos e inspeções em um único painel, com indicadores
              atualizados em tempo real.
            </p>

            <div className="max-w-md rounded-2xl border border-line bg-surface p-7 shadow-card-lg">
              <h2 className="mb-1 text-[1.2rem] font-extrabold tracking-tight">
                {mode === "login" ? "Entrar na conta" : "Criar conta"}
              </h2>
              <p className="mb-5 text-[0.88rem] text-muted">
                {mode === "login" ? "Entre com seu e-mail e senha para acessar o sistema." : "Crie sua conta para acessar o sistema."}
              </p>

              {mode === "login" ? (
                <form className="grid gap-3 text-left" onSubmit={handleLogin}>
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
                <form className="grid gap-3 text-left" onSubmit={handleRegister}>
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

              <p className="mb-0 mt-3 min-h-[1.2em] text-[0.85rem] text-red">{error}</p>

              <Button type="button" variant="secondary" full onClick={toggleMode} className="mt-2">
                {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
              </Button>
            </div>
          </div>

          {/* PRÉVIA DO PAINEL */}
          <div className="rounded-2xl border border-line bg-surface-strong p-6 shadow-card-lg">
            <div className="mb-4 flex items-center gap-2 text-eyebrow uppercase text-muted">
              <Icon id="icon-dashboard" className="h-4 w-4" />
              Acesso rápido
            </div>
            <div className="grid gap-3">
              {PREVIEW_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-3.5 rounded-xl border border-line bg-surface p-4 shadow-card">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal-soft text-teal-strong dark:text-teal" aria-hidden="true">
                    <Icon id={item.icon} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-[0.92rem] font-extrabold tracking-tight">{item.label}</strong>
                    <p className="mb-0 mt-0.5 text-[0.8rem] text-muted">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DESTAQUES */}
        <section className="border-t border-line bg-surface-soft px-4 py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-[1.4rem] font-extrabold tracking-tight">
              Tudo o que você precisa para gerenciar a SST
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {DESTAQUES.map((item) => (
                <div key={item.title} className="flex flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-teal-soft text-teal-strong dark:text-teal" aria-hidden="true">
                    <Icon id={item.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-[1.05rem] font-extrabold tracking-tight">{item.title}</h3>
                  <p className="mb-0 text-[0.88rem] text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-line bg-surface px-4 py-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 md:flex-row">
          <Logo size="sm" showTagline={false} />
          <p className="mb-0 text-[0.8rem] text-muted">
            © {new Date().getFullYear()} SGEPI — Sistema de Gestão de Equipes, Programas e Indicadores.
          </p>
        </div>
      </footer>
    </div>
  );
}
