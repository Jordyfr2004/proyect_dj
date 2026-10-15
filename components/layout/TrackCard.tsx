"use client";
import { useState } from "react";
import { useAudio, formatTime } from "@/contexts/AudioContext";
import { useDownloadNotification } from "@/contexts/DownloadContext";
import { saveDownloadRecord } from "@/service/download.service";
import TrackArtwork from "./TrackArtwork";
import "./TrackCard.css";
interface TrackCardProps { id: string; title: string; artist: string; audio_url: string; cover_url?: string; avatar_url?: string; duration?: number; content_type?: string; genre?: string; is_downloadable?: boolean; userId?: string | null; view?: 'grid' | 'list'; }
export default function TrackCard({ id, title, artist, audio_url, cover_url, duration, content_type, genre, is_downloadable = true, userId = null, view = 'grid' }: TrackCardProps) {
  const { currentTrackId, playing, playTrack } = useAudio();
  const isPlaying = currentTrackId === id && playing;
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const { addDownload, updateProgress, completeDownload, removeNotification } = useDownloadNotification();
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!is_downloadable || !audio_url) return;

    const downloadId = `download-${id}-${Date.now()}`;
    setIsDownloading(true);
    addDownload(downloadId, title);

    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(audio_url)}&name=${encodeURIComponent(title)}`;

      // Usar fetch con progreso real
      const response = await fetch(downloadUrl);
      
      if (!response.ok) throw new Error('Error en descarga');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No se puede leer la respuesta');

      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        received += value.length;
        
        // Actualizar progreso basado en bytes reales
        const progress = total > 0 ? (received / total) * 100 : 0;
        updateProgress(downloadId, Math.min(progress, 99));
      }

      // Combinar chunks y descargar
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      updateProgress(downloadId, 100);

      // Guardar registro de descarga
      if (userId) {
        await saveDownloadRecord(userId, id, title);
      }

      // Mostrar animaciÃ³n de Ã©xito
      completeDownload(downloadId);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error al descargar:', error); removeNotification(downloadId); setDownloadError('No se pudo descargar. Inténtalo de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  };

  return <article className={`zm-track ${view === 'list' ? 'zm-track-list' : ''} ${currentTrackId === id ? 'zm-track-active' : ''}`}>
    <div className="zm-track-cover"><TrackArtwork id={id} title={title} cover={cover_url} /><button type="button" className="zm-track-play" aria-label={`${isPlaying ? 'Pausar' : 'Reproducir'} ${title}`} onClick={() => playTrack({ id, title, artist, audio_url, cover_url, duration })}>{isPlaying ? 'Ⅱ' : '▶'}</button>{isPlaying && <span className="zm-equalizer" aria-label="Reproduciendo"><i /><i /><i /></span>}</div>
    <div className="zm-track-info"><h3 title={title}>{title}</h3><p title={artist}>{artist}</p><div className="zm-track-meta"><span>{content_type || 'Track'}</span>{genre && <span>{genre}</span>}<time>{duration ? formatTime(duration) : '—'}</time></div></div>
    <div className="zm-track-actions"><button type="button" aria-label={`${isLiked ? 'Quitar de' : 'Añadir a'} favoritos: ${title}`} aria-pressed={isLiked} onClick={() => setIsLiked(!isLiked)} className={isLiked ? 'zm-liked' : ''}>{isLiked ? '♥' : '♡'}</button>{is_downloadable && <button type="button" disabled={isDownloading} aria-label={`Descargar ${title}`} onClick={event => { setDownloadError(''); void handleDownload(event); }}>{downloadSuccess ? '✓' : isDownloading ? '…' : '↓'}</button>}<span>{isPlaying ? 'SONANDO AHORA' : 'ZONA MIX'}</span></div>
    {downloadError && <p className="zm-track-error" role="alert">{downloadError}</p>}
  </article>;
}
