import { login as apiLogin, register as apiRegister, getMe } from "../services/api/auth.js";
import { setToken, getToken } from "../services/api/client.js";
import { setState } from "../state/store.js";

// Verifica se ha um token salvo e se ele ainda e valido. Retorna o usuario
// autenticado ou null.
export async function restoreSession() {
  const token = getToken();
  if (!token) return null;

  try {
    const { usuario } = await getMe();
    setState({ usuario });
    return usuario;
  } catch {
    setToken(null);
    return null;
  }
}

export async function login(email, senha) {
  const { token, usuario } = await apiLogin(email, senha);
  setToken(token);
  setState({ usuario });
  return usuario;
}

export async function register(nome, email, senha) {
  const { token, usuario } = await apiRegister(nome, email, senha);
  setToken(token);
  setState({ usuario });
  return usuario;
}

export function logout() {
  setToken(null);
  setState({ usuario: null, funcionarios: [], tarefas: [], dashboard: null, disponibilidade: [], historicoAjuda: [] });
}
