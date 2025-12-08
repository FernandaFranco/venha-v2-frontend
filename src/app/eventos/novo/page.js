// src/app/eventos/novo/page.js
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function NovoEvento() {
  const router = useRouter();

  // State do formulário
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    address_cep: "",
    address_full: "",
    allow_modifications: true,
    allow_cancellations: true,
  });

  // States de feedback
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Atualizar campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Buscar endereço pelo CEP
  const handleCepBlur = async () => {
    const cep = formData.address_cep.replace(/\D/g, "");

    if (cep.length !== 8) {
      setError("CEP deve ter 8 dígitos");
      setFormData({ ...formData, address_full: "" });
      return;
    }

    setLoadingAddress(true);
    setError("");

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

      if (response.data.erro) {
        setError("CEP não encontrado");
        setFormData({ ...formData, address_full: "" });
      } else {
        // Formatar endereço completo
        const address = `${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade} - ${response.data.uf}, ${formData.address_cep}`;

        // Atualizar address_full no formData
        setFormData({
          ...formData,
          address_full: address,
        });
      }
    } catch (err) {
      setError("Erro ao buscar CEP");
      setFormData({ ...formData, address_full: "" });
      console.error("Erro:", err);
    } finally {
      setLoadingAddress(false);
    }
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/events/create",
        formData,
        { withCredentials: true }
      );

      setSuccess("Evento criado com sucesso!");
      console.log("Evento criado:", response.data);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao criar evento");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar simples */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              ← Voltar
            </button>
            <h1 className="text-xl font-bold text-indigo-600">Venha</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* Formulário */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Título */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Criar Novo Evento
            </h2>
            <p className="text-gray-600 mt-2">
              Preencha os detalhes do seu evento para gerar o convite
            </p>
          </div>

          {/* Mensagens de feedback */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            {/* Título do Evento */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Título do Evento *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Festa de Aniversário"
              />
            </div>

            {/* Descrição */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Descreva seu evento (opcional)"
              />
            </div>

            {/* Data e Horários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Data */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Hora de Início */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Hora Início *
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Hora de Término */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Hora Fim
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* CEP */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                CEP *
              </label>
              <input
                type="text"
                name="address_cep"
                value={formData.address_cep}
                onChange={handleChange}
                onBlur={handleCepBlur}
                required
                maxLength="9"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="00000-000"
              />

              {/* Mostrar endereço carregado */}
              {loadingAddress && (
                <p className="mt-2 text-sm text-gray-500">
                  Buscando endereço...
                </p>
              )}

              {formData.address_full && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Endereço:</strong> {formData.address_full}
                  </p>
                </div>
              )}
            </div>

            {/* Checkboxes de Permissões */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_modifications"
                  checked={formData.allow_modifications}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-gray-700">
                  Permitir que convidados modifiquem suas confirmações
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_cancellations"
                  checked={formData.allow_cancellations}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-gray-700">
                  Permitir que convidados cancelem suas confirmações
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || !formData.address_full}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Criando..." : "Criar Evento"}
              </button>
            </div>

            {/* Nota */}
            {!formData.address_full && formData.address_cep && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                Digite um CEP válido para continuar
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
