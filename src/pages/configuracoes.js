import { $ } from "../utils/dom.js";
import { getState } from "../state/store.js";
import { escapeHtml } from "../utils/format.js";
import { logout } from "../hooks/useAuth.js";

const PAPEL_LABELS = { ADMIN: "Administrador", GESTOR: "Gestor", COLABORADOR: "Colaborador" };

let bound = false;

export async function renderConfiguracoesPage() {
  const { usuario } = getState();

  $("#accountInfo").innerHTML = usuario
    ? `
      <p><strong>Nome:</strong> ${escapeHtml(usuario.nome)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(usuario.email)}</p>
      <p><strong>Perfil:</strong> ${escapeHtml(PAPEL_LABELS[usuario.papel] || usuario.papel)}</p>
    `
    : "";

  if (!bound) {
    $("#logoutButton").addEventListener("click", () => {
      if (!confirm("Sair da conta?")) return;
      logout();
      window.location.hash = "";
      window.location.reload();
    });
    bound = true;
  }
}
