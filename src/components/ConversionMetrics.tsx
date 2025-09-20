// painel-interno/src/components/ConversionMetrics.tsx
"use client";

import React, { useState, useEffect, JSX } from "react";
import { FaChartBar, FaSyncAlt, FaDollarSign, FaUsers, FaChartLine, FaSpinner } from "react-icons/fa";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { apiFetch } from "../services/api";

interface User { id: number; plan?: string; source?: string; churned?: boolean; }
interface ChartItem { name: string; free: number; pro: number; }

type ConversionState = {
  totalUsers: number;
  proUsers: number;
  churnRate: number;
  chartData: ChartItem[];
};

const MetricCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) => (
  <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
    <div className="p-3 rounded-full bg-green-500 text-white text-xl">{icon}</div>
    <div>
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function ConversionMetrics(): JSX.Element {
  const [data, setData] = useState<ConversionState>({ totalUsers: 0, proUsers: 0, churnRate: 0, chartData: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversionMetrics = async () => {
      try {
        setLoading(true);
        const users = await apiFetch<User[]>("/users");
        const totalUsers = (users ?? []).length;
        const proUsers = (users ?? []).filter((u) => u.plan === "Pro").length;
        const churned = (users ?? []).filter((u) => u.churned).length;
        const churnRate = totalUsers > 0 ? (churned / totalUsers) * 100 : 0;

        const bySource = (users ?? []).reduce<Record<string, ChartItem>>((acc, u) => {
          const src = u.source || "N/A";
          if (!acc[src]) acc[src] = { name: src, free: 0, pro: 0 };
          if (u.plan === "Pro") acc[src].pro += 1;
          else acc[src].free += 1;
          return acc;
        }, {});

        setData({
          totalUsers,
          proUsers,
          churnRate,
          chartData: Object.values(bySource),
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar métricas.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversionMetrics();
  }, []);

  if (loading) return (<div className="flex justify-center items-center p-10"><FaSpinner className="animate-spin mr-2" /> Carregando métricas de conversão...</div>);
  if (error) return (<div className="text-center text-red-500 p-6">Erro ao carregar métricas: {error}</div>);

  const conversionRate = data.totalUsers > 0 ? ((data.proUsers / data.totalUsers) * 100).toFixed(2) + "%" : "0%";
  const estimatedROI = data.proUsers * 20;
  const cac = 10;
  const arpu = data.proUsers > 0 ? (data.proUsers * 20) / data.proUsers : 0;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Métricas de Conversão</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard icon={<FaChartBar />} title="Taxa de Conversão" value={conversionRate} />
        <MetricCard icon={<FaSyncAlt />} title="Tempo Médio Upgrade" value="30 dias" />
        <MetricCard icon={<FaDollarSign />} title="ROI Estimado" value={`R$ ${estimatedROI.toFixed(2)}`} />
        <MetricCard icon={<FaChartLine />} title="Churn Mensal" value={`${data.churnRate.toFixed(2)}%`} />
        <MetricCard icon={<FaUsers />} title="CAC x ARPU" value={`R$ ${cac.toFixed(2)} x R$ ${arpu.toFixed(2)}`} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversão por Origem</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="free" name="Grátis" />
            <Bar dataKey="pro" name="Pro" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}








