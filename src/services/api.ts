// src/services/api.ts
export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";

  // Só acessa localStorage no browser
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
    const text = await response.text().catch(() => "");
    let message = text || `Erro na requisição (status ${response.status})`;

    try {
      const parsed = JSON.parse(text);
      message = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    } catch {
      // não-JSON: mantém message
    }

    throw new Error(message);
  }

  const data = await response.json().catch(() => null);
  return data as T;
}




