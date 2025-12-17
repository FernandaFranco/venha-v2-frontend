// src/app/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      // Verificar se o usuário está autenticado
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        withCredentials: true,
      });

      // Se a chamada foi bem-sucedida, usuário está autenticado
      router.push("/dashboard");
    } catch (err) {
      // Se retornou 401 ou qualquer erro, usuário não está autenticado
      router.push("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Redirecionando...</p>
    </div>
  );
}
