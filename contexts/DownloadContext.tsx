'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DownloadNotification {
  id: string;
  title: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
}

interface DownloadContextType {
  notifications: DownloadNotification[];
  addDownload: (id: string, title: string) => void;
  updateProgress: (id: string, progress: number) => void;
  completeDownload: (id: string) => void;
  removeNotification: (id: string) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<DownloadNotification[]>([]);

  const addDownload = useCallback((id: string, title: string) => {
    setNotifications((prev) => [
      ...prev,
      {
        id,
        title,
        progress: 0,
        status: 'downloading',
      },
    ]);
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, progress: Math.min(progress, 100) } : notif
      )
    );
  }, []);

  const completeDownload = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, status: 'completed', progress: 100 } : notif
      )
    );

    // Auto-remove after 2 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 2000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <DownloadContext.Provider
      value={{
        notifications,
        addDownload,
        updateProgress,
        completeDownload,
        removeNotification,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownloadNotification() {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownloadNotification debe usarse dentro de DownloadProvider');
  }
  return context;
}
