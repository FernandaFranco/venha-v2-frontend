// src/app/components/EventMap.js
export default function EventMap({ address, eventTitle }) {
  if (!address) {
    return null;
  }

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;

  return (
    <iframe
      src={mapUrl}
      width="100%"
      height="100%"
      style={{ border: 0, borderRadius: "0.5rem" }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={eventTitle || "Local do Evento"}
    />
  );
}
