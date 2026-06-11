const TOKEN_KEY = "controle-sst-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  detalhes?: unknown;

  constructor(message: string, status: number, detalhes?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalhes = detalhes;
  }
}

interface ApiFetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, auth = true } = options;
  const finalHeaders: Record<string, string> = { ...headers };
  let payload: BodyInit | undefined;

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, { method, headers: finalHeaders, body: payload });

  if (response.status === 204) return null as T;

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (isJson && data && (data as { error?: string }).error) || "Falha na comunicacao com o servidor.";
    throw new ApiError(message, response.status, isJson ? (data as { detalhes?: unknown })?.detalhes : undefined);
  }

  return data as T;
}
