// src/app/utils/dateUtils.js

/**
 * Formata data evitando conversão UTC
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @param {object} options - Opções de formatação
 * @returns {string} Data formatada
 */
export function formatDateBR(dateString, options = {}) {
  if (!dateString) return "";

  // Parse manual para evitar conversão UTC
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month é 0-indexed

  const defaultOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("pt-BR", { ...defaultOptions, ...options });
}

/**
 * Formata data com dia da semana
 */
export function formatDateWithWeekday(dateString) {
  return formatDateBR(dateString, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formata data curta (DD/MM/YYYY)
 */
export function formatDateShort(dateString) {
  return formatDateBR(dateString, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Verifica se data é hoje
 */
export function isToday(dateString) {
  if (!dateString) return false;

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifica se data é amanhã
 */
export function isTomorrow(dateString) {
  if (!dateString) return false;

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Retorna dias até o evento
 */
export function daysUntilEvent(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);
  const eventDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Formata data de forma relativa (hoje, amanhã, ou data)
 */
export function formatDateRelative(dateString) {
  if (isToday(dateString)) {
    return "Hoje";
  } else if (isTomorrow(dateString)) {
    return "Amanhã";
  }

  const days = daysUntilEvent(dateString);

  if (days >= 0 && days <= 7) {
    // Próximos 7 dias: mostrar dia da semana
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("pt-BR", { weekday: "long" });
  }

  return formatDateBR(dateString);
}
