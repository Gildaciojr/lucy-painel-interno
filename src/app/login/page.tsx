"use client";

import React, { useState } from "react";
import { FaUser, FaLock, FaSignInAlt, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) throw new Error("Usuário ou senha incorretos.");

      const data: {
        access_token: string;
        user: { id: number; role?: string };
      } = await response.json();

      // ⚡ Bloqueia usuários comuns
      if (data.user.role !== "admin" && data.user.role !== "superadmin") {
        throw new Error("Acesso negado: apenas administradores podem entrar.");
      }

      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", String(data.user.id));

      router.push("/users");
    } catch (err: unknown) {
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
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nome de usuário ou e-mail"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
              disabled={loading}
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full p-4 bg-green-500 text-white font-bold rounded-xl shadow-md hover:bg-green-500 transition-colors flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSignInAlt />}
            <span>Entrar</span>
          </button>
        </form>
      </div>
    </div>
  );
}


