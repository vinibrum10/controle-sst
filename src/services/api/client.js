// Cliente HTTP central: monta a URL da API, anexa o token JWT salvo no
// navegador e padroniza o tratamento de erros das respostas.

const TOKEN_KEY = "controle-sst-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status, detalhes) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalhes = detalhes;
  }
}

export async function apiFetch(path, { method = "GET", body, headers = {}, auth = true } = {}) {
  const finalHeaders = { ...headers };
  let payload = body;

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, { method, headers: finalHeaders, body: payload });

  if (response.status === 204) return null;

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (isJson && data && data.error) || "Falha na comunicacao com o servidor.";
    throw new ApiError(message, response.status, isJson ? data?.detalhes : undefined);
  }

  return data;
}
