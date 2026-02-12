"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=nombre, 2=contacto, 3=password
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleNextStep = () => {
    setMessage(null);
    if (step === 1 && !form.nombre.trim()) {
      setMessage({ type: "error", text: "Por favor ingresa tu nombre" });
      return;
    }
    if (step === 2 && (!form.email.trim() || !form.telefono.trim())) {
      setMessage({ type: "error", text: "Por favor completa email y teléfono" });
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (step < 3) {
      handleNextStep();
      return;
    }

    // Validar paso 3 (password)
    if (form.password.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
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

      setMessage({ type: "success", text: "Usuario creado correctamente" });
      setForm({ nombre: "", telefono: "", email: "", password: "" });
      setStep(1);
      setLoading(false);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
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
              Crea tu cuenta - Paso {step}/3
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PASO 1: Nombre */}
            {step === 1 && (
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
                  autoFocus
                  className="w-full px-4 py-3 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
                />
              </div>
            )}

            {/* PASO 2: Email y Teléfono */}
            {step === 2 && (
              <>
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
                    autoFocus
                    className="w-full px-4 py-3 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
                  />
                </div>

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
              </>
            )}

            {/* PASO 3: Contraseña */}
            {step === 3 && (
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
                  autoFocus
                  minLength={6}
                  className="w-full px-4 py-3 border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-red-800 outline-none transition"
                />
                <p className="text-zinc-500 text-xs mt-2">Mínimo 6 caracteres</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              {/* Botón Atrás - Solo si no estamos en paso 1 */}
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-3 rounded-lg transition duration-200"
                >
                  Atrás
                </button>
              )}

              {/* Botón siguiente/enviar */}
              <button
                type="submit"
                disabled={loading}
                className={`${step > 1 ? "flex-1" : "w-full"} bg-red-900 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-zinc-100 font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg shadow-red-900/40`}
              >
                {loading ? "Cargando..." : step === 3 ? "Crear Cuenta" : "Siguiente"}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`text-center text-sm font-semibold pt-4 ${
                message.type === "error" ? "text-red-500" : "text-green-500"
              }`}>
                {message.text}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-red-500 hover:text-red-400 font-semibold">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
