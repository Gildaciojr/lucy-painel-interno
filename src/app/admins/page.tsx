"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaPlus,
  FaTimes,
  FaSpinner,
  FaEdit,
  FaTrashAlt,
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
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const router = useRouter();

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      if (!response.ok) throw new Error("Erro ao buscar administradores.");
      const data: Admin[] = await response.json();
      setAdmins(
        data.filter(
          (user) => user.role === "admin" || user.role === "superadmin",
        ),
      );
    } catch {
      console.error("Erro ao buscar administradores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        body: JSON.stringify({ ...formState, role: "admin" }),
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
    });
  };

  const handleUpdateAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus(null);
    try {
      if (!editingAdmin) return;
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

  const renderEditForm = () => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Editar Administrador
        </h3>
        <button
          onClick={() => setEditingAdmin(null)}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <FaTimes />
        </button>
      </div>
      <form onSubmit={handleUpdateAdmin} className="space-y-4">
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
            name="phone"
            value={formState.phone}
            onChange={handleInputChange}
            placeholder="Telefone"
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
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
          disabled={formLoading}
        >
          {formLoading ? <FaSpinner className="animate-spin" /> : <FaEdit />}
          <span>Salvar Alterações</span>
        </button>
        {formStatus === "success" && (
          <p className="text-green-500">
            Administrador atualizado com sucesso!
          </p>
        )}
        {formStatus === "error" && (
          <p className="text-red-500">
            Erro ao atualizar administrador. Tente novamente.
          </p>
        )}
      </form>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando administradores...</span>
      </div>
    );
  }

  if (editingAdmin) return renderEditForm();

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
          <h1 className="text-4xl font-bold text-gray-800">
            Painel de Administradores
          </h1>
          <p className="text-gray-500">Gestão e controle de acesso</p>
        </div>
      </header>
      <main className="flex-1 container mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Adicionar Novo Administrador
          </h3>
          <form onSubmit={handleAddAdmin} className="space-y-4">
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
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
              disabled={formLoading}
            >
              {formLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPlus />
              )}
              <span>Adicionar Administrador</span>
            </button>
            {formStatus === "success" && (
              <p className="text-green-500">
                Administrador adicionado com sucesso!
              </p>
            )}
            {formStatus === "error" && (
              <p className="text-red-500">
                Erro ao adicionar administrador. Tente novamente.
              </p>
            )}
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Administradores Existentes
          </h3>
          {admins.length === 0 ? (
            <p className="text-gray-500">Nenhum administrador cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome de Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {admin.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {admin.username}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
