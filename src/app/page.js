// src/app/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar automaticamente para a página de auth
    router.push("/auth");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Redirecionando...</p>
    </div>
  );
}
