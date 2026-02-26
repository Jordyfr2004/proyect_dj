'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AudioContextType {
  currentTrackId: string | null;
  setCurrentTrackId: (id: string | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  return (
    <AudioContext.Provider value={{ currentTrackId, setCurrentTrackId }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio debe usarse dentro de AudioProvider');
  }
  return context;
}
