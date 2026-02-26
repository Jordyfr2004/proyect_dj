"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAudio } from "@/contexts/AudioContext";

interface TrackCardProps {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_url?: string;
  avatar_url?: string;
  duration?: number;
  content_type?: string;
  is_downloadable?: boolean;
}

export default function TrackCard({
  id,
  title,
  artist,
  audio_url,
  cover_url,
  avatar_url,
  duration,
  content_type,
  is_downloadable = true,
}: TrackCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrackId, setCurrentTrackId } = useAudio();

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTrackId(null);
    } else {
      // Si hay otro track reproduciéndose, actualizar el contexto
      if (currentTrackId !== id) {
        setCurrentTrackId(id);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Pausar este track si otro comienza a reproducirse
  useEffect(() => {
    if (currentTrackId && currentTrackId !== id && isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentTrackId, id, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!is_downloadable || !audio_url) return;

    setIsDownloading(true);
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(audio_url)}&name=${encodeURIComponent(title)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition cursor-pointer shadow-lg hover:shadow-red-900/50">
      {/* Cover */}
      {cover_url ? (
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={cover_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition"
          >
            <svg
              className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center relative group/cover">
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/cover:bg-black/40 transition"
          >
            <svg
              className={`w-16 h-16 transition ${
                isPlaying ? "text-red-500" : "text-zinc-300 opacity-50 group-hover/cover:opacity-100"
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-red-500 transition mb-2 truncate">
          {title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          {avatar_url && (
            <Image
              src={avatar_url}
              alt={artist}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
          )}
          <p className="text-sm text-zinc-400 truncate">{artist}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            {content_type && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded capitalize">
                {content_type}
              </span>
            )}
            {duration && <span>{formatTime(duration)}</span>}
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <span className="text-red-500 animate-pulse">♫</span>
            )}
            {is_downloadable && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="hover:text-red-500 transition disabled:opacity-50"
                title="Descargar canción"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {duration && (
          <div className="mt-2 bg-zinc-700 rounded-full h-1 overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        )}
      </div>

      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        src={audio_url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        crossOrigin="anonymous"
      />
    </div>
  );
}
