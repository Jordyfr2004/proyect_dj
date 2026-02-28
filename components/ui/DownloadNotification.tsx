'use client';

import { useDownloadNotification } from '@/contexts/DownloadContext';
import './DownloadNotification.css';

export default function DownloadNotifications() {
  const { notifications } = useDownloadNotification();

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="download-notification pointer-events-auto bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4 w-80 animate-slideIn relative"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {notif.status === 'completed' ? 'Descargado' : 'Descargándose'}
              </h3>
              <p className="text-xs text-gray-400 truncate">{notif.title}</p>
            </div>
            {notif.status === 'completed' && (
              <svg className="w-5 h-5 text-green-400 ml-2 flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                notif.status === 'completed'
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
              }`}
              style={{ width: `${notif.progress}%` }}
            />
          </div>

          {/* Percentage */}
          <div className="mt-2 text-right">
            <span className="text-xs text-gray-500 font-medium">
              {notif.status === 'completed' ? '100%' : `${Math.round(notif.progress)}%`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
