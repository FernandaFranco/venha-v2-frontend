// src/app/dashboard/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button, Card, Tag, Empty } from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import { formatDateRelative } from "../utils/dateUtils";

export default function Dashboard() {
  const router = useRouter();
  const hasFetched = useRef(false); // ← Flag para evitar dupla chamada

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carregar dados quando a página carregar
  useEffect(() => {
    // Evitar dupla chamada no React Strict Mode
    if (hasFetched.current) return;
    hasFetched.current = true;

    loadData();
  }, []); // ← Array vazio está correto

  // Combinar chamadas em uma única função
  const loadData = async () => {
    try {
      setLoading(true);

      // Chamar ambas APIs em paralelo
      const [userResponse, eventsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/events/my-events", {
          withCredentials: true,
        }),
      ]);

      setUser(userResponse.data.host);
      setEvents(eventsResponse.data.events);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);

      // Se for 401 (não autenticado), redirecionar
      if (err.response?.status === 401) {
        router.push("/auth");
      } else {
        setError("Erro ao carregar dados");
      }
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

  // LOADING STATE COM SKELETON
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-indigo-600">Venha</h1>
              <div style={{ width: 100 }}>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </main>
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
              <Button onClick={handleLogout}>Sair</Button>
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
            <p className="text-gray-600 mt-2">
              Gerencie seus eventos e acompanhe as confirmações
            </p>
          </div>

          {/* Botão para criar novo evento */}
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push("/eventos/novo")}
          >
            Novo Evento
          </Button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Lista de eventos */}
        {events.length === 0 ? (
          <Card className="text-center py-12">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhum evento criado ainda
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comece criando seu primeiro evento e compartilhe o convite
                    com seus convidados!
                  </p>
                </div>
              }
            >
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => router.push("/eventos/novo")}
              >
                Criar Primeiro Evento
              </Button>
            </Empty>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200 overflow-hidden cursor-pointer fade-in-up"
                onClick={() => router.push(`/eventos/${event.id}`)}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                  <h3 className="text-xl font-bold text-white truncate">
                    {event.title}
                  </h3>
                  <p className="text-indigo-100 mt-1">
                    {formatDateRelative(event.event_date)} às {event.start_time}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Descrição (se houver) */}
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

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
                          const link = `${window.location.origin}/invite/${event.slug}`;
                          navigator.clipboard.writeText(link);
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
