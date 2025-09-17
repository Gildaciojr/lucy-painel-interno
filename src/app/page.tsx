"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PainelInternoPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Painel Interno de Gestão
        </h1>
        <p className="text-gray-500">Visão geral e métricas do sistema</p>
      </header>
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Bem-vindo(a) de volta!
        </h2>
        <p className="text-gray-600 mt-2">
          Navegue pelas métricas do seu sistema:
        </p>
      </main>
    </div>
  );
}
