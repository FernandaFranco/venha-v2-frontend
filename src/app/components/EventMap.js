// src/app/components/EventMap.js
"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function EventMap({ address, latitude, longitude, eventTitle }) {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se temos coordenadas, usar diretamente
    if (latitude && longitude) {
      console.log("✅ Usando coordenadas do backend:", { latitude, longitude });
      setCoordinates({ lat: latitude, lng: longitude });
      setLoading(false);
    } else {
      // Sem coordenadas = não mostra mapa
      console.log("⚠️ Coordenadas não disponíveis - mapa não será exibido");
      setLoading(false);
    }
  }, [address, latitude, longitude]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Se não tiver coordenadas, não mostra o mapa
  if (!coordinates) {
    return null;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("❌ Google Maps API key não encontrada!");
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm">
          Configuração do mapa não disponível
        </p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coordinates}
        zoom={15}
        options={mapOptions}
      >
        <Marker
          position={coordinates}
          title={eventTitle || "Local do Evento"}
        />
      </GoogleMap>
    </LoadScript>
  );
}
