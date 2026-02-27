"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserTracks, deleteTrack, getTrackLikeCount, updateTrack } from "@/service/track.service";
import { supabase } from "@/lib/supabase/client";
import UploadTrackModal from "@/components/layout/UploadTrackModal";
import Image from "next/image";
import "./page.css";

export default function MisSetsPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [likesCounts, setLikesCounts] = useState<Record<string, number>>({});
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tracksWithOverflow, setTracksWithOverflow] = useState<Set<string>>(new Set());
  const titleRefs = useRef<Record<string, HTMLHeadingElement | null>>({});

  // Obtener usuario autenticado
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      setUserId(user.id);
    };
    
    getUser();
  }, [supabase, router]);

  // Cargar tracks
  useEffect(() => {
    if (!userId) return;

    const loadTracks = async () => {
      setIsLoading(true);
      try {
        const userTracks = await getUserTracks(userId);
        setTracks(userTracks);

        // Cargar likes para cada track
        const counts: Record<string, number> = {};
        for (const track of userTracks) {
          const count = await getTrackLikeCount(track.id);
          counts[track.id] = count;
        }
        setLikesCounts(counts);
      } catch (error) {
        console.error("Error cargando tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [userId]);

  // Detectar overflow en títulos
  useLayoutEffect(() => {
    const checkOverflow = () => {
      const newOverflow = new Set<string>();
      
      Object.entries(titleRefs.current).forEach(([trackId, element]) => {
        if (element && element.scrollWidth > element.clientWidth) {
          newOverflow.add(trackId);
        }
      });
      
      setTracksWithOverflow(newOverflow);
    };

    const timeoutId = setTimeout(checkOverflow, 0);
    
    const handleResize = () => {
      checkOverflow();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [tracks]);

  const handleDeleteTrack = async (trackId: string) => {
    if (!userId) return;
    
    if (!confirm("¿Estás seguro de que quieres eliminar esta canción?")) {
      return;
    }

    try {
      await deleteTrack(userId, trackId);
      setTracks(tracks.filter((t) => t.id !== trackId));
      setToDelete(null);
    } catch (error) {
      console.error("Error al eliminar track:", error);
      alert("Error al eliminar la canción");
    }
  };

  const handleTrackUploaded = (newTrack: any) => {
    setTracks([newTrack, ...tracks]);
  };

  const handleEditTrack = (track: any) => {
    setEditingTrack(track);
    setIsEditModalOpen(true);
  };

  const handleUpdateTrack = async (updatedData: any) => {
    if (!userId || !editingTrack) return;

    try {
      await updateTrack(editingTrack.id, userId, {
        title: updatedData.title,
        content_type: updatedData.content_type,
        genre: updatedData.genre || undefined,
        original_artist: updatedData.original_artist || undefined,
        is_downloadable: updatedData.is_downloadable,
      });

      // Actualizar el track en la lista
      setTracks(
        tracks.map((t) =>
          t.id === editingTrack.id
            ? { ...t, ...updatedData }
            : t
        )
      );

      setIsEditModalOpen(false);
      setEditingTrack(null);
    } catch (error) {
      console.error("Error al actualizar track:", error);
      alert("Error al actualizar la canción");
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownload = async (track: any) => {
    if (!track.is_downloadable || !track.audio_url) return;

    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(track.audio_url)}&name=${encodeURIComponent(track.title)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  const handlePlayTrack = (track: any) => {
    if (playingTrackId === track.id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } else {
      setPlayingTrackId(track.id);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>, trackId: string) => {
    // Solo permitir cambiar si es la canción que se está reproduciendo
    if (playingTrackId !== trackId) return;
    
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleTrackEnd = () => {
    setPlayingTrackId(null);
    setCurrentTime(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tus canciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-3 md:px-4">
        {/* Botón Regreso */}
        <a 
          href="/platform" 
          className="text-red-500 hover:text-red-400 transition inline-flex items-center gap-2 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm md:text-base">Volver</span>
        </a>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Mis Sets</h1>
            <p className="text-sm md:text-base text-gray-400">{tracks.length} canción(es) subida(s)</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap w-full md:w-auto"
          >
            + Subir Canción
          </button>
        </div>

        {/* Tracks */}
        {tracks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4 text-lg">Aún no has subido ninguna canción</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Sube tu primera canción
            </button>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-3">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-3 md:p-4 hover:border-red-500 transition flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 group"
              >
                <div className="flex items-center flex-1 gap-3 min-w-0">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`${tracksWithOverflow.has(track.id) ? 'scrolling-title-container' : ''}`}
                      title={track.title}
                    >
                      <h3
                        ref={(el) => {
                          if (el) titleRefs.current[track.id] = el;
                        }}
                        className={`text-white font-semibold text-sm md:text-base hover:text-red-500 cursor-pointer ${
                          tracksWithOverflow.has(track.id) ? 'whitespace-nowrap scrolling-text' : 'truncate'
                        }`}
                      >
                        {track.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs md:text-sm text-gray-400 mt-1">
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded capitalize">
                        {track.content_type}
                      </span>
                      {track.genre && (
                        <span className="text-gray-500">{track.genre}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3 text-xs text-gray-500 mt-2 items-center">
                      <div className="flex items-center gap-1 text-gray-400 hover:text-gray-200 transition">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 10h4.764a2 2 0 010 4h-3.643l-5.973 7.471A6 6 0 103 13.36l2.496-3.312H3a1 1 0 010-2h3.9a6 6 0 1010.1 9.4" />
                        </svg>
                        <span>{likesCounts[track.id] || 0}</span>
                      </div>
                      {track.is_downloadable && (
                        <div className="flex items-center gap-1 text-gray-400 hover:text-gray-200 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayTrack(track);
                          }}
                          className="flex-shrink-0 text-red-600 hover:text-red-500 transition text-lg"
                        >
                          {playingTrackId === track.id && audioRef.current && !audioRef.current.paused ? "❚❚" : "▶"}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max={duration && playingTrackId === track.id ? duration : track.duration || 0}
                          value={playingTrackId === track.id ? currentTime : 0}
                          onChange={(e) => handleProgressChange(e, track.id)}
                          className="flex-1 track-progress-range"
                          style={{
                            '--progress-width': `${duration && playingTrackId === track.id ? (currentTime / duration) * 100 : 0}%`
                          } as React.CSSProperties}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{playingTrackId === track.id ? formatDuration(currentTime) : "00:00"}</span>
                        <span>{formatDuration(track.duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                  {track.is_downloadable && (
                    <button
                      onClick={() => handleDownload(track)}
                      className="flex-1 md:flex-none px-2 md:px-3 py-1 hover:bg-green-500/20 rounded-lg transition text-gray-400 hover:text-green-400 text-xs font-semibold"
                      title="Descargar canción"
                    >
                      Descargar
                    </button>
                  )}
                  <button
                    onClick={() => handleEditTrack(track)}
                    className="flex-1 md:flex-none px-2 md:px-3 py-1 hover:bg-blue-500/20 rounded-lg transition text-gray-400 hover:text-blue-400 text-xs font-semibold"
                    title="Editar canción"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTrack(track.id)}
                    className="flex-1 md:flex-none px-2 md:px-3 py-1 hover:bg-red-500/20 rounded-lg transition text-gray-400 hover:text-red-400 text-xs font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Modal para subir */}
      <UploadTrackModal
        userId={userId!}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTrackUploaded={handleTrackUploaded}
      />

      {/* Modal para editar */}
      {isEditModalOpen && editingTrack && (
        <EditTrackModal
          track={editingTrack}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTrack(null);
          }}
          onUpdate={handleUpdateTrack}
        />
      )}
    </div>
  );
}

interface EditTrackModalProps {
  track: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
}

function EditTrackModal({ track, isOpen, onClose, onUpdate }: EditTrackModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: track.title || "",
    content_type: track.content_type || "",
    genre: track.genre || "",
    original_artist: track.original_artist || "",
    is_downloadable: track.is_downloadable ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error("El título es requerido");
      }

      if (!formData.content_type.trim()) {
        throw new Error("El tipo de contenido es requerido");
      }

      onUpdate(formData);
    } catch (err: any) {
      console.error("Error al actualizar track:", err);
      setError(err.message || "Error al actualizar la canción");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Editar Canción</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              disabled={isLoading}
            />
          </div>

          {/* Tipo de contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Contenido (ej: Set, Remix, Edit, Mashup)
            </label>
            <input
              type="text"
              value={formData.content_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content_type: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              disabled={isLoading}
            />
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Género
            </label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              disabled={isLoading}
            />
          </div>

          {/* Artista */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Artista
            </label>
            <input
              type="text"
              value={formData.original_artist}
              onChange={(e) =>
                setFormData({ ...formData, original_artist: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              disabled={isLoading}
            />
          </div>

          {/* Descargable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_downloadable"
              checked={formData.is_downloadable}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_downloadable: e.target.checked,
                })
              }
              className="w-4 h-4 accent-red-600"
              disabled={isLoading}
            />
            <label
              htmlFor="is_downloadable"
              className="ml-2 text-sm text-gray-300"
            >
              Permitir descargas
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
