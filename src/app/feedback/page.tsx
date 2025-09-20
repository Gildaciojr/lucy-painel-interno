"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaStar, FaSpinner, FaInbox, FaReply } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  adminReply?: string;
  archived?: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function FeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data: Feedback[] = await apiFetch("/feedback");
      setFeedbacks(data);
    } catch (err: unknown) {
      console.error("Erro ao carregar feedbacks:", err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return;
    try {
      await apiFetch(`/feedback/${id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ reply: replyText }),
      });
      setReplyingId(null);
      setReplyText("");
      await loadFeedbacks();
    } catch (err: unknown) {
      console.error("Erro ao enviar resposta:", err);
      // opcional: alert("Erro ao enviar resposta")
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await apiFetch(`/feedback/${id}/archive`, {
        method: "PATCH",
      });
      await loadFeedbacks();
    } catch (err: unknown) {
      console.error("Erro ao arquivar feedback:", err);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filter === "high") return f.rating >= 8;
    if (filter === "medium") return f.rating >= 5 && f.rating < 8;
    if (filter === "low") return f.rating < 5;
    return true;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin" /> <span className="ml-2">Carregando feedbacks...</span>
      </div>
    );

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
          <h1 className="text-4xl font-bold text-gray-800">Feedback dos Usuários</h1>
          <p className="text-gray-500">Total de feedbacks: {feedbacks.length}</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto">
        <div className="mb-6 flex space-x-4">
          {(["all","high","medium","low"] as Array<"all"|"high"|"medium"|"low">).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === f ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {f==="all"?"Todos":f==="high"?"Altos":f==="medium"?"Médios":"Baixos"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {filteredFeedbacks.length === 0 ? (
            <p className="text-gray-500 text-center">Nenhum feedback encontrado.</p>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((fb) => (
                <div key={fb.id} className="p-4 border rounded-lg hover:shadow transition">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <FaStar className={`${
                        fb.rating >= 8 ? "text-green-500" : fb.rating >= 5 ? "text-yellow-500" : "text-red-500"
                      }`} />
                      <span className="font-bold text-gray-800">Nota: {fb.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{fb.comment || "Sem comentário"}</p>
                  <p className="text-sm text-gray-500">
                    Usuário: {fb.user?.name || "Desconhecido"} ({fb.user?.email || "Sem e-mail"})
                  </p>

                  {fb.adminReply && (
                    <div className="mt-2 p-2 bg-green-50 border rounded text-sm text-green-700">
                      Resposta do admin: {fb.adminReply}
                    </div>
                  )}

                  {replyingId === fb.id ? (
                    <div className="mt-3 flex space-x-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escreva sua resposta..."
                        className="flex-1 p-2 border rounded"
                      />
                      <button
                        onClick={() => handleReply(fb.id)}
                        className="px-3 py-2 bg-green-500 text-white rounded flex items-center space-x-2"
                      >
                        <FaReply /><span>Enviar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => setReplyingId(fb.id)}
                        className="px-3 py-2 bg-blue-500 text-white rounded flex items-center space-x-2"
                      >
                        <FaReply /><span>Responder</span>
                      </button>
                      <button
                        onClick={() => handleArchive(fb.id)}
                        className="px-3 py-2 bg-gray-500 text-white rounded flex items-center space-x-2"
                      >
                        <FaInbox /><span>Arquivar</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



