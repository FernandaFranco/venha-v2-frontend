"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Card,
  Button,
  Input,
  InputNumber,
  Form,
  Alert,
  Space,
  Divider,
  App,
} from "antd";
import {
  WhatsAppOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  validateWhatsApp,
  formatWhatsApp,
} from "../../utils/validators";
import Logo from "../../components/Logo";

const { TextArea } = Input;

export default function ManageRSVPPage() {
  const params = useParams();
  const slug = params.slug;
  const { message, modal } = App.useApp(); // Hook do Ant Design para mensagens e modals

  const [step, setStep] = useState("search"); // 'search', 'found', 'modified', 'cancelled', 'not_found'
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [attendee, setAttendee] = useState(null);
  const [event, setEvent] = useState(null);
  const [modifying, setModifying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [form] = Form.useForm();

  // Preencher formulário quando attendee for carregado
  useEffect(() => {
    if (attendee && step === "found") {
      form.setFieldsValue({
        name: attendee.name,
        num_adults: attendee.num_adults,
        num_children: attendee.num_children,
        comments: attendee.comments || "",
      });
    }
  }, [attendee, step, form]);

  // Buscar RSVP
  const handleSearch = async () => {
    if (!whatsappNumber) {
      message.error("Por favor, informe seu WhatsApp");
      return;
    }

    // Normalizar o número de WhatsApp
    const normalizedNumber = validateWhatsApp(whatsappNumber);
    if (!normalizedNumber) {
      message.error("WhatsApp inválido. Use o formato: (21) 99999-9999 ou 5521999999999");
      return;
    }

    setSearching(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendees/find`,
        {
          event_slug: slug,
          whatsapp_number: normalizedNumber,
        }
      );

      setAttendee(response.data.attendee);
      setEvent(response.data.event);
      setStep("found");
      message.success("Confirmação encontrada!");
    } catch (err) {
      if (err.response?.status === 404) {
        setStep("not_found");
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Erro ao buscar confirmação";
        message.error(errorMsg);
      }
    } finally {
      setSearching(false);
    }
  };

  // Modificar RSVP
  const handleModify = async (values) => {
    setModifying(true);

    // Normalizar o número de WhatsApp
    const normalizedNumber = validateWhatsApp(whatsappNumber);

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/attendees/modify`, {
        event_slug: slug,
        whatsapp_number: normalizedNumber,
        ...values,
      });

      message.success("Confirmação atualizada com sucesso!");
      setStep("modified");

      // Recarregar dados
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendees/find`,
        {
          event_slug: slug,
          whatsapp_number: normalizedNumber,
        }
      );
      setAttendee(response.data.attendee);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Erro ao modificar RSVP";
      message.error(errorMsg);
      console.error("Erro:", err);
    } finally {
      setModifying(false);
    }
  };

  // Cancelar RSVP
  const handleCancel = () => {
    // Normalizar o número de WhatsApp
    const normalizedNumber = validateWhatsApp(whatsappNumber);

    modal.confirm({
      title: "Cancelar Confirmação?",
      content:
        "Tem certeza que deseja cancelar sua presença? O anfitrião será notificado.",
      okText: "Sim, cancelar",
      cancelText: "Não",
      okButtonProps: { danger: true },
      onOk: async () => {
        setCancelling(true);

        try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/attendees/cancel`, {
            event_slug: slug,
            whatsapp_number: normalizedNumber,
          });

          message.success("Confirmação cancelada com sucesso");
          setStep("cancelled");
        } catch (err) {
          const errorMsg = err.response?.data?.message || err.response?.data?.error || "Erro ao cancelar RSVP";
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
                placeholder="(21) 99999-9999 ou 5521999999999"
                prefix={<WhatsAppOutlined />}
                value={whatsappNumber}
                onChange={(e) => {
                  // Formatar automaticamente enquanto digita
                  const formatted = formatWhatsApp(e.target.value);
                  setWhatsappNumber(formatted);
                }}
                onPressEnter={handleSearch}
                maxLength={20}
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
              description="Você pode digitar o WhatsApp de várias formas: (21) 99999-9999, 21999999999 ou 5521999999999"
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

        {/* Step 5: Not Found */}
        {step === "not_found" && (
          <Card>
            <Alert
              title="Confirmação Não Encontrada"
              description={`Não encontramos nenhuma confirmação com o WhatsApp ${whatsappNumber} para este evento.`}
              type="warning"
              showIcon
              className="mb-6"
            />

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                O que você pode fazer:
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Verifique se digitou o WhatsApp correto</li>
                <li>Tente outro número de WhatsApp que você possa ter usado</li>
                <li>Se ainda não confirmou presença, volte para o convite</li>
              </ul>
            </div>

            <Space orientation="vertical" size="middle" className="w-full">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => (window.location.href = `/invite/${slug}`)}
              >
                Voltar para o Convite
              </Button>

              <Button size="large" block onClick={handleSearchAgain}>
                Tentar Outro WhatsApp
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
}
