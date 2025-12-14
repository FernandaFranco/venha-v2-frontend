// src/app/eventos/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Button,
  Table,
  Card,
  Statistic,
  Modal,
  Input,
  Tag,
  Space,
  Popconfirm,
  Alert,
  App,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SmileOutlined,
  TeamOutlined,
  CopyOutlined as DuplicateOutlined,
} from "@ant-design/icons";
import { EventDetailsSkeleton } from "../../components/LoadingSkeleton";
import { formatDateBR } from "../../utils/dateUtils";
import Logo from "../../components/Logo";

const { Text } = Typography;

export default function EventoDetalhes() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;
  const { message } = App.useApp();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    num_adults: 1,
    num_children: 0,
    comments: "",
  });

  useEffect(() => {
    loadEventDetails();
    loadAttendees();
  }, [eventId]);

  // Carregar detalhes do evento
  const loadEventDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/events/my-events`,
        { withCredentials: true }
      );

      const foundEvent = response.data.events.find(
        (e) => e.id === parseInt(eventId)
      );

      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        message.error("Evento não encontrado");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Erro ao carregar evento:", err);
      message.error("Erro ao carregar evento");
    }
  };

  // Carregar lista de convidados
  const loadAttendees = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}/attendees`,
        { withCredentials: true }
      );
      setAttendees(response.data.attendees);
    } catch (err) {
      console.error("Erro ao carregar convidados:", err);
      message.error("Erro ao carregar convidados");
    } finally {
      setLoading(false);
    }
  };

  // Copiar link do convite
  const copyInviteLink = () => {
    if (event) {
      const link = `${window.location.origin}/invite/${event.slug}`;
      navigator.clipboard.writeText(link);
      message.success("Link copiado para a área de transferência!");
    }
  };

  // Exportar CSV
  const exportCSV = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}/export-csv`,
        {
          withCredentials: true,
          responseType: "blob", // Importante para download de arquivo
        }
      );

      // Criar download do arquivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `evento_${eventId}_convidados.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success("CSV exportado com sucesso!");
    } catch (err) {
      console.error("Erro ao exportar CSV:", err);
      message.error("Erro ao exportar CSV");
    }
  };

  // Abrir modal de edição
  const openEditModal = (attendee) => {
    setEditingAttendee(attendee);
    setEditForm({
      name: attendee.name,
      num_adults: attendee.num_adults,
      num_children: attendee.num_children,
      comments: attendee.comments || "",
    });
    setEditModalVisible(true);
  };

  // Salvar edição
  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/events/${eventId}/attendees/${editingAttendee.id}`,
        editForm,
        { withCredentials: true }
      );

      message.success("Convidado atualizado com sucesso!");
      setEditModalVisible(false);
      loadAttendees();
      loadEventDetails(); // Recarregar estatísticas
    } catch (err) {
      console.error("Erro ao atualizar convidado:", err);
      message.error("Erro ao atualizar convidado");
    }
  };

  // Deletar convidado
  const handleDelete = async (attendeeId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/events/${eventId}/attendees/${attendeeId}`,
        { withCredentials: true }
      );

      message.success("Convidado removido com sucesso!");
      loadAttendees();
      loadEventDetails(); // Recarregar estatísticas
    } catch (err) {
      console.error("Erro ao deletar convidado:", err);
      message.error("Erro ao deletar convidado");
    }
  };

  // ... após handleDelete (convidado), adicione:

  // ========== FUNÇÕES DE GERENCIAMENTO DO EVENTO ==========

  // Editar evento
  const handleEditEvent = () => {
    router.push(`/eventos/${eventId}/editar`);
  };

  // Duplicar evento
  const handleDuplicateEvent = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/duplicate`,
        {},
        { withCredentials: true }
      );

      message.success("Evento duplicado com sucesso!");

      setTimeout(() => {
        router.push(`/eventos/${response.data.event.id}`);
      }, 1000);
    } catch (err) {
      console.error("Erro ao duplicar evento:", err);
      message.error("Erro ao duplicar evento");
    }
  };

  // Deletar evento
  const handleDeleteEvent = () => {
    Modal.confirm({
      title: "Deletar Evento?",
      content: (
        <div>
          <p>Tem certeza que deseja deletar este evento?</p>
          <p className="text-red-600 mt-2">
            <strong>Atenção:</strong> Todos os {attendees.length} convidados e
            suas confirmações serão removidos permanentemente. Esta ação não
            pode ser desfeita.
          </p>
        </div>
      ),
      okText: "Sim, deletar",
      cancelText: "Cancelar",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
            withCredentials: true,
          });

          message.success("Evento deletado com sucesso");
          router.push("/dashboard");
        } catch (err) {
          console.error("Erro ao deletar evento:", err);
          message.error("Erro ao deletar evento");
        }
      },
    });
  };

  // Formatar data
  const formatDate = (dateString) => {
    // Parse manual para evitar conversão UTC
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month é 0-indexed
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Colunas da tabela
  const columns = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "WhatsApp",
      dataIndex: "whatsapp_number",
      key: "whatsapp",
      render: (phone) => (
        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {phone}
        </a>
      ),
    },
    {
      title: "Adultos",
      dataIndex: "num_adults",
      key: "adults",
      align: "center",
      sorter: (a, b) => a.num_adults - b.num_adults,
    },
    {
      title: "Crianças",
      dataIndex: "num_children",
      key: "children",
      align: "center",
      sorter: (a, b) => a.num_children - b.num_children,
    },
    {
      title: "Comentários",
      dataIndex: "comments",
      key: "comments",
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "confirmed" ? "green" : "red"}>
          {status === "confirmed" ? "Confirmado" : "Cancelado"}
        </Tag>
      ),
    },
    {
      title: "Ações",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja remover este convidado?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Deletar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading || !event) {
    return <EventDetailsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/dashboard")}
            >
              Voltar ao Dashboard
            </Button>
            <Logo size="medium" variant="full" />
            <div className="w-40"></div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do evento */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {event.title}
          </h2>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <span className="flex items-center">
              <CalendarOutlined className="mr-2" />
              {formatDateBR(event.event_date)}
            </span>
            <span className="flex items-center">
              <ClockCircleOutlined className="mr-2" />
              {event.start_time}
            </span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <Space orientation="vertical" size="small" className="w-full">
              <TeamOutlined className="text-3xl text-indigo-600" />
              <div className="text-3xl font-bold text-indigo-600">
                {event.attendee_count}
              </div>
              <Text type="secondary">Confirmados</Text>
            </Space>
          </Card>

          <Card className="text-center">
            <Space orientation="vertical" size="small" className="w-full">
              <UserOutlined className="text-3xl text-green-600" />
              <div className="text-3xl font-bold text-green-600">
                {event.total_adults}
              </div>
              <Text type="secondary">Total Adultos</Text>
            </Space>
          </Card>

          <Card className="text-center">
            <Space orientation="vertical" size="small" className="w-full">
              <SmileOutlined className="text-3xl text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">
                {event.total_children}
              </div>
              <Text type="secondary">Total Crianças</Text>
            </Space>
          </Card>

          <Card className="text-center">
            <Space orientation="vertical" size="small" className="w-full">
              <TeamOutlined className="text-3xl text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">
                {event.total_adults + event.total_children}
              </div>
              <Text type="secondary">Total Pessoas</Text>
            </Space>
          </Card>
        </div>

        {/* Ações */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={copyInviteLink}
            >
              Copiar Link do Convite
            </Button>
            <Button icon={<DownloadOutlined />} onClick={exportCSV}>
              Exportar CSV
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEditEvent}>
              Editar Evento
            </Button>
            <Button icon={<DuplicateOutlined />} onClick={handleDuplicateEvent}>
              Duplicar Evento
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteEvent}
            >
              Deletar Evento
            </Button>
          </div>
        </Card>

        {/* Tabela de convidados */}
        <Card title={`Convidados (${attendees.length})`}>
          {attendees.length === 0 ? (
            <Alert
              title="Nenhum convidado ainda"
              description="Compartilhe o link do convite para que as pessoas possam confirmar presença!"
              type="info"
              showIcon
            />
          ) : (
            <Table
              columns={columns}
              dataSource={attendees}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total de ${total} convidados`,
              }}
              scroll={{ x: "max-content" }}
            />
          )}
        </Card>
      </main>

      {/* Modal de edição */}
      <Modal
        title="Editar Convidado"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nome</label>
            <Input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Nome do convidado"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Adultos
              </label>
              <Input
                type="number"
                min={0}
                value={editForm.num_adults}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    num_adults: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Crianças
              </label>
              <Input
                type="number"
                min={0}
                value={editForm.num_children}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    num_children: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Comentários
            </label>
            <Input.TextArea
              rows={3}
              value={editForm.comments}
              onChange={(e) =>
                setEditForm({ ...editForm, comments: e.target.value })
              }
              placeholder="Observações ou restrições alimentares"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
