// src/app/auth/page.js
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  validateWhatsApp,
  formatWhatsApp,
} from "../utils/validators";
import Logo from "../components/Logo";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    whatsapp_number: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Formatar WhatsApp automaticamente enquanto digita
    if (name === "whatsapp_number") {
      setFormData({
        ...formData,
        [name]: formatWhatsApp(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      setMessage("Login bem-sucedido!");
      console.log("Usuário logado:", response.data);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao fazer login");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Normalizar o número de WhatsApp
    const normalizedWhatsApp = validateWhatsApp(formData.whatsapp_number);
    if (!normalizedWhatsApp) {
      setError("WhatsApp inválido. Use o formato: (21) 99999-9999 ou 5521999999999");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          whatsapp_number: normalizedWhatsApp,
        },
        {
          withCredentials: true,
        }
      );

      setMessage("Conta criada com sucesso!");
      console.log("Usuário criado:", response.data);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao criar conta");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <Logo size="medium" variant="full" />
          <p className="text-gray-600 mt-2">
            {isLogin ? "Faça login para continuar" : "Crie sua conta"}
          </p>
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          {/* Campo: Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          {/* Campo: Senha */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {/* Campos extras para Signup */}
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="João Silva"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  WhatsApp
                </label>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="(21) 99999-9999"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato aceito: (21) 99999-9999, 21999999999 ou 5521999999999
                </p>
              </div>
            </>
          )}

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
          </button>
        </form>

        {/* Toggle entre Login e Signup */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isLogin
              ? "Não tem conta? Cadastre-se"
              : "Já tem conta? Faça login"}
          </button>
        </div>
      </div>
    </div>
  );
}
