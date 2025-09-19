"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaPlus,
  FaTimes,
  FaSpinner,
  FaEdit,
  FaArrowLeft,
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
  const [formStatus, setFormStatus] = useState<"success" | "error" | null>(null);

  const router = useRouter();

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      if (!response.ok) throw new Error("Erro ao buscar administradores.");
      const data: Admin[] = await response.json();
      setAdmins(data.filter((user) => user.role === "admin" || user.role === "superadmin"));
    } catch {
      console.error("Erro ao buscar administradores");
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
    setFormStatus(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (!response.ok) throw new Error();
      setFormStatus("success");
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
    } catch {
      setFormStatus("error");
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
    setFormStatus(null);
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
      setFormStatus("success");
      setEditingAdmin(null);
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
    } catch {
      setFormStatus("error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    const confirmDelete = confirm(
      "Tem certeza que deseja excluir este administrador?",
    );
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error();
      fetchAdmins();
    } catch {
      console.error("Erro ao excluir administrador.");
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-12">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800 transition-colors">
          <FaArrowLeft className="text-2xl" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Painel de Administradores
          </h1>
          <p className="text-gray-500">Gestão e controle de acesso</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingAdmin ? "Editar Administrador" : "Adicionar Novo Usuário ou Administrador"}
          </h3>
          <form onSubmit={editingAdmin ? handleUpdateAdmin : handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={formState.name} onChange={handleInputChange} placeholder="Nome" className="p-2 rounded-lg border" required />
              <input type="email" name="email" value={formState.email} onChange={handleInputChange} placeholder="E-mail" className="p-2 rounded-lg border" required />
              <input name="username" value={formState.username} onChange={handleInputChange} placeholder="Nome de Usuário" className="p-2 rounded-lg border" required />
              <input type="password" name="password" value={formState.password} onChange={handleInputChange} placeholder="Senha" className="p-2 rounded-lg border" />
              <input name="phone" value={formState.phone} onChange={handleInputChange} placeholder="Telefone" className="p-2 rounded-lg border" />
              <input name="address" value={formState.address} onChange={handleInputChange} placeholder="Endereço" className="p-2 rounded-lg border" />
              <select name="role" value={formState.role} onChange={handleInputChange} className="p-2 rounded-lg border" required>
                <option value="user">Usuário (Dashboard)</option>
                <option value="admin">Administrador (Painel Interno)</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 p-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2" disabled={formLoading}>
                {formLoading ? <FaSpinner className="animate-spin" /> : editingAdmin ? <FaEdit /> : <FaPlus />}
                <span>{editingAdmin ? "Salvar Alterações" : "Adicionar"}</span>
              </button>
              {editingAdmin && (
                <button type="button" onClick={() => setEditingAdmin(null)} className="flex-1 p-3 bg-red-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2">
                  <FaTimes />
                  <span>Cancelar</span>
                </button>
              )}
            </div>
            {formStatus === "success" && <p className="text-green-500">Salvo com sucesso!</p>}
            {formStatus === "error" && <p className="text-red-500">Erro ao salvar.</p>}
          </form>
        </div>

        {/* Lista de admins */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Administradores Cadastrados ({admins.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-4 py-2">{admin.name}</td>
                    <td className="px-4 py-2">{admin.email}</td>
                    <td className="px-4 py-2">{admin.role}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button onClick={() => handleEditClick(admin)} className="text-blue-600 hover:text-blue-900">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-600 hover:text-red-900">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}


