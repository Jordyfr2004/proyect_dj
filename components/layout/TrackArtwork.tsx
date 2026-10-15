import type { CSSProperties } from 'react';
import Image from 'next/image';
import './TrackCard.css';
export default function TrackArtwork({ title, id, cover }: { title: string; id: string; cover?: string }) {
  const hue = Array.from(id).reduce((value, character) => value + character.charCodeAt(0), 0) % 360;
  return <div className="zm-artwork" style={{ '--cover-hue': hue } as CSSProperties}>
    {cover ? <Image src={cover} alt="" fill sizes="(max-width: 640px) 50vw, 260px" className="object-cover" /> : <><span className="zm-artwork-orbit" aria-hidden="true" /><small>ZONA MIX / SELECTED SOUNDS</small><strong aria-hidden="true">{title.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</strong><span className="zm-artwork-caption">{title}</span></>}
  </div>;
}
