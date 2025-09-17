"use client";

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaStar,
  FaUserMinus,
  FaSpinner,
  FaPlus,
  FaCheck,
} from "react-icons/fa"; // ⬅️ removido FaTimes

interface User {
  id: number;
  name: string;
  email: string;
  plan?: string;
  source?: string;
  segment?: string;
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  onClick?: () => void;
  isActive?: boolean;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  value,
  onClick,
  isActive,
}) => {
  return (
    <div
      className={`flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md cursor-pointer transition-transform transform hover:scale-105 ${
        isActive ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-3 rounded-full bg-blue-500 text-white text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default function UserOverview() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pro" | "premium" | "free"
  >("all");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    address: "",
    plan: "Free",
    source: "",
    segment: "Autônomo",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<"success" | "error" | null>(
    null,
  );

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      if (!response.ok) {
        throw new Error("Erro ao buscar dados de usuários.");
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido ao buscar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });
      if (!response.ok) {
        throw new Error("Erro ao adicionar usuário.");
      }
      setFormStatus("success");
      setFormState({
        name: "",
        email: "",
        username: "",
        password: "",
        address: "",
        plan: "Free",
        source: "",
        segment: "Autônomo",
      });
      fetchUsers();
    } catch {
      setFormStatus("error");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando usuários...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;
  }

  const proUsers = users.filter((user) => user.plan === "Pro").length;
  const premiumUsers = users.filter((user) => user.plan === "Premium").length;
  const freeUsers = users.filter((user) => user.plan === "Free").length;

  const filteredUsers = users.filter((user) => {
    if (activeFilter === "pro") return user.plan === "Pro";
    if (activeFilter === "premium") return user.plan === "Premium";
    if (activeFilter === "free") return user.plan === "Free";
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Visão Geral de Usuários
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card
          icon={<FaUser />}
          title="Usuários Totais"
          value={users.length}
          onClick={() => setActiveFilter("all")}
          isActive={activeFilter === "all"}
        />
        <Card
          icon={<FaStar />}
          title="Planos Pro"
          value={proUsers}
          onClick={() => setActiveFilter("pro")}
          isActive={activeFilter === "pro"}
        />
        <Card
          icon={<FaStar />}
          title="Planos Premium"
          value={premiumUsers}
          onClick={() => setActiveFilter("premium")}
          isActive={activeFilter === "premium"}
        />
        <Card
          icon={<FaUserMinus />}
          title="Planos Free"
          value={freeUsers}
          onClick={() => setActiveFilter("free")}
          isActive={activeFilter === "free"}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Lista de Usuários ({filteredUsers.length})
          </h3>
          <button
            onClick={() => setShowAddUserForm(!showAddUserForm)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaPlus />
          </button>
        </div>

        {showAddUserForm && (
          <form
            onSubmit={handleAddUser}
            className="space-y-4 mb-6 p-4 bg-gray-100 rounded-lg"
          >
            <h4 className="font-semibold text-gray-700">
              Adicionar Novo Usuário
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                placeholder="Nome"
                required
                className="p-2 rounded-lg border"
              />
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleInputChange}
                placeholder="E-mail"
                required
                className="p-2 rounded-lg border"
              />
              <input
                type="text"
                name="username"
                value={formState.username}
                onChange={handleInputChange}
                placeholder="Nome de Usuário"
                required
                className="p-2 rounded-lg border"
              />
              <input
                type="password"
                name="password"
                value={formState.password}
                onChange={handleInputChange}
                placeholder="Senha"
                required
                className="p-2 rounded-lg border"
              />
              <input
                type="text"
                name="address"
                value={formState.address}
                onChange={handleInputChange}
                placeholder="Endereço Completo"
                className="p-2 rounded-lg border"
              />
              <select
                name="plan"
                value={formState.plan}
                onChange={handleInputChange}
                className="p-2 rounded-lg border"
              >
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Premium">Premium</option>
              </select>
              <input
                type="text"
                name="source"
                value={formState.source}
                onChange={handleInputChange}
                placeholder="Origem"
                className="p-2 rounded-lg border"
              />
              <input
                type="text"
                name="segment"
                value={formState.segment}
                onChange={handleInputChange}
                placeholder="Segmento"
                className="p-2 rounded-lg border"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
              disabled={formLoading}
            >
              {formLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCheck />
              )}
              <span>Adicionar</span>
            </button>
            {formStatus === "success" && (
              <p className="text-green-500">Usuário adicionado com sucesso!</p>
            )}
            {formStatus === "error" && (
              <p className="text-red-500">
                Erro ao adicionar usuário. Tente novamente.
              </p>
            )}
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Plano
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Origem
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Segmento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.plan || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.source || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.segment || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
