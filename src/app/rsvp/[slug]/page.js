"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Card,
  Button,
  Input,
  InputNumber,
  Form,
  message,
  Alert,
  Space,
  Modal,
  Divider,
} from "antd";
import {
  WhatsAppOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Logo from "../../components/Logo";

const { TextArea } = Input;

export default function ManageRSVPPage() {
  const params = useParams();
  const slug = params.slug;

  const [step, setStep] = useState("search"); // 'search', 'found', 'modified', 'cancelled'
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [attendee, setAttendee] = useState(null);
  const [event, setEvent] = useState(null);
  const [modifying, setModifying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [form] = Form.useForm();

  // Buscar RSVP
  const handleSearch = async () => {
    if (!whatsappNumber) {
      message.error("Por favor, informe seu WhatsApp");
      return;
    }

    setSearching(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/attendees/find",
        {
          event_slug: slug,
          whatsapp_number: whatsappNumber,
        }
      );

      setAttendee(response.data.attendee);
      setEvent(response.data.event);

      // Preencher formulário com dados atuais
      form.setFieldsValue({
        name: response.data.attendee.name,
        num_adults: response.data.attendee.num_adults,
        num_children: response.data.attendee.num_children,
        comments: response.data.attendee.comments || "",
      });

      setStep("found");
      message.success("Confirmação encontrada!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "RSVP não encontrado";
      message.error(errorMsg);
    } finally {
      setSearching(false);
    }
  };

  // Modificar RSVP
  const handleModify = async (values) => {
    setModifying(true);

    try {
      await axios.put("http://localhost:5000/api/attendees/modify", {
        event_slug: slug,
        whatsapp_number: whatsappNumber,
        ...values,
      });

      message.success("Confirmação atualizada com sucesso!");
      setStep("modified");

      // Recarregar dados
      const response = await axios.post(
        "http://localhost:5000/api/attendees/find",
        {
          event_slug: slug,
          whatsapp_number: whatsappNumber,
        }
      );
      setAttendee(response.data.attendee);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao modificar RSVP";
      message.error(errorMsg);
      console.error("Erro:", err);
    } finally {
      setModifying(false);
    }
  };

  // Cancelar RSVP
  const handleCancel = () => {
    Modal.confirm({
      title: "Cancelar Confirmação?",
      content:
        "Tem certeza que deseja cancelar sua presença? O anfitrião será notificado.",
      okText: "Sim, cancelar",
      cancelText: "Não",
      okButtonProps: { danger: true },
      onOk: async () => {
        setCancelling(true);

        try {
          await axios.post("http://localhost:5000/api/attendees/cancel", {
            event_slug: slug,
            whatsapp_number: whatsappNumber,
          });

          message.success("Confirmação cancelada com sucesso");
          setStep("cancelled");
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Erro ao cancelar RSVP";
          message.error(errorMsg);
          console.error("Erro:", err);
        } finally {
          setCancelling(false);
        }
      },
    });
  };

  // Buscar novamente
  const handleSearchAgain = () => {
    setStep("search");
    setWhatsappNumber("");
    setAttendee(null);
    setEvent(null);
    form.resetFields();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="medium" variant="full" />
          <p className="text-gray-600 mt-2">Gerenciar Confirmação</p>
        </div>

        {/* Step 1: Search */}
        {step === "search" && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Encontre sua Confirmação
            </h2>
            <p className="text-gray-600 mb-6">
              Digite o WhatsApp que você usou para confirmar presença
            </p>

            <Space orientation="vertical" size="large" className="w-full">
              <Input
                size="large"
                placeholder="5521999999999"
                prefix={<WhatsAppOutlined />}
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                onPressEnter={handleSearch}
                maxLength={15}
              />

              <Button
                type="primary"
                size="large"
                block
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={searching}
              >
                Buscar Confirmação
              </Button>
            </Space>

            <Divider />

            <Alert
              title="Dica"
              description="Informe apenas os números do WhatsApp, sem espaços ou caracteres especiais. Exemplo: 5521999999999"
              type="info"
              showIcon
            />
          </Card>
        )}

        {/* Step 2: Found - Show current data */}
        {step === "found" && attendee && event && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sua Confirmação
            </h2>
            <p className="text-gray-600 mb-6">
              Evento: <strong>{event.title}</strong>
            </p>

            {/* Status atual */}
            {attendee.status === "cancelled" && (
              <Alert
                title="Confirmação Cancelada"
                description="Sua confirmação foi cancelada. Você pode modificá-la para reativar."
                type="warning"
                showIcon
                className="mb-6"
              />
            )}

            {attendee.status === "confirmed" && (
              <Alert
                title="Confirmação Ativa"
                description="Sua presença está confirmada!"
                type="success"
                showIcon
                className="mb-6"
              />
            )}

            {/* Formulário de edição */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleModify}
              disabled={!event.allow_modifications}
            >
              <Form.Item
                label="Nome"
                name="name"
                rules={[{ required: true, message: "Nome é obrigatório" }]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="Seu nome completo"
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Adultos"
                  name="num_adults"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    max={20}
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item label="Crianças" name="num_children">
                  <InputNumber
                    size="large"
                    min={0}
                    max={20}
                    className="w-full"
                  />
                </Form.Item>
              </div>

              <Form.Item label="Observações" name="comments">
                <TextArea
                  rows={3}
                  placeholder="Restrições alimentares, necessidades especiais, etc."
                />
              </Form.Item>

              {/* Botões de ação */}
              <Space orientation="vertical" size="middle" className="w-full">
                {event.allow_modifications && (
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    icon={<EditOutlined />}
                    loading={modifying}
                  >
                    Salvar Alterações
                  </Button>
                )}

                {!event.allow_modifications && (
                  <Alert
                    title="Modificações não permitidas"
                    description="O anfitrião não permite alterações neste evento"
                    type="warning"
                    showIcon
                  />
                )}

                {event.allow_cancellations && (
                  <Button
                    danger
                    size="large"
                    block
                    icon={<DeleteOutlined />}
                    onClick={handleCancel}
                    loading={cancelling}
                  >
                    Cancelar Presença
                  </Button>
                )}

                {!event.allow_cancellations && (
                  <Alert
                    title="Cancelamentos não permitidos"
                    description="O anfitrião não permite cancelamentos neste evento"
                    type="info"
                    showIcon
                  />
                )}

                <Button size="large" block onClick={handleSearchAgain}>
                  Buscar Outro WhatsApp
                </Button>
              </Space>
            </Form>
          </Card>
        )}

        {/* Step 3: Modified */}
        {step === "modified" && (
          <Card>
            <Alert
              title="Confirmação Atualizada!"
              description="Suas alterações foram salvas com sucesso. O anfitrião foi notificado."
              type="success"
              showIcon
              className="mb-6"
            />

            <Space orientation="vertical" size="middle" className="w-full">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => setStep("found")}
              >
                Fazer Mais Alterações
              </Button>

              <Button size="large" block onClick={handleSearchAgain}>
                Gerenciar Outra Confirmação
              </Button>
            </Space>
          </Card>
        )}

        {/* Step 4: Cancelled */}
        {step === "cancelled" && (
          <Card>
            <Alert
              title="Confirmação Cancelada"
              description="Sua presença foi cancelada com sucesso. O anfitrião foi notificado."
              type="info"
              showIcon
              className="mb-6"
            />

            <Space orientation="vertical" size="middle" className="w-full">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => setStep("found")}
              >
                Reativar Confirmação
              </Button>

              <Button size="large" block onClick={handleSearchAgain}>
                Gerenciar Outra Confirmação
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
}
