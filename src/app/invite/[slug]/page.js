// src/app/invite/[slug]/page.js
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
  message,
  Divider,
  Tag,
  Space,
  Alert,
  Statistic,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CloudOutlined,
  DownloadOutlined,
  WhatsAppOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import {
  validateWhatsApp,
  formatWhatsApp,
  ERROR_MESSAGES,
} from "../../utils/validators";
import { Tooltip } from "antd";
import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { InviteSkeleton } from "../../components/LoadingSkeleton";
import { formatDateWithWeekday } from "../../utils/dateUtils";
import Logo from "../../components/Logo";

// Importar mapa dinamicamente (só no client-side)
const MapWithNoSSR = dynamic(() => import("../../components/EventMap"), {
  ssr: false,
});

export default function ConvitePage() {
  const params = useParams();
  const slug = params.slug;

  const [event, setEvent] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    loadEvent();
  }, [slug]);

  useEffect(() => {
    if (event && event.address_full) {
      fetchWeather();
    }
  }, [event]);

  // Carregar evento
  const loadEvent = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/events/${slug}`
      );
      setEvent(response.data.event);
    } catch (err) {
      console.error("Erro ao carregar evento:", err);
      message.error("Evento não encontrado");
    } finally {
      setLoading(false);
    }
  };

  // Buscar clima para a data do evento
  const fetchWeather = async () => {
    try {
      // Extrair cidade do endereço
      const cityMatch = event.address_full.match(/,\s*([^,]+)\s*-\s*[A-Z]{2}/);
      const city = cityMatch ? cityMatch[1].trim() : null;

      if (!city) {
        console.log("❌ Não foi possível extrair a cidade do endereço");
        return;
      }

      console.log("🌤️ Buscando previsão do tempo para:", city);

      const WEATHER_API_KEY = "141058784c6a4cb893930820251212";

      if (!WEATHER_API_KEY || WEATHER_API_KEY === "SUA_CHAVE_WEATHERAPI") {
        console.log("⚠️ API Key não configurada");
        return;
      }

      // Calcular quantos dias faltam para o evento
      const eventDate = new Date(event.event_date + "T" + event.start_time);
      const today = new Date();
      const daysUntilEvent = Math.ceil(
        (eventDate - today) / (1000 * 60 * 60 * 24)
      );

      console.log("📅 Dias até o evento:", daysUntilEvent);

      // WeatherAPI.com tem forecast gratuito de até 3 dias
      if (daysUntilEvent > 3) {
        console.log("⚠️ Evento muito distante, previsão não disponível");
        setWeather({
          temp: null,
          description:
            "Previsão disponível apenas para eventos nos próximos 3 dias",
          icon: null,
          humidity: null,
          feelsLike: null,
          isUnavailable: true,
        });
        return;
      }

      if (daysUntilEvent < 0) {
        console.log("⚠️ Evento já passou");
        return;
      }

      // Buscar previsão
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
        city
      )},Brazil&days=${Math.max(1, daysUntilEvent)}&lang=pt`;

      console.log("📡 Buscando forecast...");

      const response = await axios.get(url);

      console.log("✅ Forecast recebido:", response.data);

      // Encontrar a previsão para a data do evento
      const eventDateStr = event.event_date; // YYYY-MM-DD
      const forecastDay = response.data.forecast.forecastday.find(
        (day) => day.date === eventDateStr
      );

      if (!forecastDay) {
        console.log("❌ Previsão não encontrada para a data do evento");
        return;
      }

      // Encontrar o horário mais próximo do evento
      const eventHour = parseInt(event.start_time.split(":")[0]);

      // Buscar previsão hora a hora
      let closestHour = forecastDay.hour.find((h) => {
        const hourNum = parseInt(h.time.split(" ")[1].split(":")[0]);
        return hourNum === eventHour;
      });

      // Se não encontrar hora exata, pegar a mais próxima
      if (!closestHour) {
        closestHour = forecastDay.hour.reduce((prev, curr) => {
          const prevHour = parseInt(prev.time.split(" ")[1].split(":")[0]);
          const currHour = parseInt(curr.time.split(" ")[1].split(":")[0]);
          return Math.abs(currHour - eventHour) < Math.abs(prevHour - eventHour)
            ? curr
            : prev;
        });
      }

      // Usar previsão hora a hora se disponível, senão usar média do dia
      const weatherData = closestHour || forecastDay.day;

      setWeather({
        temp: Math.round(
          closestHour ? closestHour.temp_c : weatherData.avgtemp_c
        ),
        description: closestHour
          ? closestHour.condition.text
          : weatherData.condition.text,
        icon: closestHour
          ? closestHour.condition.icon
          : weatherData.condition.icon,
        humidity: closestHour ? closestHour.humidity : weatherData.avghumidity,
        feelsLike: Math.round(
          closestHour ? closestHour.feelslike_c : weatherData.avgtemp_c
        ),
        isUnavailable: false,
        forecastTime: closestHour ? closestHour.time : null,
      });

      console.log(
        "✅ Previsão configurada para:",
        closestHour ? closestHour.time : "média do dia"
      );
    } catch (err) {
      console.error("❌ Erro ao buscar clima:", err);
      console.error("Detalhes:", err.response?.data);
    }
  };

  // Submeter RSVP
  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      await axios.post("http://localhost:5000/api/attendees/rsvp", {
        event_slug: slug,
        whatsapp_number: values.whatsapp_number,
        name: values.name,
        num_adults: values.num_adults || 1,
        num_children: values.num_children || 0,
        comments: values.comments || "",
      });

      message.success("Presença confirmada com sucesso!");
      setRsvpSuccess(true);
      form.resetFields();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Erro ao confirmar presença";
      message.error(errorMsg);
      console.error("Erro:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Gerar arquivo .ics (iCalendar)
  const downloadCalendar = () => {
    if (!event) return;

    const formatDateForICS = (dateStr, timeStr) => {
      const [year, month, day] = dateStr.split("-");
      const [hour, minute] = timeStr.split(":");
      return `${year}${month}${day}T${hour}${minute}00`;
    };

    const startDateTime = formatDateForICS(event.event_date, event.start_time);
    const endDateTime = event.end_time
      ? formatDateForICS(event.event_date, event.end_time)
      : formatDateForICS(event.event_date, "23:59");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Venha//Event//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${startDateTime}
DTEND:${endDateTime}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
UID:${event.slug}@venha.app
SUMMARY:${event.title}
DESCRIPTION:${event.description || "Evento criado com Venha"}
LOCATION:${event.address_full}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(
      "Evento baixado! Abra o arquivo para adicionar ao seu calendário."
    );
  };

  // Formatar data
  const formatDate = (dateString) => {
    // Parse manual para evitar conversão UTC
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month é 0-indexed
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return <InviteSkeleton />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <Alert
            title="Convite não encontrado"
            description="Este link de convite não é válido ou o evento foi removido."
            type="error"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="medium" variant="full" />
          <p className="text-gray-600 mt-2">Você foi convidado!</p>
        </div>

        {/* Informações do evento */}
        <Card className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {event.title}
          </h2>

          {event.description && (
            <p className="text-gray-600 mb-6 text-lg">{event.description}</p>
          )}

          <Divider />

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start">
              <CalendarOutlined className="text-indigo-600 text-xl mr-3 mt-1" />
              <div>
                <p className="text-gray-500 text-sm">Data</p>
                <p className="text-gray-900 font-medium capitalize">
                  {formatDateWithWeekday(event.event_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <ClockCircleOutlined className="text-indigo-600 text-xl mr-3 mt-1" />
              <div>
                <p className="text-gray-500 text-sm">Horário</p>
                <p className="text-gray-900 font-medium">
                  {event.start_time}
                  {event.end_time && ` - ${event.end_time}`}
                </p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="flex items-start mb-6">
            <EnvironmentOutlined className="text-indigo-600 text-xl mr-3 mt-1" />
            <div>
              <p className="text-gray-500 text-sm">Local</p>
              <p className="text-gray-900 font-medium">{event.address_full}</p>
            </div>
          </div>

          {/* Botão de adicionar ao calendário */}
          <Button
            icon={<DownloadOutlined />}
            onClick={downloadCalendar}
            size="large"
            block
          >
            Adicionar ao Calendário
          </Button>
        </Card>

        {/* Mapa - só mostra se tiver coordenadas */}
        {event.latitude && event.longitude && (
          <Card title="Localização" className="mb-6">
            <div style={{ height: "300px" }}>
              <MapWithNoSSR
                address={event.address_full}
                latitude={event.latitude}
                longitude={event.longitude}
              />
            </div>
          </Card>
        )}

        {/* Clima */}
        {weather && !weather.isUnavailable && (
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {weather.icon ? (
                  <img
                    src={`https:${weather.icon}`}
                    alt={weather.description}
                    className="w-16 h-16 mr-4"
                  />
                ) : (
                  <CloudOutlined className="text-4xl text-blue-500 mr-4" />
                )}
                <div>
                  <p className="text-gray-500 text-sm">
                    Previsão para o dia do evento
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weather.temp}°C
                  </p>
                  <p className="text-gray-600 capitalize">
                    {weather.description}
                  </p>
                  {weather.forecastTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      Previsão para {weather.forecastTime.split(" ")[1]}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Sensação térmica</p>
                <p className="text-lg font-medium">{weather.feelsLike}°C</p>
                <p className="text-sm text-gray-500 mt-2">Umidade</p>
                <p className="text-lg font-medium">{weather.humidity}%</p>
              </div>
            </div>
          </Card>
        )}

        {/* Mensagem se previsão não disponível */}
        {weather && weather.isUnavailable && (
          <Card className="mb-6">
            <Alert
              title="Previsão do tempo não disponível"
              description={weather.description}
              type="info"
              showIcon
              icon={<CloudOutlined />}
            />
          </Card>
        )}

        {/* Formulário de RSVP */}
        {rsvpSuccess ? (
          <Card>
            <Alert
              title="Presença confirmada!"
              description={
                <div>
                  <p className="mb-4">
                    Obrigado por confirmar sua presença! O anfitrião foi
                    notificado.
                  </p>
                  <Space>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={downloadCalendar}
                    >
                      Adicionar ao Calendário
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => setRsvpSuccess(false)}
                    >
                      Confirmar Outra Pessoa
                    </Button>
                  </Space>
                </div>
              }
              type="success"
              showIcon
            />
          </Card>
        ) : (
          <Card title="Confirme sua Presença">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                num_adults: 1,
                num_children: 0,
              }}
            >
              {/* Nome */}
              <Form.Item
                label="Seu Nome"
                name="name"
                rules={[
                  { required: true, message: "Por favor, informe seu nome" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nome completo"
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              {/* WhatsApp */}
              <Form.Item
                label={
                  <span>
                    WhatsApp{" "}
                    <Tooltip title="Será usado para enviar confirmação e futuras atualizações sobre o evento">
                      <QuestionCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </span>
                }
                name="whatsapp_number"
                rules={[
                  { required: true, message: ERROR_MESSAGES.WHATSAPP_REQUIRED },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const validated = validateWhatsApp(value);
                      if (!validated) {
                        return Promise.reject(
                          new Error(ERROR_MESSAGES.WHATSAPP_INVALID)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                normalize={(value) => {
                  // Auto-formatar enquanto digita
                  return formatWhatsApp(value);
                }}
              >
                <Input
                  size="large"
                  placeholder="(21) 99999-9999 ou 5521999999999"
                  prefix={<WhatsAppOutlined />}
                  maxLength={20}
                />
              </Form.Item>

              {/* Número de pessoas */}
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

                <Form.Item label="Crianças (até 12 anos)" name="num_children">
                  <InputNumber
                    size="large"
                    min={0}
                    max={20}
                    className="w-full"
                  />
                </Form.Item>
              </div>

              {/* Comentários */}
              <Form.Item
                label="Observações (opcional)"
                name="comments"
                extra="Restrições alimentares, necessidades especiais, etc."
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Ex: Sou vegetariano, preciso de cadeira de rodas, etc."
                />
              </Form.Item>

              {/* Botão de enviar */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                >
                  Confirmar Presença
                </Button>
              </Form.Item>
            </Form>

            {/* Info sobre modificação/cancelamento */}
            {(event.allow_modifications || event.allow_cancellations) && (
              <Alert
                title={
                  <div className="text-sm">
                    {event.allow_modifications && (
                      <p>✓ Você poderá modificar sua confirmação depois</p>
                    )}
                    {event.allow_cancellations && (
                      <p>✓ Você poderá cancelar sua confirmação depois</p>
                    )}
                  </div>
                }
                type="info"
                showIcon={false}
              />
            )}
          </Card>
        )}
        {/* Link para gerenciar RSVP */}
        <div className="text-center mt-6">
          <p className="text-gray-600 mb-3">Já confirmou presença?</p>
          <Button
            size="large"
            onClick={() => (window.location.href = `/rsvp/${slug}`)}
          >
            Gerenciar Minha Confirmação
          </Button>
        </div>
      </div>
    </div>
  );
}
