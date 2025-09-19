"use client";

import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaCommentAlt, FaSpinner } from "react-icons/fa";

interface FeedbackItem {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface SupportResponse {
  totalFeedbacks: number;
  nps: number;
  lastFeedbacks: FeedbackItem[];
}

export default function SupportIndicators() {
  const [data, setData] = useState<SupportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics/support`);
        if (!res.ok) throw new Error("Erro ao buscar métricas de suporte.");
        const payload: SupportResponse = await res.json();
        setData(payload);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando métricas de suporte...</span>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-center p-6 text-red-500">Erro: {error || "Sem dados"}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Suporte & Qualidade</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
          <div className="p-3 rounded-full bg-yellow-500 text-white text-xl">
            <FaExclamationTriangle />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Feedbacks</h3>
            <p className="text-xl font-bold text-gray-800">{data.totalFeedbacks}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
          <div className="p-3 rounded-full bg-blue-500 text-white text-xl">
            <FaCommentAlt />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">NPS</h3>
            <p className="text-xl font-bold text-gray-800">{data.nps.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimos Feedbacks</h3>
        <ul className="space-y-3">
          {data.lastFeedbacks.length === 0 && <li>Nenhum feedback recente.</li>}
          {data.lastFeedbacks.map((f) => (
            <li key={f.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Nota: {f.rating}</span>
                <span className="text-xs text-gray-500">
                  {new Date(f.createdAt).toLocaleString()}
                </span>
              </div>
              {f.comment && <p className="mt-1 text-gray-700">“{f.comment}”</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}



