"use client";

import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaUsers,
  FaSpinner,
  FaRetweet,
  FaDollarSign,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface User {
  id: number;
  plan?: string;
}

export default function EngagementMetrics() {
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
        const [usersRes, financasRes, compromissosRes, conteudoRes, gamificacaoRes] =
          await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/financas`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/compromissos`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/conteudo`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/gamificacao`),
          ]);

        if (!usersRes.ok || !financasRes.ok || !compromissosRes.ok || !conteudoRes.ok || !gamificacaoRes.ok) {
          throw new Error("Erro ao buscar dados do servidor.");
        }

        const [users, financas, compromissos, conteudo, gamificacao]: [User[], unknown[], unknown[], unknown[], unknown[]] =
          await Promise.all([
            usersRes.json(),
            financasRes.json(),
            compromissosRes.json(),
            conteudoRes.json(),
            gamificacaoRes.json(),
          ]);

        const usageData = [
          { name: "Finanças", count: financas.length },
          { name: "Compromissos", count: compromissos.length },
          { name: "Conteúdo", count: conteudo.length },
          { name: "Gamificação", count: gamificacao.length },
        ];

        const mostUsedFeature =
          [...usageData].sort((a, b) => b.count - a.count)[0]?.name || "N/A";

        const proUsers = users.filter((u) => u.plan === "Pro").length;
        const ltv = proUsers * 50;

        setData({
          totalUsers: users.length,
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

  if (loading)
    return (
      <div className="flex justify-center items-center p-10">
        <FaSpinner className="animate-spin mr-2" /> Carregando métricas...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 p-6">
        Erro ao carregar métricas: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Métricas de Engajamento
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard icon={<FaUsers />} title="Total de Usuários" value={data.totalUsers} />
        <MetricCard icon={<FaChartLine />} title="Mais Usado" value={data.mostUsedFeature} />
        <MetricCard icon={<FaDollarSign />} title="LTV Médio" value={`R$ ${data.ltv.toFixed(2)}`} />
      </div>

      {/* Uso de recursos */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Uso de Recursos
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#6366f1" name="Uso" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Retenção */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Métricas de Retenção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard icon={<FaRetweet />} title="Retenção D1" value={data.retentionD1} />
          <MetricCard icon={<FaRetweet />} title="Retenção D7" value={data.retentionD7} />
          <MetricCard icon={<FaRetweet />} title="Retenção D30" value={data.retentionD30} />
        </div>
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




