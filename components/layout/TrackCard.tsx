"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { useAudio } from "@/contexts/AudioContext";
import "./TrackCard.css";

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
  const [isTextOverflowing, setIsTextOverflowing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { currentTrackId, setCurrentTrackId } = useAudio();

  useLayoutEffect(() => {
    if (titleRef.current) {
      // Usar setTimeout para asegurar que el elemento tiene su ancho final
      const timeoutId = setTimeout(() => {
        if (titleRef.current) {
          const hasOverflow = titleRef.current.scrollWidth > titleRef.current.clientWidth;
          setIsTextOverflowing(hasOverflow);
        }
      }, 0);
      
      // Verificar también cuando la ventana cambia de tamaño
      const handleResize = () => {
        if (titleRef.current) {
          setIsTextOverflowing(titleRef.current.scrollWidth > titleRef.current.clientWidth);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [title]);

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

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir cambiar si es la canción que se está reproduciendo
    if (currentTrackId !== id) return;
    
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
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
    <div className="group bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition cursor-pointer shadow-lg hover:shadow-slate-700/50">
      {/* Cover */}
      {cover_url ? (
        <div className="aspect-video sm:aspect-square relative overflow-hidden">
          <Image
            src={cover_url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        </div>
      ) : (
        <div className="aspect-video sm:aspect-square bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center relative group/cover">
          <svg
            className="w-24 h-24 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3v9.28c-.47-.46-1.12-.75-1.84-.75-2.49 0-4.5 2.01-4.5 4.5S7.67 21 12 21s4.5-2.01 4.5-4.5V7h4V3h-7z" />
          </svg>
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <div
          className={`mb-2 ${isTextOverflowing ? 'overflow-hidden' : ''} ${
            isTextOverflowing && isPlaying ? 'scrolling-title-container' : ''
          }`}
          title={title}
        >
          <h3
            ref={titleRef}
            className={`text-lg font-semibold text-zinc-100 transition group-hover:text-slate-300 ${
              isTextOverflowing ? 'whitespace-nowrap' : ''
            } ${
              isTextOverflowing && isPlaying ? 'scrolling-text' : 'truncate'
            }`}
          >
            {title}
          </h3>
        </div>
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
              <span className="px-2 py-1 bg-slate-500/20 text-slate-300 rounded capitalize">
                {content_type}
              </span>
            )}
            {duration && <span>{formatTime(duration)}</span>}
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <span className="text-slate-400 animate-pulse">♫</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {duration && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex-shrink-0 text-zinc-400 hover:text-zinc-200 transition text-sm"
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="flex-1 track-progress-range"
                style={{
                  '--progress-width': `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                } as React.CSSProperties}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            {/* Like and Download */}
            <div className="flex items-center gap-3 pt-1">
              <button
                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition text-xs"
                title="Me gusta"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              {is_downloadable && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition disabled:opacity-50 text-xs"
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
