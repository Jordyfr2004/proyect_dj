'use client';

import { useAuth } from '@/hooks/useAuth';

export default function PlatformPage() {
  const { user, loading, logoutLoading, logout } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-900 rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useAuth se encarga de redirigir
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 px-6 py-12">
      
      {/* Loader de logout - overlay */}
      {logoutLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-900 rounded-full animate-spin mb-4" />
            <p className="text-zinc-400 text-sm">Cerrando sesión...</p>
          </div>
        </div>
      )}
      
      {/* Header con Logout */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Bienvenido a la Plataforma
            </h1>
            <p className="text-zinc-400 mt-4 max-w-2xl">
              Este es tu espacio privado dentro de DJ Control Hub.  
              Aquí podrás conectar con otros DJs, compartir sets,
              descubrir eventos y expandir tu presencia en la escena.
            </p>
          </div>
          <button
            onClick={logout}
            disabled={logoutLoading}
            className="bg-red-900 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-zinc-100 font-semibold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg shadow-red-900/40 whitespace-nowrap"
          >
            {logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>

        {/* Secciones simuladas tipo red social */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* Feed */}
          <div className="md:col-span-2 bg-zinc-950 p-6 rounded-xl border border-zinc-800 shadow-lg shadow-black/40">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">
              Feed de la Comunidad
            </h2>
            <p className="text-zinc-400 text-sm">
              Aquí aparecerán publicaciones de DJs, nuevos lanzamientos,
              clips de sesiones y anuncios de eventos.
            </p>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                Tu Perfil
              </h3>
              <p className="text-zinc-400 text-sm">
                Gestiona tu identidad artística, bio, redes sociales
                y estadísticas de rendimiento.
              </p>
            </div>

            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                Eventos Cercanos
              </h3>
              <p className="text-zinc-400 text-sm">
                Descubre clubs, festivales y colaboraciones
                disponibles en tu ciudad.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
