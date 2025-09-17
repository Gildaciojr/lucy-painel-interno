"use client";

import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaBug,
  FaSadTear,
  FaArrowLeft,
  FaCommentAlt,
  FaSpinner,
} from "react-icons/fa";

interface DetailItem {
  id: number;
  message: string;
  reason?: string;
  rating?: number;
}

interface FeedbackItem {
  id: number;
  rating: number;
  comment: string;
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  onClick: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  onClick,
}) => {
  return (
    <div
      className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="p-3 rounded-full bg-yellow-500 text-white text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default function SupportIndicators() {
  const [data, setData] = useState({
    unrecognizedCommands: [] as DetailItem[],
    bugsReported: [] as DetailItem[],
    cancellations: [] as DetailItem[],
    feedbacks: [] as FeedbackItem[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<
    "commands" | "bugs" | "cancellations" | "feedbacks" | null
  >(null);

  useEffect(() => {
    const fetchSupportMetrics = async () => {
      try {
        const fakeData = {
          unrecognizedCommands: [
            {
              id: 1,
              message: 'Comando "lançar gasto" digitado incorretamente.',
            },
            { id: 2, message: 'Comando "criar tarefa" com data inválida.' },
            { id: 3, message: 'Comando "salvar ideia" sem a mensagem.' },
          ],
          bugsReported: [
            { id: 1, message: "O gráfico de finanças não está carregando." },
            {
              id: 2,
              message:
                "O botão de feedback não funciona em dispositivos móveis.",
            },
          ],
          cancellations: [
            {
              id: 1,
              message: "Usuário cancelou o plano.",
              reason: "Preço elevado",
            },
            {
              id: 2,
              message: "Usuário cancelou o plano.",
              reason: "Falta de uso",
            },
          ],
        };

        const feedbacksResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/feedback`,
        );
        if (!feedbacksResponse.ok) {
          throw new Error("Erro ao buscar dados de feedback.");
        }
        const feedbacksData: FeedbackItem[] = await feedbacksResponse.json();

        setData({
          ...fakeData,
          feedbacks: feedbacksData.filter((f) => f.rating >= 8),
        });
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Erro desconhecido ao buscar métricas.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupportMetrics();
  }, []);

  const handleBack = () => {
    setSelectedView(null);
  };

  const renderDetails = () => {
    let title = "";
    let list: DetailItem[] = [];

    if (selectedView === "commands") {
      title = "Comandos Não Reconhecidos";
      list = data.unrecognizedCommands;
    } else if (selectedView === "bugs") {
      title = "Bugs Reportados";
      list = data.bugsReported;
    } else if (selectedView === "cancellations") {
      title = "Detalhes dos Cancelamentos";
      list = data.cancellations;
    } else if (selectedView === "feedbacks") {
      title = "Depoimentos Positivos";
      list = data.feedbacks.map((f) => ({
        id: f.id,
        message: `Nota: ${f.rating} - "${f.comment}"`,
      }));
    }

    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 font-bold mb-4"
        >
          <FaArrowLeft />
          <span>Voltar</span>
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <ul className="space-y-4">
          {list.map((item) => (
            <li key={item.id} className="p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold">{item.message}</p>
              {item.reason && (
                <p className="text-sm text-gray-500 mt-1">
                  Motivo: {item.reason}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando métricas de suporte...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;
  }

  if (selectedView) {
    return renderDetails();
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Indicadores de Suporte e Frustração
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<FaExclamationTriangle />}
          title="Comandos Não Reconhecidos"
          value={data.unrecognizedCommands.length}
          onClick={() => setSelectedView("commands")}
        />
        <MetricCard
          icon={<FaBug />}
          title="Bugs Reportados"
          value={data.bugsReported.length}
          onClick={() => setSelectedView("bugs")}
        />
        <MetricCard
          icon={<FaSadTear />}
          title="Cancelamentos"
          value={data.cancellations.length}
          onClick={() => setSelectedView("cancellations")}
        />
        <MetricCard
          icon={<FaCommentAlt />}
          title="Depoimentos"
          value={data.feedbacks.length}
          onClick={() => setSelectedView("feedbacks")}
        />
      </div>
    </div>
  );
}
