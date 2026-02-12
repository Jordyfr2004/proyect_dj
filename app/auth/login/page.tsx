"use client";

import { useState, useEffect } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Leer parámetros después de montar
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "register") {
      setIsLogin(false);
    }
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const payload = isLogin 
        ? { email: form.email, password: form.password }
        : { nombre: form.nombre, telefono: form.telefono, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        setLoading(false);
        return;
      }

      alert(isLogin ? "Sesión iniciada correctamente" : "Usuario creado correctamente");
      setForm({ nombre: "", telefono: "", email: "", password: "", confirmPassword: "" });
      setLoading(false);
    } catch (error) {
      alert("Error en la solicitud");
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
              {isLogin ? "Inicia sesión en tu cuenta" : "Crea tu cuenta para continuar"}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-0 mb-8 bg-zinc-900 rounded-full p-1 border border-zinc-700">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-200 ${
                isLogin
                  ? "bg-red-900 text-zinc-100 shadow-lg shadow-red-900/40"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-200 ${
                !isLogin
                  ? "bg-red-900 text-zinc-100 shadow-lg shadow-red-900/40"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre Input - Solo en registro */}
            {!isLogin && (
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Juan Pérez"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
                />
              </div>
            )}

            {/* Teléfono Input - Solo en registro */}
            {!isLogin && (
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-zinc-300 mb-2">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  placeholder="+34 612 345 678"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
                />
              </div>
            )}

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
              className="w-full bg-red-900 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-zinc-100 font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg shadow-red-900/40 mt-6"
            >
              {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
