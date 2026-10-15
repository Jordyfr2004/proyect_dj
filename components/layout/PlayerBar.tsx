'use client';
import { useAudio, formatTime } from '@/contexts/AudioContext';
import TrackArtwork from './TrackArtwork';
import './PlayerBar.css';
export default function PlayerBar() {
  const { track, playing, toggle, time, duration, seek, volume, setVolume, error } = useAudio();
  return <section className="zm-player" aria-label="Reproductor de música">
    <div className="zm-player-track">{track ? <><TrackArtwork id={track.id} title={track.title} cover={track.cover_url} /><div><strong title={track.title}>{track.title}</strong><span>{track.artist}</span></div></> : <><div className="zm-player-empty" aria-hidden="true">♫</div><div><strong>Tu próxima mezcla empieza aquí</strong><span>Elige un track para escuchar</span></div></>}</div>
    <div className="zm-player-controls"><button type="button" className="zm-player-play" onClick={toggle} disabled={!track} aria-label={playing ? 'Pausar' : 'Reproducir'}>{playing ? 'Ⅱ' : '▶'}</button><span>{formatTime(time)}</span><input aria-label="Posición de reproducción" type="range" min={0} max={duration || 0} step={.1} value={Math.min(time, duration)} disabled={!track || !duration} onChange={event => seek(Number(event.target.value))} /><span>{formatTime(duration)}</span></div>
    <div className="zm-player-volume"><button type="button" onClick={() => setVolume(volume ? 0 : .8)} aria-label={volume ? 'Silenciar' : 'Activar sonido'}>{volume ? '♪' : '×'}</button><input aria-label="Volumen" type="range" min={0} max={1} step={.01} value={volume} onChange={event => setVolume(Number(event.target.value))} /></div>
    {error && <p role="alert" className="zm-player-error">{error}</p>}
  </section>;
}
