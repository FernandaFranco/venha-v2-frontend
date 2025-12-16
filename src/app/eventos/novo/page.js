// src/app/eventos/novo/page.js
"use client";

import {
  validateCEP,
  validateFutureDate,
  validateTimeRange,
  ERROR_MESSAGES,
} from "../../utils/validators";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  TimePicker,
  DatePicker,
  Input,
  Button,
  Switch,
  Alert,
  Card,
  App,
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/pt-br";
import Logo from "../../components/Logo";
import dynamic from "next/dynamic";

// Importar mapa dinamicamente (só no client-side)
const MapWithNoSSR = dynamic(() => import("../../components/EventMap"), {
  ssr: false,
});

const { TextArea } = Input;

dayjs.extend(customParseFormat);
dayjs.locale("pt-br");

export default function NovoEvento() {
  const router = useRouter();
  const { message } = App.useApp(); // Hook do Ant Design para mensagens

  // State do formulário
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    address_cep: "",
    address_number: "",
    address_complement: "",
    address_full: "",
    allow_modifications: true,
    allow_cancellations: true,
  });

  // State para os campos do endereço (preenchidos automaticamente)
  const [addressFields, setAddressFields] = useState({
    street: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  // States de feedback
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [cepValidation, setCepValidation] = useState({ type: "", message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // States para geocoding e mapa
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");

  // Buscar endereço pelo CEP
  const fetchAddress = async (cep) => {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      return;
    }

    setLoadingAddress(true);
    setCepValidation({ type: "", message: "" });
    setError("");

    try {
      const response = await axios.get(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );

      if (response.data.erro) {
        setCepValidation({ type: "error", message: "CEP não encontrado" });
        setAddressFields({ street: "", neighborhood: "", city: "", state: "" });
        setFormData((prev) => ({ ...prev, address_full: "" }));
      } else {
        const fields = {
          street: response.data.logradouro,
          neighborhood: response.data.bairro,
          city: response.data.localidade,
          state: response.data.uf,
        };

        setAddressFields(fields);
        setCepValidation({ type: "success", message: "CEP encontrado!" });

        if (formData.address_number) {
          updateAddressFullWithFields(fields, formData);
        }
      }
    } catch (err) {
      setCepValidation({ type: "error", message: "Erro ao buscar CEP" });
      setAddressFields({ street: "", neighborhood: "", city: "", state: "" });
      setFormData((prev) => ({ ...prev, address_full: "" }));
      console.error("Erro:", err);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    setFormData(newFormData);

    if (name === "address_cep") {
      const cleanCep = value.replace(/\D/g, "");

      if (cleanCep.length === 0) {
        setCepValidation({ type: "", message: "" });
        setAddressFields({ street: "", neighborhood: "", city: "", state: "" });
        setFormData((prev) => ({ ...prev, address_full: "" }));
      } else if (cleanCep.length < 8) {
        setCepValidation({
          type: "warning",
          message: `CEP incompleto (${cleanCep.length}/8 dígitos)`,
        });
        setAddressFields({ street: "", neighborhood: "", city: "", state: "" });
        setFormData((prev) => ({ ...prev, address_full: "" }));
      } else if (cleanCep.length === 8) {
        fetchAddress(value);
      }
    }

    if (
      (name === "address_number" || name === "address_complement") &&
      addressFields.street
    ) {
      updateAddressFull(newFormData);
    }
  };

  const handleCepBlur = () => {
    const cleanCep = formData.address_cep.replace(/\D/g, "");

    if (cleanCep.length > 0 && cleanCep.length < 8) {
      setCepValidation({ type: "error", message: "CEP deve ter 8 dígitos" });
    }
  };

  const updateAddressFull = (data) => {
    if (!addressFields.street || !data.address_number) {
      setFormData({ ...data, address_full: "" });
      return;
    }

    let fullAddress = `${addressFields.street}, ${data.address_number}`;

    if (data.address_complement) {
      fullAddress += `, ${data.address_complement}`;
    }

    fullAddress += `, ${addressFields.neighborhood}, ${addressFields.city} - ${addressFields.state}, CEP ${data.address_cep}, Brasil`;

    setFormData({
      ...data,
      address_full: fullAddress,
    });
  };

  const updateAddressFullWithFields = (fields, data) => {
    if (!fields.street || !data.address_number) {
      return;
    }

    let fullAddress = `${fields.street}, ${data.address_number}`;

    if (data.address_complement) {
      fullAddress += `, ${data.address_complement}`;
    }

    fullAddress += `, ${fields.neighborhood}, ${fields.city} - ${fields.state}, CEP ${data.address_cep}, Brasil`;

    setFormData((prev) => ({
      ...prev,
      address_full: fullAddress,
    }));
  };

  // Função para fazer geocoding do endereço
  const geocodeAddress = useCallback(async (address) => {
    if (!address) {
      setMapCoordinates(null);
      return;
    }

    setLoadingGeocode(true);
    setGeocodeError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/geocode`,
        { address }
      );

      if (response.data.latitude && response.data.longitude) {
        setMapCoordinates({
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        });
        setGeocodeError("");
      } else {
        setMapCoordinates(null);
        setGeocodeError(
          response.data.message ||
            "Não foi possível localizar o endereço no mapa"
        );
      }
    } catch (err) {
      console.error("Erro ao geocodificar:", err);
      setMapCoordinates(null);
      setGeocodeError("Erro ao buscar localização no mapa");
    } finally {
      setLoadingGeocode(false);
    }
  }, []);

  // Effect para geocodificar quando o endereço completo mudar (com debounce)
  useEffect(() => {
    if (!formData.address_full) {
      setMapCoordinates(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      geocodeAddress(formData.address_full);
    }, 800); // Debounce de 800ms

    return () => clearTimeout(timeoutId);
  }, [formData.address_full, geocodeAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    const errors = {};

    if (!validateFutureDate(formData.event_date, formData.start_time)) {
      errors.event_date = ERROR_MESSAGES.DATE_PAST;
    }

    if (!validateTimeRange(formData.start_time, formData.end_time)) {
      errors.end_time = ERROR_MESSAGES.TIME_INVALID;
    }

    if (!validateCEP(formData.address_cep)) {
      errors.address_cep = ERROR_MESSAGES.CEP_INVALID;
    }

    if (!formData.address_number) {
      errors.address_number = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      message.error("Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/create`,
        formData,
        { withCredentials: true }
      );

      setSuccess("Evento criado com sucesso!");
      console.log("Evento criado:", response.data);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Erro ao criar evento"
      );
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/dashboard")}
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

          {/* Mensagens de feedback - usando Alert */}
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
          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            {/* Título do Evento - Ant Design Input */}
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

            {/* Descrição - Ant Design TextArea */}
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
              {/* Data */}
              {/* Exemplo: Campo de Data com tooltip */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Data *
                  <Tooltip title="O evento deve ser no futuro">
                    <InfoCircleOutlined className="ml-2 text-gray-400" />
                  </Tooltip>
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
                    // Limpar erro ao alterar
                    setValidationErrors({
                      ...validationErrors,
                      event_date: undefined,
                    });
                  }}
                  placeholder="Selecione a data"
                  size="large"
                  className="w-full"
                  status={validationErrors.event_date ? "error" : ""}
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf("day");
                  }}
                />
                {validationErrors.event_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.event_date}
                  </p>
                )}
              </div>

              {/* Hora de Início */}
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

              {/* Hora de Término */}
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

            {/* Seção de Endereço com Card */}
            <Card
              title="Endereço do Evento"
              className="mb-6"
              styles={{ body: { padding: "24px" } }}
            >
              {/* CEP */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  CEP *
                </label>
                <Input
                  name="address_cep"
                  value={formData.address_cep}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  required
                  maxLength={9}
                  size="large"
                  placeholder="00000-000"
                  status={
                    cepValidation.type === "error"
                      ? "error"
                      : cepValidation.type === "warning"
                      ? "warning"
                      : ""
                  }
                />

                {loadingAddress && (
                  <p className="mt-2 text-sm text-indigo-600 flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Buscando endereço...
                  </p>
                )}

                {!loadingAddress && cepValidation.message && (
                  <p
                    className={`mt-2 text-sm flex items-center ${
                      cepValidation.type === "error"
                        ? "text-red-600"
                        : cepValidation.type === "success"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {cepValidation.type === "error" && "❌ "}
                    {cepValidation.type === "success" && "✅ "}
                    {cepValidation.type === "warning" && "⚠️ "}
                    {cepValidation.message}
                  </p>
                )}
              </div>

              {/* Campos preenchidos automaticamente */}
              {addressFields.street && (
                <>
                  {/* Rua */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Rua
                    </label>
                    <Input
                      value={addressFields.street}
                      readOnly
                      size="large"
                      disabled
                    />
                  </div>

                  {/* Número e Complemento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Número *
                      </label>
                      <Input
                        name="address_number"
                        value={formData.address_number}
                        onChange={handleChange}
                        required
                        size="large"
                        placeholder="Ex: 123"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Complemento
                      </label>
                      <Input
                        name="address_complement"
                        value={formData.address_complement}
                        onChange={handleChange}
                        size="large"
                        placeholder="Apto, Bloco, etc"
                      />
                    </div>
                  </div>

                  {/* Grid: Bairro / Cidade / Estado */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Bairro
                      </label>
                      <Input
                        value={addressFields.neighborhood}
                        readOnly
                        size="large"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Cidade
                      </label>
                      <Input
                        value={addressFields.city}
                        readOnly
                        size="large"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Estado
                      </label>
                      <Input
                        value={addressFields.state}
                        readOnly
                        size="large"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Endereço completo (preview) */}
                  {formData.address_full && (
                    <Alert
                      title="Endereço completo"
                      description={formData.address_full}
                      type="success"
                      showIcon
                      className="mt-4"
                    />
                  )}
                </>
              )}
            </Card>

            {/* Mapa - Preview da Localização */}
            {formData.address_full && (
              <Card
                title="Localização no Mapa"
                className="mb-6"
                styles={{ body: { padding: "24px" } }}
              >
                {loadingGeocode ? (
                  <div className="flex items-center justify-center py-8">
                    <Spin size="large" />
                    <span className="ml-3 text-gray-600">
                      Buscando localização...
                    </span>
                  </div>
                ) : geocodeError ? (
                  <Alert
                    title="Aviso"
                    description={geocodeError}
                    type="warning"
                    showIcon
                  />
                ) : mapCoordinates ? (
                  <>
                    <Alert
                      title="Localização encontrada!"
                      description="Confirme se o marcador está no local correto do evento."
                      type="success"
                      showIcon
                      className="mb-4"
                    />
                    <div style={{ height: "300px" }}>
                      <MapWithNoSSR
                        address={formData.address_full}
                        latitude={mapCoordinates.latitude}
                        longitude={mapCoordinates.longitude}
                      />
                    </div>
                  </>
                ) : null}
              </Card>
            )}

            {/* Permissões com Switch */}
            <Card
              title="Permissões do Convite"
              className="mb-6"
              styles={{ body: { padding: "24px" } }}
            >
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

            {/* Botões - Ant Design */}
            <div className="flex gap-4">
              <Button
                size="large"
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                Cancelar
              </Button>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                disabled={
                  !formData.address_full ||
                  !formData.start_time ||
                  !formData.event_date
                }
                className="flex-1"
              >
                Criar Evento
              </Button>
            </div>

            {/* Nota */}
            {!formData.address_full && addressFields.street && (
              <Alert
                title="Preencha o número do endereço para continuar"
                type="warning"
                showIcon
                className="mt-4"
              />
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
