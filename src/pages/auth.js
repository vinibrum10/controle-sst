import { $ } from "../utils/dom.js";
import { login, register } from "../hooks/useAuth.js";
import { ApiError } from "../services/api/client.js";

// Configura o formulario de login/cadastro exibido no overlay de
// autenticacao. Chama onAuthenticated() quando o usuario entra com sucesso.
export function initAuthPage(onAuthenticated) {
  const loginForm = $("#loginForm");
  const registerForm = $("#registerForm");
  const toggleBtn = $("#toggleAuthMode");
  const errorEl = $("#authError");
  const descEl = $("#authDesc");

  let mode = "login";

  function showError(message) {
    errorEl.textContent = message || "";
  }

  function setMode(next) {
    mode = next;
    loginForm.classList.toggle("hidden", mode !== "login");
    registerForm.classList.toggle("hidden", mode !== "register");
    toggleBtn.textContent = mode === "login" ? "Criar uma conta" : "Já tenho conta";
    descEl.textContent = mode === "login"
      ? "Entre com seu e-mail e senha para acessar o Controle SST."
      : "Crie sua conta para acessar o Controle SST.";
    showError("");
  }

  toggleBtn.addEventListener("click", () => setMode(mode === "login" ? "register" : "login"));

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    const email = $("#loginEmail").value.trim();
    const senha = $("#loginPassword").value;

    try {
      await login(email, senha);
      loginForm.reset();
      onAuthenticated();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : "Erro ao entrar. Tente novamente.");
    }
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");
    const nome = $("#registerName").value.trim();
    const email = $("#registerEmail").value.trim();
    const senha = $("#registerPassword").value;

    try {
      await register(nome, email, senha);
      registerForm.reset();
      onAuthenticated();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : "Erro ao criar conta. Tente novamente.");
    }
  });

  setMode("login");
}
