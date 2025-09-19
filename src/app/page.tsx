"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaPlus,
  FaTimes,
  FaSpinner,
  FaEdit,
  FaArrowLeft,
  FaTrash,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Admin {
  id: number;
  name: string;
  email: string;
  username: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    address: "",
    role: "user",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const router = useRouter();

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      if (!response.ok) throw new Error("Erro ao buscar administradores.");
      const data: Admin[] = await response.json();
      setAdmins(data.filter((u) => u.role === "admin" || u.role === "superadmin"));
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (!response.ok) throw new Error();
      setFormState({
        name: "",
        email: "",
        username: "",
        password: "",
        phone: "",
        address: "",
        role: "user",
      });
      fetchAdmins();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro desconhecido ao adicionar admin.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormState({
      name: admin.name,
      email: admin.email,
      username: admin.username,
      password: "",
      phone: admin.phone || "",
      address: admin.address || "",
      role: admin.role || "user",
    });
  };

  const handleUpdateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setFormLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${editingAdmin.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formState),
        },
      );
      if (!response.ok) throw new Error();
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro desconhecido ao atualizar admin.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este administrador?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao excluir administrador.");
      fetchAdmins();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro desconhecido ao excluir admin.");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando administradores...</span>
      </div>
    );
  }

  if (editingAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Editar Administrador</h3>
          <button
            onClick={() => setEditingAdmin(null)}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleUpdateAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={formState.name} onChange={handleInputChange} placeholder="Nome" className="p-2 rounded-lg border" required />
            <input type="email" name="email" value={formState.email} onChange={handleInputChange} placeholder="E-mail" className="p-2 rounded-lg border" required />
            <input name="username" value={formState.username} onChange={handleInputChange} placeholder="Nome de Usuário" className="p-2 rounded-lg border" required />
            <input type="password" name="password" value={formState.password} onChange={handleInputChange} placeholder="Senha" className="p-2 rounded-lg border" />
            <select name="role" value={formState.role} onChange={handleInputChange} className="p-2 rounded-lg border">
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button type="submit" className="w-full p-3 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2" disabled={formLoading}>
            {formLoading ? <FaSpinner className="animate-spin" /> : <FaEdit />}
            <span>Salvar Alterações</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-12">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800 transition-colors">
          <FaArrowLeft className="text-2xl" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Painel de Administradores</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto space-y-10">
        {/* Lista de administradores */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Lista de Administradores
          </h3>
          {admins.length === 0 ? (
            <p className="text-gray-500">Nenhum administrador encontrado.</p>
          ) : (
            <ul className="space-y-2">
              {admins.map((admin) => (
                <li
                  key={admin.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <p className="font-semibold">{admin.name}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(admin)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded flex items-center space-x-1"
                    >
                      <FaTrash /> <span>Excluir</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulário de adicionar */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Adicionar Novo Usuário ou Administrador
          </h3>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={formState.name} onChange={handleInputChange} placeholder="Nome" className="p-2 rounded-lg border" required />
              <input type="email" name="email" value={formState.email} onChange={handleInputChange} placeholder="E-mail" className="p-2 rounded-lg border" required />
              <input name="username" value={formState.username} onChange={handleInputChange} placeholder="Nome de Usuário" className="p-2 rounded-lg border" required />
              <input type="password" name="password" value={formState.password} onChange={handleInputChange} placeholder="Senha" className="p-2 rounded-lg border" required />
              <select name="role" value={formState.role} onChange={handleInputChange} className="p-2 rounded-lg border">
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit" className="w-full p-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2" disabled={formLoading}>
              {formLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              <span>Adicionar</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

















