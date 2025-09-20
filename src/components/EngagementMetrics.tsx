// painel-interno/src/components/EngagementMetrics.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaUsers,
  FaSpinner,
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
import { apiFetch } from "../services/api";

interface User {
  id: number;
  plan?: string;
  // outros campos opcionais...
}

interface Financa {
  id: number;
  // outros campos opcionais...
}

interface Compromisso {
  id: number;
  // outros campos opcionais...
}

interface Conteudo {
  id: number;
  // outros campos opcionais...
}

interface Gamificacao {
  id: number;
  // outros campos opcionais...
}

type ChartItem = { name: string; count: number };

type EngagementState = {
  totalUsers: number;
  mostUsedFeature: string;
  chartData: ChartItem[];
  ltv: number;
  retentionD1: string;
  retentionD7: string;
  retentionD30: string;
};

export default function EngagementMetrics(): React.ReactElement {
  const [data, setData] = useState<EngagementState>({
    totalUsers: 0,
    mostUsedFeature: "N/A",
    chartData: [],
    ltv: 0,
    retentionD1: "N/A",
    retentionD7: "N/A",
    retentionD30: "N/A",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          usersRes,
          financasRes,
          compromissosRes,
          conteudoRes,
          gamificacaoRes,
        ] = await Promise.all([
          apiFetch("/users"),
          apiFetch("/financas"),
          apiFetch("/compromissos"),
          apiFetch("/conteudo"),
          apiFetch("/gamificacao"),
        ]);

        const users = usersRes as User[];
        const financas = financasRes as Financa[];
        const compromissos = compromissosRes as Compromisso[];
        const conteudos = conteudoRes as Conteudo[];
        const gamificacoes = gamificacaoRes as Gamificacao[];

        const usageData: ChartItem[] = [
          { name: "Finanças", count: financas.length },
          { name: "Compromissos", count: compromissos.length },
          { name: "Conteúdo", count: conteudos.length },
          { name: "Gamificação", count: gamificacoes.length },
        ];

        const mostUsedFeature =
          [...usageData].sort((a, b) => b.count - a.count)[0]?.name || "N/A";

        const proUsers = users.filter((u) => u.plan === "Pro").length;
        const ltv = proUsers * 50; // regra de negócio simulada

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard icon={<FaUsers />} title="Total de Usuários" value={data.totalUsers} />
        <MetricCard icon={<FaChartLine />} title="Mais Usado" value={data.mostUsedFeature} />
        <MetricCard icon={<FaDollarSign />} title="LTV Médio" value={`R$ ${data.ltv.toFixed(2)}`} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Uso de recursos
        </h3>
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

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Retenção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RetentionCard title="Retenção D1" value={data.retentionD1} />
          <RetentionCard title="Retenção D7" value={data.retentionD7} />
          <RetentionCard title="Retenção D30" value={data.retentionD30} />
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

function RetentionCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  );
}






