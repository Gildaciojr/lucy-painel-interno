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
  name: string;
  email: string;
  plan?: string;
  source?: string;
}

interface Financa {
  id: number;
  categoria: string;
  valor: string;
  userId: number;
}

interface Compromisso {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
  userId: number;
}

interface Conteudo {
  id: number;
  ideia: string;
  favorito: boolean;
  agendado: boolean;
  createdAt: string;
  userId: number;
}

interface Gamificacao {
  id: number;
  badge: string;
  dataConquista: string;
  userId: number;
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
      <div className="p-3 rounded-full bg-red-500 text-white text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

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
        const usersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
        );
        if (!usersResponse.ok)
          throw new Error("Erro ao buscar dados de usuários.");
        const usersData: User[] = await usersResponse.json();

        const financasResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/financas`,
        );
        if (!financasResponse.ok)
          throw new Error("Erro ao buscar dados de finanças.");
        const financasData: Financa[] = await financasResponse.json();

        const compromissosResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/compromissos`,
        );
        if (!compromissosResponse.ok)
          throw new Error("Erro ao buscar dados de compromissos.");
        const compromissosData: Compromisso[] =
          await compromissosResponse.json();

        const conteudoResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/conteudo`,
        );
        if (!conteudoResponse.ok)
          throw new Error("Erro ao buscar dados de conteúdo.");
        const conteudoData: Conteudo[] = await conteudoResponse.json();

        const gamificacaoResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/gamificacao`,
        );
        if (!gamificacaoResponse.ok)
          throw new Error("Erro ao buscar dados de gamificação.");
        const gamificacaoData: Gamificacao[] = await gamificacaoResponse.json();

        const usageData = [
          { name: "Finanças", count: financasData.length },
          { name: "Compromissos", count: compromissosData.length },
          { name: "Conteúdo", count: conteudoData.length },
          { name: "Gamificação", count: gamificacaoData.length },
        ];

        const mostUsedFeature =
          [...usageData].sort((a, b) => b.count - a.count)[0]?.name || "N/A";
        const proUsers = usersData.filter((user) => user.plan === "Pro").length;
        const ltv = proUsers * 50;

        const retentionD1 = "45%";
        const retentionD7 = "25%";
        const retentionD30 = "10%";

        setData({
          totalUsers: usersData.length,
          mostUsedFeature,
          chartData: usageData,
          ltv,
          retentionD1,
          retentionD7,
          retentionD30,
        });
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Erro desconhecido ao carregar métricas.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando métricas...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Métricas de Engajamento
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          icon={<FaUsers />}
          title="Total de Usuários"
          value={data.totalUsers}
        />
        <MetricCard
          icon={<FaChartLine />}
          title="Recurso Mais Usado"
          value={data.mostUsedFeature}
        />
        <MetricCard
          icon={<FaDollarSign />}
          title="LTV (Valor Vitalício)"
          value={`R$ ${data.ltv.toFixed(2)}`}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Uso de Recursos
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
            <Bar dataKey="count" fill="#8884d8" name="Uso" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Métricas de Retenção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={<FaRetweet />}
            title="Retenção D1"
            value={data.retentionD1}
          />
          <MetricCard
            icon={<FaRetweet />}
            title="Retenção D7"
            value={data.retentionD7}
          />
          <MetricCard
            icon={<FaRetweet />}
            title="Retenção D30"
            value={data.retentionD30}
          />
        </div>
      </div>
    </div>
  );
}
