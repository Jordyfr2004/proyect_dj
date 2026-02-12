"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireccionar a login con parámetro para mostrar formulario de registro
    router.push("/auth/login?mode=register");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900 mx-auto"></div>
        <p className="text-zinc-400 mt-4">Redireccionando...</p>
      </div>
    </div>
  );
}
