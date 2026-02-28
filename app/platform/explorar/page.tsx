'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAllTracks } from '@/service/track.service';
import TrackCard from '@/components/layout/TrackCard';
import Image from 'next/image';

export default function ExplorarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tracks, setTracks] = useState<any[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const allTracks = await getAllTracks(200);
        setTracks(allTracks);
        setFilteredTracks(allTracks);
      } catch (error) {
        console.error('Error cargando canciones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  // Filtrar tracks
  useEffect(() => {
    let filtered = tracks;

    // Filtro por tipo
    if (selectedFilter) {
      filtered = filtered.filter(
        (track) => track.content_type?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(query) ||
          track.profiles?.display_name?.toLowerCase().includes(query) ||
          track.original_artist?.toLowerCase().includes(query)
      );
    }

    setFilteredTracks(filtered);
  }, [selectedFilter, searchQuery, tracks]);

  // Obtener tipos únicos de contenido
  const contentTypes = Array.from(new Set(tracks.map((t) => t.content_type))).filter(Boolean);

  return (
    <>
      {/* Fixed Search and Filters Section */}
      <div className="fixed top-0 md:top-0 left-0 right-0 z-40 bg-black border-b border-zinc-800 shadow-lg shadow-red-900/20 py-3 md:py-4">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          {/* Back Button Row (Mobile) */}
          <div className="mb-2 md:hidden">
            <button
              onClick={() => router.back()}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 transition"
              title="Regresar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          {/* Search Bar */}
          <div className="mb-3 md:mb-4 flex items-center gap-2">
            {/* Back Button (Desktop) */}
            <button
              onClick={() => router.back()}
              className="hidden md:flex flex-shrink-0 p-2 text-zinc-400 hover:text-zinc-200 transition"
              title="Regresar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar canciones o artistas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold transition whitespace-nowrap ${
                selectedFilter === null
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Todos
            </button>
            {contentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type || '')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold transition capitalize whitespace-nowrap ${
                  selectedFilter === type
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-black text-zinc-200 pt-36 md:pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="hidden md:block text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-2">
            Explorar
          </h1>
          <p className="hidden md:block text-xs md:text-base text-zinc-400">Descubre todas las canciones, intros y edits del DJ community</p>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-zinc-400">
            Mostrando <span className="text-red-500 font-semibold">{filteredTracks.length}</span> resultado(s)
          </p>
        </div>

        {/* Tracks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-900 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Cargando contenido...</p>
            </div>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="bg-zinc-900 rounded-lg p-12 text-center">
            <p className="text-zinc-400 text-lg mb-2">No se encontraron resultados</p>
            <p className="text-zinc-500 text-sm">Intenta con otros filtros o palabras clave</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                id={track.id}
                title={track.title}
                artist={track.profiles?.display_name || 'Artista desconocido'}
                audio_url={track.audio_url}
                cover_url={track.cover_url}
                avatar_url={track.profiles?.avatar_url}
                duration={track.duration}
                content_type={track.content_type}
                is_downloadable={track.is_downloadable}
                userId={user?.id}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
