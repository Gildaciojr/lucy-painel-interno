"use client";

import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaSyncAlt,
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaSpinner,
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
  name: string;
  email: string;
  plan?: string;
  source?: string;
  churned?: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value }) => (
  <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
    <div className="p-3 rounded-full bg-green-500 text-white text-xl">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function ConversionMetrics() {
  const [data, setData] = useState({
    totalUsers: 0,
    proUsers: 0,
    churnRate: 0,
    chartData: [] as { name: string; free: number; pro: number }[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversionMetrics = async () => {
      try {
        const usersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
        );
        if (!usersResponse.ok)
          throw new Error("Erro ao buscar dados de usuários.");

        const usersData: User[] = await usersResponse.json();
        const totalUsers = usersData.length;
        const proUsers = usersData.filter((user) => user.plan === "Pro").length;
        const churnedUsers = usersData.filter((user) => user.churned).length;

        const churnRate =
          totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0;

        const conversionBySource = usersData.reduce(
          (acc, user) => {
            const source = user.source || "N/A";
            if (!acc[source]) acc[source] = { name: source, free: 0, pro: 0 };
            if (user.plan === "Pro") acc[source].pro += 1;
            else acc[source].free += 1;
            return acc;
          },
          {} as Record<string, { name: string; free: number; pro: number }>,
        );

        setData({
          totalUsers,
          proUsers,
          churnRate,
          chartData: Object.values(conversionBySource),
        });
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Erro desconhecido ao carregar métricas.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversionMetrics();
  }, []);

  if (loading)
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando métricas de conversão...</span>
      </div>
    );

  if (error)
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;

  const conversionRate =
    data.totalUsers > 0
      ? ((data.proUsers / data.totalUsers) * 100).toFixed(2) + "%"
      : "0%";
  const estimatedROI = data.proUsers * 20;
  const cac = 10;
  const arpu = data.proUsers > 0 ? (data.proUsers * 20) / data.proUsers : 0;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Métricas de Conversão
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          icon={<FaChartBar />}
          title="Taxa de Conversão"
          value={conversionRate}
        />
        <MetricCard
          icon={<FaSyncAlt />}
          title="Tempo Médio de Upgrade"
          value="30 dias"
        />
        <MetricCard
          icon={<FaDollarSign />}
          title="ROI Estimado"
          value={`R$ ${estimatedROI.toFixed(2)}`}
        />
        <MetricCard
          icon={<FaChartLine />}
          title="Churn Mensal"
          value={`${data.churnRate.toFixed(2)}%`}
        />
        <MetricCard
          icon={<FaUsers />}
          title="CAC x ARPU"
          value={`R$ ${cac.toFixed(2)} x R$ ${arpu.toFixed(2)}`}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Conversão por Origem
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="free" fill="#f87171" name="Grátis" />
            <Bar dataKey="pro" fill="#10b981" name="Pro" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
