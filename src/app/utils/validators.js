// src/app/utils/validators.js

/**
 * Valida número de WhatsApp brasileiro
 * Aceita: 5521999999999, 21999999999, (21) 99999-9999
 * Retorna: número limpo ou null se inválido
 */
export function validateWhatsApp(value) {
  if (!value) return null;

  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, "");

  // Verifica padrões válidos
  if (cleaned.length === 13 && cleaned.startsWith("55")) {
    // 55 21 999999999 (com DDI)
    return cleaned;
  } else if (cleaned.length === 11) {
    // 21 999999999 (sem DDI)
    return "55" + cleaned;
  } else if (cleaned.length === 10) {
    // Possível número fixo ou celular antigo
    return null; // Rejeitar, queremos apenas celular
  }

  return null;
}

/**
 * Formata WhatsApp para exibição
 */
export function formatWhatsApp(value) {
  if (!value) return "";

  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 13) {
    // +55 (21) 99999-9999
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(
      4,
      9
    )}-${cleaned.slice(9)}`;
  } else if (cleaned.length === 11) {
    // (21) 99999-9999
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
      7
    )}`;
  }

  return value;
}

/**
 * Valida CEP brasileiro
 */
export function validateCEP(value) {
  if (!value) return false;

  const cleaned = value.replace(/\D/g, "");
  return cleaned.length === 8;
}

/**
 * Formata CEP para exibição
 */
export function formatCEP(value) {
  if (!value) return "";

  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }

  return value;
}

/**
 * Valida se data/hora está pelo menos 30 minutos no futuro
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @param {string} startTime - Hora no formato HH:mm (obrigatório)
 * @returns {boolean} - true se válido
 */
export function validateFutureDate(dateString, startTime) {
  if (!dateString || !startTime) return false;

  const now = new Date();

  // Parsear data manualmente para evitar problemas de timezone
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = startTime.split(":").map(Number);

  // Criar data/hora do evento no fuso horário local
  const eventDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // Adiciona 30 minutos ao momento atual para criar o limite mínimo
  const minDateTime = new Date(now.getTime() + 30 * 60 * 1000);

  return eventDateTime >= minDateTime;
}

/**
 * Valida se hora de fim é depois da hora de início
 */
export function validateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return true; // End time é opcional

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes > startMinutes;
}

/**
 * Mensagens de erro amigáveis
 */
export const ERROR_MESSAGES = {
  WHATSAPP_INVALID:
    "WhatsApp inválido. Use o formato: (21) 99999-9999 ou 5521999999999",
  WHATSAPP_REQUIRED: "WhatsApp é obrigatório",
  CEP_INVALID: "CEP inválido. Use o formato: 00000-000",
  DATE_PAST: "O evento deve ser agendado para pelo menos 30 minutos no futuro",
  TIME_INVALID: "Horário de término deve ser depois do horário de início",
  REQUIRED_FIELD: "Este campo é obrigatório",
  MIN_ADULTS: "Deve ter pelo menos 1 adulto",
};
