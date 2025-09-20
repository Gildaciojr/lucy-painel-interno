// painel-interno/src/services/api.ts
export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // base URL (NEXT_PUBLIC_API_URL é embutida no build do Next.js)
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";

  // só acessa localStorage no browser
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${base}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    // tenta extrair um body legível
    const text = await response.text().catch(() => "");
    let message = text || `Erro na requisição (status ${response.status})`;

    try {
      const parsed = JSON.parse(text);
      message = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    } catch {
      // texto não JSON — mantemos `message`
    }

    throw new Error(message);
  }

  // parse seguro do JSON (se não for JSON, retorna null)
  const data = await response.json().catch(() => null);
  return data as T;
}



