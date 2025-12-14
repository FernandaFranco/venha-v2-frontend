// src/app/dashboard/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Button,
  Card,
  Empty,
  Space,
  Typography,
  Divider,
  App,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
  SmileOutlined,
  CopyOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { DashboardSkeleton } from "../components/LoadingSkeleton";
import { formatDateRelative } from "../utils/dateUtils";
import Logo from "../components/Logo";

const { Title, Text, Paragraph } = Typography;

export default function Dashboard() {
  const router = useRouter();
  const { message } = App.useApp(); // ← Hook do Ant Design para mensagens
  const hasFetched = useRef(false);
  const isLoading = useRef(false); // ← Nova flag para evitar chamadas simultâneas

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dupla proteção
    if (hasFetched.current || isLoading.current) return;

    hasFetched.current = true;
    isLoading.current = true;

    loadData();
  }, []); // ← Dependências vazias

  const loadData = async () => {
    try {
      setLoading(true);

      // Adicionar delay para evitar rate limit em desenvolvimento
      await new Promise((resolve) => setTimeout(resolve, 100));

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

      if (err.response?.status === 401) {
        router.push("/auth");
      } else if (err.response?.status === 429) {
        // Tratamento específico para rate limit
        message.warning("Muitas requisições. Aguarde um momento.");
      } else {
        message.error("Erro ao carregar dados");
      }
    } finally {
      setLoading(false);
      isLoading.current = false;
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      message.success("Logout realizado com sucesso");
      router.push("/auth");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      message.error("Erro ao fazer logout");
    }
  };

  const copyInviteLink = (e, slug) => {
    e.stopPropagation(); // Evitar abrir detalhes do evento
    const link = `${window.location.origin}/invite/${slug}`;
    navigator.clipboard.writeText(link);
    message.success("Link copiado para a área de transferência!");
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo
              size="medium"
              variant="full"
              onClick={() => router.push("/dashboard")}
            />

            <Space size="middle">
              {user && (
                <Text>
                  Olá, <Text strong>{user.name}</Text>
                </Text>
              )}
              <Button onClick={handleLogout}>Sair</Button>
            </Space>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="!mb-2">
              Meus Eventos
            </Title>
            <Text type="secondary">
              Gerencie seus eventos e acompanhe as confirmações
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push("/eventos/novo")}
          >
            Novo Evento
          </Button>
        </div>

        {/* Lista de eventos */}
        {events.length === 0 ? (
          <Card className="text-center py-12">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space orientation="vertical" size="small">
                  <Title level={4}>Nenhum evento criado ainda</Title>
                  <Text type="secondary">
                    Comece criando seu primeiro evento e compartilhe o convite
                    com seus convidados!
                  </Text>
                </Space>
              }
            >
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => router.push("/eventos/novo")}
                className="mt-4"
              >
                Criar Primeiro Evento
              </Button>
            </Empty>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                hoverable
                className="fade-in-up"
                styles={{
                  body: { padding: 0 },
                }}
              >
                {/* Header do Card com gradiente */}
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 cursor-pointer"
                  onClick={() => router.push(`/eventos/${event.id}`)}
                >
                  <Title level={4} className="!text-white !mb-2 truncate">
                    {event.title}
                  </Title>
                  <Space className="text-indigo-100">
                    <CalendarOutlined />
                    <Text className="text-indigo-100">
                      {formatDateRelative(event.event_date)}
                    </Text>
                  </Space>
                  <br />
                  <Space className="text-indigo-100 mt-1">
                    <ClockCircleOutlined />
                    <Text className="text-indigo-100">{event.start_time}</Text>
                  </Space>
                </div>

                {/* Body do Card */}
                <div className="p-6">
                  {/* Descrição */}
                  {event.description && (
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      className="text-gray-600 mb-4"
                    >
                      {event.description}
                    </Paragraph>
                  )}

                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Confirmados */}
                    <Card
                      size="small"
                      className="text-center border-indigo-200"
                    >
                      <Space orientation="vertical" size={0} className="w-full">
                        <TeamOutlined className="text-2xl text-indigo-600" />
                        <div className="text-2xl font-bold text-indigo-600">
                          {event.attendee_count}
                        </div>
                        <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                          Confirmados
                        </Text>
                      </Space>
                    </Card>

                    {/* Adultos */}
                    <Card size="small" className="text-center border-green-200">
                      <Space orientation="vertical" size={0} className="w-full">
                        <UserOutlined className="text-2xl text-green-600" />
                        <div className="text-2xl font-bold text-green-600">
                          {event.total_adults}
                        </div>
                        <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                          Adultos
                        </Text>
                      </Space>
                    </Card>

                    {/* Crianças */}
                    <Card size="small" className="text-center border-blue-200">
                      <Space orientation="vertical" size={0} className="w-full">
                        <SmileOutlined className="text-2xl text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">
                          {event.total_children}
                        </div>
                        <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                          Crianças
                        </Text>
                      </Space>
                    </Card>
                  </div>

                  <Divider className="my-4" />

                  {/* Ações */}
                  <Space orientation="vertical" className="w-full" size="small">
                    <Button
                      block
                      icon={<EyeOutlined />}
                      onClick={() => router.push(`/eventos/${event.id}`)}
                    >
                      Ver Detalhes
                    </Button>

                    <Button
                      block
                      icon={<CopyOutlined />}
                      onClick={(e) => copyInviteLink(e, event.slug)}
                    >
                      Copiar Link do Convite
                    </Button>
                  </Space>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
