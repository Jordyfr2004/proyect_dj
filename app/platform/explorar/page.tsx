'use client';

import { useState, useEffect } from 'react';
import { getAllTracks } from '@/service/track.service';
import TrackCard from '@/components/layout/TrackCard';
import Image from 'next/image';

export default function ExplorarPage() {
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
          track.profiles?.display_name?.toLowerCase().includes(query)
      );
    }

    setFilteredTracks(filtered);
  }, [selectedFilter, searchQuery, tracks]);

  // Obtener tipos únicos de contenido
  const contentTypes = Array.from(new Set(tracks.map((t) => t.content_type))).filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-zinc-200 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-2">
            Explorar
          </h1>
          <p className="text-zinc-400 text-lg">Descubre todas las canciones, intros y edits del DJ community</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500"
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
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 transition"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedFilter(null)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
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
              className={`px-4 py-2 rounded-full font-semibold transition capitalize ${
                selectedFilter === type
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {type}
            </button>
          ))}
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
