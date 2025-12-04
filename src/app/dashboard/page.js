// src/app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carregar dados do usuário e eventos quando a página carregar
  useEffect(() => {
    loadUserData();
    loadEvents();
  }, []);

  // Carregar dados do usuário logado
  const loadUserData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        withCredentials: true,
      });
      setUser(response.data.host);
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      // Se não estiver autenticado, redirecionar para login
      router.push("/auth");
    }
  };

  // Carregar lista de eventos
  const loadEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/events/my-events",
        {
          withCredentials: true,
        }
      );
      setEvents(response.data.events);
    } catch (err) {
      setError("Erro ao carregar eventos");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fazer logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      router.push("/auth");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Venha</h1>
            </div>

            {/* User info e logout */}
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-gray-700">
                  Olá, <strong>{user.name}</strong>
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do Dashboard */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Meus Eventos</h2>
            <p className="text-gray-600 mt-1">
              Gerencie seus convites e confirmações
            </p>
          </div>

          {/* Botão para criar novo evento */}
          <button
            onClick={() => router.push("/eventos/novo")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
          >
            + Criar Evento
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Lista de eventos */}
        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Nenhum evento ainda
            </h3>
            <p className="mt-1 text-gray-500">
              Comece criando seu primeiro evento!
            </p>
            <button
              onClick={() => router.push("/eventos/novo")}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Criar Primeiro Evento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200 overflow-hidden cursor-pointer"
                onClick={() => router.push(`/eventos/${event.id}`)}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                  <h3 className="text-xl font-bold text-white truncate">
                    {event.title}
                  </h3>
                  <p className="text-indigo-100 mt-1">
                    {formatDate(event.event_date)} às {event.start_time}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">
                        {event.attendee_count}
                      </p>
                      <p className="text-xs text-gray-500">Confirmados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {event.total_adults}
                      </p>
                      <p className="text-xs text-gray-500">Adultos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {event.total_children}
                      </p>
                      <p className="text-xs text-gray-500">Crianças</p>
                    </div>
                  </div>

                  {/* Link do convite */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">
                      Link do convite:
                    </p>
                    <div className="flex items-center bg-gray-50 rounded px-3 py-2">
                      <code className="text-sm text-gray-700 flex-1 truncate">
                        /invite/{event.slug}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(
                            `http://localhost:3000/invite/${event.slug}`
                          );
                          alert("Link copiado!");
                        }}
                        className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ver detalhes →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
