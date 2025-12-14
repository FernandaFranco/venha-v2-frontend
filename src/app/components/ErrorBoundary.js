"use client";

import { Alert, Button } from "antd";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";

export default function ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert
          message="Algo deu errado"
          description={
            <div>
              <p className="mb-4">
                Desculpe, encontramos um problema inesperado. Nossa equipe foi
                notificada.
              </p>
              <details className="mb-4">
                <summary className="cursor-pointer text-gray-600 text-sm">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {error?.message || "Erro desconhecido"}
                </pre>
              </details>
              <div className="flex gap-2">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={resetError}
                >
                  Tentar Novamente
                </Button>
                <Button
                  icon={<HomeOutlined />}
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Ir para Dashboard
                </Button>
              </div>
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    </div>
  );
}
