'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PlatformPage() {
  const { user, loading, logoutLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="min-h-screen bg-black text-zinc-200">
      
      {/* Loader de logout - overlay */}
      {logoutLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-900 rounded-full animate-spin mb-4" />
            <p className="text-zinc-400 text-sm">Cerrando sesión...</p>
          </div>
        </div>
      )}
      
      {/* Navbar */}
      <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-6">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              DJ HUB
            </h1>
          </div>

          {/* Search Input */}
          <div className="flex-1 mx-8">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="¿Qué quieres buscar?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/30 transition"
              />
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            disabled={logoutLoading}
            className="bg-red-900 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-zinc-100 font-semibold py-2 px-6 rounded-full transition duration-200 transform hover:scale-105 shadow-lg shadow-red-900/40 whitespace-nowrap"
          >
            {logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </nav>

      {/* Main Content (Empty for now) */}
      <main className="p-6">
        {/* Aquí irá el contenido principal */}
      </main>
    </div>
  );
}
