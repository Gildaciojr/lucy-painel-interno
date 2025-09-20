// painel-interno/src/services/api.ts
/**
 * apiFetch - wrapper fetch para o painel interno (client-side)
 *
 * - Tenta pegar base URL a partir de:
 *    1) process.env.NEXT_PUBLIC_API_URL (build-time)
 *    2) runtime __NEXT_DATA__ (quando presente)
 *    3) window.location.origin (último recurso)
 *
 * - Injeta Authorization: Bearer <token> quando houver token em localStorage
 * - Retorna JSON quando content-type = application/json, caso contrário retorna texto
 */

export type ApiFetchOptions = RequestInit;

type NextDataShape = {
  env?: {
    NEXT_PUBLIC_API_URL?: string;
  };
};

function getRuntimeBase(): string {
  // 1) build-time env
  let base = process.env.NEXT_PUBLIC_API_URL ?? "";

  // 2) runtime fallback via __NEXT_DATA__ (sem estender Window)
  if (!base && typeof window !== "undefined") {
    const win = window as unknown as { __NEXT_DATA__?: NextDataShape };
    base = win.__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL ?? "";
  }

  // 3) último recurso: origem atual
  if (!base && typeof window !== "undefined") {
    base = window.location.origin;
  }

  return base || "";
}

/** extrai mensagem legível de um valor unknown */
function extractMessage(u: unknown): string | null {
  if (typeof u === "string") return u;
  if (typeof u === "object" && u !== null) {
    const obj = u as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    try {
      return JSON.stringify(obj);
    } catch {
      return null;
    }
  }
  return null;
}

export async function apiFetch<T = unknown>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const base = getRuntimeBase();
  if (!base) throw new Error("API base indefinida (NEXT_PUBLIC_API_URL).");

  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  // headers (garantir que é Record<string,string>)
  const initialHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ? (opts.headers as Record<string, string>) : {}),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) initialHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...opts,
    headers: initialHeaders,
  });

  if (!res.ok) {
    // tenta extrair mensagem do body (json ou texto)
    let bodyText = "";

    try {
      const parsed = await res.json().catch(() => undefined);
      const msg = extractMessage(parsed);
      bodyText = msg ?? "";
    } catch (innerErr) {
      // se parse JSON falhar, tenta texto
      try {
        const txt = await res.text().catch(() => "");
        bodyText = txt;
      } catch (innerErr2) {
        // registra para depuração
        // eslint-disable-next-line no-console
        console.warn("apiFetch: erro lendo body de resposta:", innerErr, innerErr2);
        bodyText = "";
      }
    }

    throw new Error(bodyText || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }

  // se não for JSON, retorna como texto (tipo T pode ser string)
  const txt = await res.text().catch(() => "");
  return txt as unknown as T;
}

export default apiFetch;







