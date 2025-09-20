"use client";

import React, { useState } from "react";
import { FaUser, FaLock, FaSignInAlt, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";

type NextDataWindow = Window & {
  __NEXT_DATA__?: {
    env?: {
      NEXT_PUBLIC_API_URL?: string;
    };
  };
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const getApiBase = (): string => {
    // 1) valor injetado no build (Next substitui process.env.NEXT_PUBLIC_*)
    let base = process.env.NEXT_PUBLIC_API_URL ?? "";

    // 2) fallback runtime: le __NEXT_DATA__ (Next coloca aqui em runtime em algumas configurações)
    if (!base && typeof window !== "undefined") {
      const win = window as NextDataWindow;
      base = win.__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL ?? "";
    }

    // 3) último recurso: usar origem atual (útil em dev / quando há proxy)
    if (!base && typeof window !== "undefined") {
      base = window.location.origin;
    }

    // garantimos string não vazia (padrão para evitar "undefined" em URL)
    return base || "";
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const rawIdentifier = username ?? "";
      const identifier = rawIdentifier.toString().trim();
      if (!identifier || !password) {
        throw new Error("Preencha usuário (ou e-mail) e senha.");
      }

      const isEmail = identifier.includes("@");
      const payload = isEmail
        ? { email: identifier.toLowerCase(), password }
        : { username: identifier, password };

      const base = getApiBase();
      if (!base) {
        throw new Error("API base indefinida. Verifique NEXT_PUBLIC_API_URL.");
      }

      const url = `${base.replace(/\/$/, "")}/auth/login`;
      // debug útil para ver no console qual URL está sendo chamada
      console.debug("[Login] POST ->", url, "payload:", { ...payload, password: "•••" });

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // tenta ler mensagem do backend
        let message = "Usuário ou senha incorretos.";
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      const data: {
        access_token: string;
        user: { id: number; role?: string };
      } = await response.json();

      // só permite administradores
      if (data.user.role !== "admin" && data.user.role !== "superadmin") {
        throw new Error("Acesso negado: apenas administradores podem entrar.");
      }

      // salva token e id do usuário
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("user_id", String(data.user.id));
      }

      router.push("/users");
    } catch (err: unknown) {
      console.error("[Login] erro:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-200 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Login Admin</h1>
          <p className="text-gray-500">Acesse seu painel de gestão</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6" autoComplete="on">
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="username"
              type="text"
              placeholder="Nome de usuário ou e-mail"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
              disabled={loading}
              autoComplete="username"
              inputMode="email"
              aria-label="nome de usuário ou e-mail"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
              disabled={loading}
              autoComplete="current-password"
              aria-label="senha"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full p-4 bg-green-500 text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSignInAlt />}
            <span>Entrar</span>
          </button>
        </form>
      </div>
    </div>
  );
}








