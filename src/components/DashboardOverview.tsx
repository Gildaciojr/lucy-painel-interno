// src/components/DashboardOverview.tsx
"use client";

import React, { useState, useEffect, JSX } from "react";
import {
  FaUsers,
  FaChartLine,
  FaStar,
  FaDollarSign,
  FaRetweet,
  FaBug,
  FaCommentDots,
  FaSpinner,
} from "react-icons/fa";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { apiFetch } from "../services/api";

interface User { id: number; plan?: string; source?: string; churned?: boolean; }
interface Financa { id: number }
interface Compromisso { id: number }
interface Conteudo { id: number }
interface Gamificacao { id: number }
interface Feedback { id: number; rating: number }

const MetricCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) => (
  <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
    <div className="p-3 rounded-full bg-purple-500 text-white text-xl">{icon}</div>
    <div>
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function DashboardOverview(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [gamificacoes, setGamificacoes] = useState<Gamificacao[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [u, f, c, co, g, fb] = await Promise.all([
          apiFetch<User[]>("/users"),
          apiFetch<Financa[]>("/financas"),
          apiFetch<Compromisso[]>("/compromissos"),
          apiFetch<Conteudo[]>("/conteudo"),
          apiFetch<Gamificacao[]>("/gamificacao"),
          apiFetch<Feedback[]>("/feedback"),
        ]);

        setUsers(u ?? []);
        setFinancas(f ?? []);
        setCompromissos(c ?? []);
        setConteudos(co ?? []);
        setGamificacoes(g ?? []);
        setFeedbacks(fb ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading)
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando painel...</span>
      </div>
    );

  if (error) return <div className="text-center text-red-500">{error}</div>;

  const totalUsers = users.length;
  const proUsers = users.filter(u => u.plan === "Pro").length;
  const premiumUsers = users.filter(u => u.plan === "Premium").length;
  const churnRate = totalUsers ? (users.filter(u => u.churned).length / totalUsers * 100).toFixed(1) + "%" : "0%";
  const ltv = proUsers * 50;
  const roi = proUsers * 20;

  const featureUsage = [
    { name: "Finanças", count: financas.length },
    { name: "Compromissos", count: compromissos.length },
    { name: "Conteúdo", count: conteudos.length },
    { name: "Gamificação", count: gamificacoes.length },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Visão Geral do Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard icon={<FaUsers />} title="Usuários" value={totalUsers} />
        <MetricCard icon={<FaStar />} title="Pro" value={proUsers} />
        <MetricCard icon={<FaStar />} title="Premium" value={premiumUsers} />
        <MetricCard icon={<FaDollarSign />} title="LTV" value={`R$ ${ltv}`} />
        <MetricCard icon={<FaChartLine />} title="ROI" value={`R$ ${roi}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<FaRetweet />} title="Churn" value={churnRate} />
        <MetricCard icon={<FaBug />} title="Bugs simulados" value="3" />
        <MetricCard icon={<FaCommentDots />} title="Feedbacks Positivos" value={feedbacks.filter(f => f.rating >= 8).length} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Uso de Recursos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={featureUsage}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Usos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



