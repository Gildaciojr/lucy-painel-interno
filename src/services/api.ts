// painel-interno/src/services/api.ts
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // tenta obter base URL das variáveis de ambiente (build-time) ou usar fallback seguro
  const env = (process.env as any)?.NEXT_PUBLIC_API_URL;
  const BASE = env && typeof env === "string" && env.length > 0
    ? env
    : "https://api.mylucy.app";

  // monta URL corretamente (suporta endpoint absoluto também)
  const url =
    endpoint.startsWith("http://") || endpoint.startsWith("https://")
      ? endpoint
      : `${BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // pega token do localStorage quando no browser (defensivo)
  let token = "";
  if (typeof window !== "undefined") {
    try {
      token = localStorage.getItem("auth_token") || "";
    } catch {
      token = "";
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // tenta extrair mensagem estruturada do body (Nest padrão) ou retornar texto bruto
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.message) throw new Error(parsed.message);
      if (typeof parsed === "string") throw new Error(parsed);
      throw new Error(JSON.stringify(parsed));
    } catch (err) {
      // se não for JSON, usa o texto direto (ou código)
      const msg = text || `Request failed with status ${response.status}`;
      throw new Error(msg);
    }
  }

  // retorna JSON quando possível, senão texto
  const txt = await response.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}


