"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import ConversionMetrics from "../../components/ConversionMetrics";

export default function ConversionPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-12">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="text-2xl" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Painel Administrativo Lucy
          </h1>
          <p className="text-gray-500">Conversão de usuários</p>
        </div>
      </header>
      <main className="flex-1 container mx-auto">
        <ConversionMetrics />
      </main>
    </div>
  );
}
