"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Verificar si ya está logueado
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace("/platform");
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }

      setMessage({ type: "success", text: "Sesión iniciada correctamente" });
      setForm({ email: "", password: "" });
      
      setTimeout(() => {
        router.push("/platform");
      }, 1500);
    } catch (error) {
      setMessage({ type: "error", text: "Error en la solicitud" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradiente radial de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(127,29,29,0.15),_transparent_70%)]" />
      
      {/* Orbes flotantes con efecto de bajos */}
      <div className="absolute -top-60 -right-60 w-96 h-96 bg-red-900/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-red-900/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: "0.5s"}} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-900/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: "1s"}} />
      
      {/* Loader mientras verifica sesión */}
      {checkingAuth && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-900 rounded-full animate-spin mb-4" />
            <p className="text-zinc-400 text-sm">Cargando...</p>
          </div>
        </div>
      )}

      {/* Formulario - solo mostrar si no está verificando */}
      {!checkingAuth && (
        <div className="w-full max-w-md relative z-10 fixed sm:relative bottom-0 sm:bottom-auto left-0 sm:left-auto right-0 sm:right-auto">
        {/* Contenedor desktop con tarjeta */}
        <div className="hidden sm:block bg-zinc-950 rounded-lg shadow-2xl shadow-red-900/40 p-8 border border-zinc-800">
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-10 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 5C6.47 5 2.25 8.15 1 12.35c.5 1.42 1.3 2.72 2.26 3.88L2.42 17.07c-.46.46-.46 1.21 0 1.67.23.23.54.34.84.34.3 0 .61-.11.84-.34L5.87 15.7c1.44 1.12 3.21 1.8 5.12 1.8s3.68-.68 5.12-1.8l2.71 2.71c.23.23.54.34.84.34.3 0 .61-.11.84-.34.46-.46.46-1.21 0-1.67l-1.85-1.85c.96-1.16 1.76-2.46 2.26-3.88C21.75 8.15 17.53 5 11.99 5zm0 9c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                    </svg>
                  )}
                </button>
              </div>
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

        {/* Contenedor móviles sin tarjeta */}
        <div className="sm:hidden p-8">
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-10 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 5C6.47 5 2.25 8.15 1 12.35c.5 1.42 1.3 2.72 2.26 3.88L2.42 17.07c-.46.46-.46 1.21 0 1.67.23.23.54.34.84.34.3 0 .61-.11.84-.34L5.87 15.7c1.44 1.12 3.21 1.8 5.12 1.8s3.68-.68 5.12-1.8l2.71 2.71c.23.23.54.34.84.34.3 0 .61-.11.84-.34.46-.46.46-1.21 0-1.67l-1.85-1.85c.96-1.16 1.76-2.46 2.26-3.88C21.75 8.15 17.53 5 11.99 5zm0 9c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                    </svg>
                  )}
                </button>
              </div>
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
      )}
    </div>
  );
}
