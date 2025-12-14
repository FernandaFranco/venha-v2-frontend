// src/app/components/Logo.js
"use client";

import {
  CalendarOutlined,
  HeartOutlined,
  SendOutlined,
} from "@ant-design/icons";

export default function Logo({ size = "medium", variant = "full", onClick }) {
  const sizes = {
    small: {
      text: "text-xl",
      icon: "text-2xl",
      container: "gap-2",
    },
    medium: {
      text: "text-2xl",
      icon: "text-3xl",
      container: "gap-2",
    },
    large: {
      text: "text-4xl",
      icon: "text-5xl",
      container: "gap-3",
    },
  };

  const currentSize = sizes[size];

  // Variação 1: Com ícone de calendário + coração
  if (variant === "full") {
    return (
      <div
        className={`flex items-center ${currentSize.container} cursor-pointer transition-transform hover:scale-105`}
        onClick={onClick}
      >
        <div className="relative inline-flex items-center justify-center">
          <CalendarOutlined className={`${currentSize.icon} text-indigo-600`} />
          <HeartOutlined
            style={{ color: "#ec4899", filter: "drop-shadow(0 0 4px #ec4899)" }}
            className="absolute top-[65%] left-1/2 text-xs heartbeat font-bold"
          />
        </div>
        <span
          className={`${currentSize.text} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
        >
          Venha
        </span>
      </div>
    );
  }

  // Variação 2: Apenas texto com gradiente
  if (variant === "text") {
    return (
      <span
        className={`${currentSize.text} font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}
      >
        Venha
      </span>
    );
  }

  // Variação 3: Com envelope/convite
  if (variant === "invite") {
    return (
      <div className={`flex items-center ${currentSize.container}`}>
        <div className="relative">
          <SendOutlined
            className={`${currentSize.icon} text-indigo-600 transform rotate-[-45deg]`}
          />
        </div>
        <span
          className={`${currentSize.text} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
        >
          Venha
        </span>
      </div>
    );
  }

  // Variação 4: Com badge "convites"
  if (variant === "badge") {
    return (
      <div className="relative inline-block">
        <span
          className={`${currentSize.text} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
        >
          Venha
        </span>
        <span className="absolute -top-2 -right-8 text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-medium">
          convites
        </span>
      </div>
    );
  }

  // Variação 5: Minimalista com ponto de destaque
  if (variant === "minimal") {
    return (
      <div className="flex items-baseline">
        <span className={`${currentSize.text} font-bold text-indigo-600`}>
          Venha
        </span>
        <span className="w-2 h-2 bg-pink-500 rounded-full ml-1 mb-1 animate-pulse"></span>
      </div>
    );
  }

  return null;
}
