import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../lib/api";
import { Icon } from "../components/ui/IconSprite";
import { Logo } from "../components/ui/Logo";
import { BackgroundDecor } from "../components/login/BackgroundDecor";
import { HeroIllustration } from "../components/login/HeroIllustration";
import { DEFAULT_PATH } from "../components/sidebar/navigation";

/* ── Dados estáticos ── */

const QUICK_ACCESS = [
  {
    icon: "icon-dashboard",
    label: "Dashboard",
    description: "Acompanhamento de atividades e viagens",
    route: "/dashboard",
  },
  {
    icon: "icon-task",
    label: "Gestão de Atividades",
    description: "Criar e organizar atividades da equipe",
    route: "/tarefas/criar",
  },
  {
    icon: "icon-check",
    label: "Execução de Atividade",
    description: "Executar atividades, OS Interliga e viagens",
    route: "/tarefas/executar",
  },
];

const STATUS_CARDS = [
  { icon: "icon-task", label: "Atividades da semana", color: "blue" as const },
  { icon: "icon-check", label: "OS em andamento", color: "green" as const },
  { icon: "icon-team", label: "Viagens em execução", color: "amber" as const },
  { icon: "icon-dashboard", label: "Equipes em campo", color: "purple" as const },
];

const STATUS_COLORS = {
  blue: { bg: "bg-[#EEF4FF]", border: "border-[#C3D9FF]", icon: "bg-[#244C7C]/10 text-[#244C7C]", dot: "bg-[#244C7C]" },
  green: { bg: "bg-[#EDFBF3]", border: "border-[#C0EACF]", icon: "bg-[#24784c]/10 text-[#24784c]", dot: "bg-[#24784c]" },
  amber: { bg: "bg-[#FFFBEE]", border: "border-[#F5DFA0]", icon: "bg-[#a76309]/10 text-[#a76309]", dot: "bg-[#a76309]" },
  purple: { bg: "bg-[#F5F0FF]", border: "border-[#D8CFF0]", icon: "bg-[#5B4DA8]/10 text-[#5B4DA8]", dot: "bg-[#5B4DA8]" },
};

/* ── Classes reutilizáveis ── */

const inputBase =
  "w-full min-h-[44px] rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[0.92rem] text-[#102033] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#244C7C] focus:ring-2 focus:ring-[#244C7C]/15";

const labelBase = "block text-[0.8rem] font-bold text-[#102033]/70 mb-1.5";

