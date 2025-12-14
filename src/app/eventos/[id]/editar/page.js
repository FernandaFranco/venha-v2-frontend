// src/app/eventos/[id]/editar/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Input,
  Button,
  Switch,
  Alert,
  Card,
  DatePicker,
  TimePicker,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Logo from "../../../components/Logo";
import { FormSkeleton } from "../../../components/LoadingSkeleton";

const { TextArea } = Input;

export default function EditarEvento() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/events/my-events",
        { withCredentials: true }
      );

      const event = response.data.events.find(
        (e) => e.id === parseInt(eventId)
      );

      if (event) {
        setFormData({
          title: event.title,
          description: event.description || "",
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time || "",
          address_cep: event.address_cep,
          address_full: event.address_full,
          allow_modifications: event.allow_modifications,
          allow_cancellations: event.allow_cancellations,
        });
      } else {
        setError("Evento não encontrado");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (err) {
      console.error("Erro ao carregar evento:", err);
      setError("Erro ao carregar evento");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(`http://localhost:5000/api/events/${eventId}`, formData, {
        withCredentials: true,
      });

      setSuccess("Evento atualizado com sucesso!");

      setTimeout(() => {
        router.push(`/eventos/${eventId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar evento");
      console.error("Erro:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/eventos/${eventId}`)}
            >
              Voltar
            </Button>
            <Logo size="medium" variant="full" />
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* Formulário */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Editar Evento</h2>
            <p className="text-gray-600 mt-2">
              Faça as alterações necessárias no seu evento
            </p>
          </div>

          {/* Mensagens */}
          {error && (
            <Alert
              title="Erro"
              description={error}
              type="error"
              closable
              onClose={() => setError("")}
              className="mb-6"
            />
          )}

          {success && (
            <Alert
              title="Sucesso!"
              description={success}
              type="success"
              showIcon
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit}>
            {/* Título */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Título do Evento *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                size="large"
                placeholder="Ex: Festa de Aniversário"
                maxLength={100}
                showCount
              />
            </div>

            {/* Descrição */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Descrição
              </label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                size="large"
                placeholder="Descreva seu evento (opcional)"
                maxLength={500}
                showCount
              />
            </div>

            {/* Data e Horários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Data *
                </label>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={
                    formData.event_date
                      ? dayjs(formData.event_date, "YYYY-MM-DD")
                      : null
                  }
                  onChange={(date) => {
                    setFormData({
                      ...formData,
                      event_date: date ? date.format("YYYY-MM-DD") : "",
                    });
                  }}
                  placeholder="Selecione a data"
                  size="large"
                  className="w-full"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf("day");
                  }}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Hora Início *
                </label>
                <TimePicker
                  format="HH:mm"
                  minuteStep={15}
                  value={
                    formData.start_time
                      ? dayjs(formData.start_time, "HH:mm")
                      : null
                  }
                  onChange={(time) => {
                    setFormData({
                      ...formData,
                      start_time: time ? time.format("HH:mm") : "",
                    });
                  }}
                  placeholder="Selecione"
                  size="large"
                  className="w-full"
                  showNow={false}
                  needConfirm={false}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Hora Fim
                </label>
                <TimePicker
                  format="HH:mm"
                  minuteStep={15}
                  value={
                    formData.end_time ? dayjs(formData.end_time, "HH:mm") : null
                  }
                  onChange={(time) => {
                    setFormData({
                      ...formData,
                      end_time: time ? time.format("HH:mm") : "",
                    });
                  }}
                  placeholder="Selecione"
                  size="large"
                  className="w-full"
                  showNow={false}
                  needConfirm={false}
                  allowClear
                />
              </div>
            </div>

            {/* Endereço (apenas exibição, não editável por enquanto) */}
            <Card className="mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Endereço
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {formData.address_full}
              </p>
              <Alert
                title="Para alterar o endereço, crie um novo evento"
                type="info"
                showIcon
              />
            </Card>

            {/* Permissões */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Permissões do Convite
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 font-medium">
                      Permitir modificações
                    </p>
                    <p className="text-sm text-gray-500">
                      Convidados podem alterar suas confirmações
                    </p>
                  </div>
                  <Switch
                    checked={formData.allow_modifications}
                    onChange={(checked) => {
                      setFormData({
                        ...formData,
                        allow_modifications: checked,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 font-medium">
                      Permitir cancelamentos
                    </p>
                    <p className="text-sm text-gray-500">
                      Convidados podem cancelar suas confirmações
                    </p>
                  </div>
                  <Switch
                    checked={formData.allow_cancellations}
                    onChange={(checked) => {
                      setFormData({
                        ...formData,
                        allow_cancellations: checked,
                      });
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Botões */}
            <div className="flex gap-4">
              <Button
                size="large"
                onClick={() => router.push(`/eventos/${eventId}`)}
                className="flex-1"
              >
                Cancelar
              </Button>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
                className="flex-1"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
