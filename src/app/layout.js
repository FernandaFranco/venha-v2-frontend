// src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "Venha - Sistema de Convites",
  description: "Crie e gerencie convites para seus eventos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
