// src/components/EngagementMetrics.tsx
"use client";

import React, { useState, useEffect, JSX } from "react";
import { FaChartLine, FaUsers, FaSpinner, FaDollarSign } from "react-icons/fa";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { apiFetch } from "../services/api";

interface User { id: number; plan?: string; }
export default function EngagementMetrics(): JSX.Element {
  const [data, setData] = useState({
    totalUsers: 0,
    mostUsedFeature: "N/A",
    chartData: [] as { name: string; count: number }[],
    ltv: 0,
    retentionD1: "N/A",
    retentionD7: "N/A",
    retentionD30: "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [users, financas, compromissos, conteudo, gamificacao] = await Promise.all([
          apiFetch<User[]>("/users"),
          apiFetch<unknown[]>("/financas"),
          apiFetch<unknown[]>("/compromissos"),
          apiFetch<unknown[]>("/conteudo"),
          apiFetch<unknown[]>("/gamificacao"),
        ]);

        const usageData = [
          { name: "Finanças", count: financas?.length ?? 0 },
          { name: "Compromissos", count: compromissos?.length ?? 0 },
          { name: "Conteúdo", count: conteudo?.length ?? 0 },
          { name: "Gamificação", count: gamificacao?.length ?? 0 },
        ];

        const mostUsedFeature = [...usageData].sort((a, b) => b.count - a.count)[0]?.name || "N/A";
        const proUsers = (users ?? []).filter((u) => u.plan === "Pro").length;
        const ltv = proUsers * 50;

        setData({
          totalUsers: (users ?? []).length,
          mostUsedFeature,
          chartData: usageData,
          ltv,
          retentionD1: "45%",
          retentionD7: "25%",
          retentionD30: "10%",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar métricas.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return (<div className="flex justify-center items-center p-10"><FaSpinner className="animate-spin mr-2" /> Carregando métricas...</div>);
  if (error) return (<div className="text-center text-red-500 p-6">Erro ao carregar métricas: {error}</div>);

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Métricas de Engajamento</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard icon={<FaUsers />} title="Total de Usuários" value={data.totalUsers} />
        <MetricCard icon={<FaChartLine />} title="Mais Usado" value={data.mostUsedFeature} />
        <MetricCard icon={<FaDollarSign />} title="LTV Médio" value={`R$ ${data.ltv.toFixed(2)}`} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Uso de Recursos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Uso" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
      <div className="p-3 rounded-full bg-red-500 text-white text-xl">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}







