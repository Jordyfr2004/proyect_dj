'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export interface AudioTrack { id: string; title: string; artist: string; audio_url: string; cover_url?: string; duration?: number; }
interface AudioContextType {
  track: AudioTrack | null; currentTrackId: string | null; playing: boolean; time: number; duration: number; volume: number; error: string | null;
  playTrack: (track: AudioTrack) => void; toggle: () => void; seek: (time: number) => void; setVolume: (volume: number) => void;
}
const AudioContext = createContext<AudioContextType | undefined>(undefined);
export function AudioProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const audio = useRef<HTMLAudioElement>(null);
  const request = useRef(0);
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, updateVolume] = useState(.8);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!pathname.startsWith('/platform')) {
      ++request.current;
      audio.current?.pause();
    }
  }, [pathname]);
  useEffect(() => {
    // Coordinate with the existing standalone players on other platform pages.
    const handlePlay = (event: Event) => {
      if (event.target instanceof HTMLMediaElement && event.target !== audio.current) audio.current?.pause();
      if (event.target === audio.current) document.querySelectorAll('audio').forEach(element => { if (element !== audio.current) element.pause(); });
    };
    document.addEventListener('play', handlePlay, true);
    return () => document.removeEventListener('play', handlePlay, true);
  }, []);
  async function start() {
    const element = audio.current;
    if (!element) return;
    const attempt = ++request.current;
    setError(null);
    try { await element.play(); }
    catch (reason) {
      if (attempt !== request.current || (reason instanceof DOMException && reason.name === 'AbortError')) return;
      setPlaying(false); setError('No se pudo reproducir este audio. Inténtalo de nuevo.');
    }
  }
  function toggle() {
    if (!audio.current || !track) return;
    if (audio.current.paused) void start(); else { ++request.current; audio.current.pause(); }
  }
  function playTrack(next: AudioTrack) {
    if (!audio.current) return;
    if (track?.id === next.id) { toggle(); return; }
    ++request.current;
    audio.current.pause();
    audio.current.src = next.audio_url;
    audio.current.volume = volume;
    setTrack(next); setTime(0); setDuration(next.duration || 0);
    void start();
  }
  function seek(value: number) {
    if (!audio.current || !Number.isFinite(audio.current.duration)) return;
    const target = Math.max(0, Math.min(value, audio.current.duration));
    audio.current.currentTime = target; setTime(target);
  }
  function setVolume(value: number) { const safe = Math.max(0, Math.min(1, value)); updateVolume(safe); if (audio.current) audio.current.volume = safe; }
  return <AudioContext.Provider value={{ track, currentTrackId: track?.id || null, playing, time, duration, volume, error, playTrack, toggle, seek, setVolume }}>
    {children}
    <audio ref={audio} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={event => setTime(event.currentTarget.currentTime)} onLoadedMetadata={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onEnded={() => setPlaying(false)} onError={() => { setPlaying(false); setError('No se pudo cargar el audio. Comprueba tu conexión o prueba otro track.'); }} />
  </AudioContext.Provider>;
}
export function useAudio() { const context = useContext(AudioContext); if (!context) throw new Error('useAudio debe usarse dentro de AudioProvider'); return context; }
export function formatTime(seconds: number) { const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0; return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${Math.floor(safe % 60).toString().padStart(2, '0')}`; }
