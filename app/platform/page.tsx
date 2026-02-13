'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PlatformPage() {
  const { user, loading, logoutLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 transition-transform duration-300 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          
          {/* Logo/Brand */}
          <div className="pb-4 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Menú</h2>
          </div>

          {/* Menu Items */}
          <nav className="space-y-3">
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition text-zinc-300 hover:text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4" />
              </svg>
              <span className="font-medium">Inicio</span>
            </a>
            
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition text-zinc-300 hover:text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
              </svg>
              <span className="font-medium">Mis Sets</span>
            </a>
            
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition text-zinc-300 hover:text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="font-medium">Explorar</span>
            </a>
            
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition text-zinc-300 hover:text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a6 6 0 0112 0v2H6v-2z" />
              </svg>
              <span className="font-medium">Personas</span>
            </a>
            
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition text-zinc-300 hover:text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="font-medium">Descargas</span>
            </a>
            
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition text-zinc-300 hover:text-red-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <span className="font-medium">Configuración</span>
            </button>

            {/* Settings Submenu */}
            {settingsOpen && (
              <div className="pl-8 space-y-2">
                <button
                  onClick={logout}
                  disabled={logoutLoading}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-900/20 transition text-red-400 hover:text-red-300 disabled:opacity-50 text-left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">{logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}</span>
                </button>
              </div>
            )}
          </nav>

          {/* Footer Section */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 text-center">Zona Mix © 2026</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Navbar */}
      <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
        
        {/* Mobile Search Expanded */}
        {searchExpanded && (
          <div className="sm:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="¿Qué quieres buscar?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/30 transition"
                />
              </div>
              <button
                onClick={() => setSearchExpanded(false)}
                className="p-2 hover:bg-zinc-900 rounded-lg transition text-zinc-400 hover:text-zinc-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Navbar Content */}
        <div className={`flex items-center justify-between h-16 px-6 gap-2 sm:gap-0 ${searchExpanded && 'sm:flex hidden'}`}>
          
          {/* Menu Toggle (Mobile) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 sm:p-1 hover:bg-zinc-900 rounded-lg transition text-zinc-300 hover:text-red-500 border-r border-zinc-800 pr-4"
          >
            <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Zona Mix
            </h1>
          </div>

          {/* Search Input - Hidden on Mobile when not expanded */}
          <div className="hidden sm:flex flex-1 mx-8">
            <div className="relative w-full">
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

          {/* Right Icons Container */}
          <div className="flex items-center gap-1 sm:gap-0">
            
            {/* Search Button - Mobile Only */}
            <button
              onClick={() => setSearchExpanded(true)}
              className="sm:hidden p-3 hover:bg-zinc-900 rounded-lg transition text-zinc-300 hover:text-red-500 border-r border-zinc-800"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Home Icon */}
            <a
              href="/platform"
              className="p-3 sm:p-2 hover:bg-zinc-900 rounded-lg transition text-zinc-300 hover:text-red-500 border-r border-zinc-800 sm:border-r-0 sm:mr-2"
            >
              <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4" />
              </svg>
            </a>

            {/* Downloads Icon */}
            <a
              href="#"
              className="p-3 sm:p-2 hover:bg-zinc-900 rounded-lg transition text-zinc-300 hover:text-red-500 border-r border-zinc-800 sm:border-r-0 sm:mr-2"
            >
              <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>

            {/* User Icon */}
            <div className="p-3 sm:p-2 sm:mr-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-red-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
          </div>

          {/* Logout Button - Desktop Only */}
          <button
            onClick={logout}
            disabled={logoutLoading}
            className="hidden sm:block bg-red-900 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-zinc-100 font-semibold py-2 px-6 rounded-full transition duration-200 transform hover:scale-105 shadow-lg shadow-red-900/40 whitespace-nowrap"
          >
            {logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        {/* Aquí irá el contenido principal */}
      </main>
    </div>
  );
}
