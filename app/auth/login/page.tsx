"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
        setLoading(false);
        return;
      }

      setMessage({ type: "success", text: "Sesión iniciada correctamente" });
      setForm({ email: "", password: "" });
      setLoading(false);
    } catch (error) {
      setMessage({ type: "error", text: "Error en la solicitud" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Orbe rojo de fondo */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-900/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-900/15 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-950 rounded-lg shadow-2xl shadow-red-900/40 p-8 border border-zinc-800">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-2">
              DJ CONTROL HUB
            </h1>
            <p className="text-zinc-400 text-sm">
              Inicia sesión en tu cuenta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-900 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-zinc-100 font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg shadow-red-900/40"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>

            {/* Message */}
            {message && (
              <div className={`text-center text-sm font-semibold pt-2 ${
                message.type === "error" ? "text-red-500" : "text-green-500"
              }`}>
                {message.text}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/register" className="text-red-500 hover:text-red-400 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
