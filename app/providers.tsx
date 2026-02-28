'use client';

import { DownloadProvider } from '@/contexts/DownloadContext';
import DownloadNotifications from '@/components/ui/DownloadNotification';
import { AudioProvider } from '@/contexts/AudioContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <DownloadProvider>
        {children}
        <DownloadNotifications />
      </DownloadProvider>
    </AudioProvider>
  );
}
