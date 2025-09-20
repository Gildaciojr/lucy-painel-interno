// src/components/UserOverview.tsx
"use client";

import React, { useState, useEffect, JSX } from "react";
import { FaSpinner, FaPlus, FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";
import { apiFetch } from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  plan?: string;
  source?: string;
  segment?: string;
  role?: string;
  address?: string;
}

export default function UserOverview(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "pro" | "premium" | "free">("all");

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    address: "",
    plan: "Free",
    source: "",
    segment: "Autônomo",
    role: "user",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<"success" | "error" | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<User[]>("/users");
      setUsers(data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus(null);
    try {
      await apiFetch("/users", { method: "POST", body: JSON.stringify(formState) });
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
        role: "user",
      });
      fetchUsers();
    } catch {
      setFormStatus("error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormState({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "",
      address: user.address || "",
      plan: user.plan || "Free",
      source: user.source || "",
      segment: user.segment || "Autônomo",
      role: user.role || "user",
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormLoading(true);
    try {
      await apiFetch(`/users/${editingUser.id}`, { method: "PUT", body: JSON.stringify(formState) });
      setEditingUser(null);
      setFormStatus("success");
      fetchUsers();
    } catch {
      setFormStatus("error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch {
      alert("Erro ao excluir usuário.");
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

  if (error) return <div className="text-center p-6 text-red-500">Erro: {error}</div>;

  const proUsers = users.filter((u) => u.plan === "Pro").length;
  const premiumUsers = users.filter((u) => u.plan === "Premium").length;
  const freeUsers = users.filter((u) => u.plan === "Free").length;

  const filteredUsers = users.filter((u) => {
    if (activeFilter === "pro") return u.plan === "Pro";
    if (activeFilter === "premium") return u.plan === "Premium";
    if (activeFilter === "free") return u.plan === "Free";
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Usuários</h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Totais", value: users.length, key: "all" },
          { label: "Pro", value: proUsers, key: "pro" },
          { label: "Premium", value: premiumUsers, key: "premium" },
          { label: "Free", value: freeUsers, key: "free" },
        ].map((kpi) => (
          <div
            key={kpi.key}
            className={`p-4 bg-white rounded-xl shadow-md cursor-pointer ${activeFilter === kpi.key ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setActiveFilter(kpi.key as typeof activeFilter)}
          >
            <h3 className="text-sm text-gray-500">{kpi.label}</h3>
            <p className="text-xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}</h3>
        <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={formState.name} onChange={handleInputChange} placeholder="Nome" className="p-2 border rounded-lg" required />
            <input type="email" name="email" value={formState.email} onChange={handleInputChange} placeholder="E-mail" className="p-2 border rounded-lg" required />
            <input name="username" value={formState.username} onChange={handleInputChange} placeholder="Username" className="p-2 border rounded-lg" required />
            <input type="password" name="password" value={formState.password} onChange={handleInputChange} placeholder="Senha" className="p-2 border rounded-lg" />
            <input name="address" value={formState.address} onChange={handleInputChange} placeholder="Endereço" className="p-2 border rounded-lg" />
            <select name="plan" value={formState.plan} onChange={handleInputChange} className="p-2 border rounded-lg">
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Premium">Premium</option>
            </select>
            <input name="source" value={formState.source} onChange={handleInputChange} placeholder="Origem" className="p-2 border rounded-lg" />
            <input name="segment" value={formState.segment} onChange={handleInputChange} placeholder="Segmento" className="p-2 border rounded-lg" />
            <select name="role" value={formState.role} onChange={handleInputChange} className="p-2 border rounded-lg">
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button type="submit" disabled={formLoading} className="p-3 bg-green-500 text-white rounded-lg flex items-center space-x-2">
              {formLoading ? <FaSpinner className="animate-spin" /> : editingUser ? <FaEdit /> : <FaPlus />}
              <span>{editingUser ? "Salvar Alterações" : "Adicionar"}</span>
            </button>
            {editingUser && (
              <button type="button" onClick={() => setEditingUser(null)} className="p-3 bg-red-500 text-white rounded-lg flex items-center space-x-2">
                <FaTimes />
                <span>Cancelar</span>
              </button>
            )}
          </div>

          {formStatus === "success" && <p className="text-green-500">Usuário salvo com sucesso!</p>}
          {formStatus === "error" && <p className="text-red-500">Erro ao salvar usuário.</p>}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Usuários ({filteredUsers.length})</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.plan}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900"><FaTrashAlt /></button>
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







