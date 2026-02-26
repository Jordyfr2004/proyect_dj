"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserTracks, deleteTrack, getTrackLikeCount } from "@/service/track.service";
import { supabase } from "@/lib/supabase/client";
import UploadTrackModal from "@/components/layout/UploadTrackModal";
import Image from "next/image";

export default function MisSetsPage() {
  const router = useRouter();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [likesCounts, setLikesCounts] = useState<Record<string, number>>({});

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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mis Sets</h1>
            <p className="text-gray-400">{tracks.length} canción(es) subida(s)</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            + Subir Canción
          </button>
        </div>

        {/* Tracks */}
        {tracks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-400 mb-4">Aún no has subido ninguna canción</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Sube tu primera canción
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-red-500 transition flex items-center justify-between group"
              >
                <div className="flex items-center flex-1 gap-4">
                  {/* Cover */}
                  {track.cover_url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={track.cover_url}
                        alt={track.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🎵</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate hover:text-red-500 cursor-pointer">
                      {track.title}
                    </h3>
                    <div className="flex gap-2 text-sm text-gray-400 mt-1">
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded capitalize">
                        {track.content_type}
                      </span>
                      {track.genre && (
                        <span className="text-gray-500 truncate">{track.genre}</span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 mt-2">
                      <span>⏱️ {formatDuration(track.duration)}</span>
                      <span>❤️ {likesCounts[track.id] || 0} likes</span>
                      {track.is_downloadable && <span>📥 Descargable</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {track.is_downloadable && (
                    <button
                      onClick={() => handleDownload(track)}
                      className="p-2 hover:bg-green-500/20 rounded-lg transition text-gray-400 hover:text-green-400"
                      title="Descargar canción"
                    >
                      ⬇️
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white">
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteTrack(track.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-gray-400 hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <UploadTrackModal
        userId={userId!}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTrackUploaded={handleTrackUploaded}
      />
    </div>
  );
}