/* ── Componente principal ── */

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
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  }

  return (
    <div className="relative flex min-h-screen flex-col text-[#102033]">
      <BackgroundDecor />

      {/* ── HEADER ── */}
      <header className="relative z-10 border-b border-[#E2E8F0]/70 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-10">
          <Logo size="sm" />
          <div className="hidden items-center gap-2 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#24784c]" aria-hidden="true" />
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#60716c]">
              Plataforma Operacional
            </span>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <main className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:items-center lg:gap-16 xl:grid-cols-[1fr_460px]">

            {/* ── COLUNA ESQUERDA: HERO ── */}
            <div className="flex flex-col gap-8">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-[#244C7C]/40" aria-hidden="true" />
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#244C7C]">
                  Sistema de Gestão Operacional
                </span>
              </div>

              {/* Título + subtítulo */}
              <div>
                <h1 className="mb-4 text-[2rem] font-extrabold leading-[1.15] tracking-tight text-[#102033] lg:text-[2.4rem]">
                  Gestão de Atividades{" "}
                  <span className="text-[#244C7C]">e Operações de Campo</span>
                </h1>
                <p className="max-w-lg text-[0.97rem] leading-relaxed text-[#102033]/60">
                  Planeje, execute e acompanhe atividades, OS Interliga e viagens da equipe técnica em um único ambiente.
                </p>
              </div>

              {/* Cards de status (estrutura pronta para dados reais) */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {STATUS_CARDS.map((card) => {
                  const c = STATUS_COLORS[card.color];
                  return (
                    <div
                      key={card.label}
                      className={`flex flex-col gap-2 rounded-xl border ${c.border} ${c.bg} px-3.5 py-3`}
                    >
                      <div className={`grid h-8 w-8 place-items-center rounded-lg ${c.icon}`} aria-hidden="true">
                        <Icon id={card.icon} className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[0.72rem] font-bold leading-tight text-[#102033]/60">{card.label}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
                          <span className="text-[0.65rem] font-bold uppercase tracking-wide text-[#102033]/40">ao vivo</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ilustração */}
              <div className="hidden lg:block">
                <HeroIllustration />
              </div>
            </div>

            {/* ── COLUNA DIREITA: LOGIN CARD ── */}
            <div className="w-full">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 p-7 shadow-[0_8px_40px_rgba(36,76,124,0.10)] backdrop-blur-sm sm:p-8">

                {/* Cabeçalho do card */}
                <div className="mb-6">
                  <h2 className="text-[1.3rem] font-extrabold tracking-tight text-[#102033]">
                    {mode === "login" ? "Entrar na plataforma" : "Criar conta"}
                  </h2>
                  <p className="mt-1 text-[0.85rem] text-[#102033]/55">
                    {mode === "login"
                      ? "Acesse com e-mail e senha cadastrados."
                      : "Preencha os dados para criar sua conta."}
                  </p>
                </div>

                {/* Formulário de login */}
                {mode === "login" && (
                  <form className="grid gap-4" onSubmit={handleLogin} noValidate>
                    <div>
                      <label htmlFor="login-email" className={labelBase}>E-mail</label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="seu@email.com"
                        className={inputBase}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="login-senha" className={labelBase}>Senha</label>
                      <input
                        id="login-senha"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className={inputBase}
                        value={loginSenha}
                        onChange={(e) => setLoginSenha(e.target.value)}
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-xl border border-[#FED7D7] bg-[#FFF5F5] px-3.5 py-2.5" role="alert">
                        <Icon id="icon-close" className="h-4 w-4 shrink-0 text-[#C53030]" aria-hidden="true" />
                        <p className="text-[0.83rem] font-medium text-[#C53030]">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#244C7C] px-5 text-[0.92rem] font-extrabold text-white transition-all hover:bg-[#1f4567] focus:outline-none focus:ring-2 focus:ring-[#244C7C] focus:ring-offset-2 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Entrando…
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </button>
                  </form>
                )}

                {/* Formulário de cadastro */}
                {mode === "register" && (
                  <form className="grid gap-4" onSubmit={handleRegister} noValidate>
                    <div>
                      <label htmlFor="reg-nome" className={labelBase}>Nome</label>
                      <input
                        id="reg-nome"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Seu nome completo"
                        className={inputBase}
                        value={registerNome}
                        onChange={(e) => setRegisterNome(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-email" className={labelBase}>E-mail</label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="seu@email.com"
                        className={inputBase}
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-senha" className={labelBase}>Senha</label>
                      <input
                        id="reg-senha"
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Mínimo 6 caracteres"
                        className={inputBase}
                        value={registerSenha}
                        onChange={(e) => setRegisterSenha(e.target.value)}
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-xl border border-[#FED7D7] bg-[#FFF5F5] px-3.5 py-2.5" role="alert">
                        <Icon id="icon-close" className="h-4 w-4 shrink-0 text-[#C53030]" aria-hidden="true" />
                        <p className="text-[0.83rem] font-medium text-[#C53030]">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#244C7C] px-5 text-[0.92rem] font-extrabold text-white transition-all hover:bg-[#1f4567] focus:outline-none focus:ring-2 focus:ring-[#244C7C] focus:ring-offset-2 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Criando conta…
                        </>
                      ) : (
                        "Criar conta"
                      )}
                    </button>
                  </form>
                )}

                {/* Toggle login / criar conta */}
                <div className="mt-4 border-t border-[#E2E8F0] pt-4 text-center">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-[0.85rem] font-semibold text-[#244C7C] underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[#244C7C] focus:ring-offset-2 rounded"
                  >
                    {mode === "login" ? "Criar uma conta" : "Já tenho conta — Entrar"}
                  </button>
                </div>

                {/* Divisor */}
                <div className="my-5 flex items-center gap-3">
                  <span className="flex-1 border-t border-[#E2E8F0]" aria-hidden="true" />
                  <span className="text-[0.72rem] font-bold uppercase tracking-widest text-[#102033]/35">Acesso rápido</span>
                  <span className="flex-1 border-t border-[#E2E8F0]" aria-hidden="true" />
                </div>

                {/* Quick access cards */}
                <div className="grid gap-2.5">
                  {QUICK_ACCESS.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3 transition-colors hover:border-[#C3D9FF] hover:bg-[#EEF4FF]"
                    >
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#244C7C]/08 text-[#244C7C]"
                        aria-hidden="true"
                        style={{ background: "rgba(36,76,124,0.08)" }}
                      >
                        <Icon id={item.icon} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.85rem] font-extrabold text-[#102033]">{item.label}</p>
                        <p className="text-[0.74rem] text-[#102033]/50">{item.description}</p>
                      </div>
                      <Icon id="icon-arrow-right" className="h-4 w-4 shrink-0 text-[#244C7C]/40" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ilustração mobile (abaixo do card de login) */}
          <div className="mt-10 flex justify-center lg:hidden">
            <HeroIllustration />
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-[#E2E8F0]/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-4 sm:flex-row lg:px-10">
          <Logo size="sm" showTagline={false} />
          <p className="text-[0.75rem] text-[#102033]/40">
            © {new Date().getFullYear()} SGEPI — Sistema de Gestão de Equipes, Programas e Indicadores.
          </p>
        </div>
      </footer>
    </div>
  );
}
