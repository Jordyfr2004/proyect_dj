"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  getUserDownloads,
  groupDownloadsByDate,
  deleteDownloadRecord,
  clearDownloadHistory,
} from "@/service/download.service";
import Image from "next/image";
import "./page.css";

interface DownloadRecord {
  id: string;
  user_id: string;
  track_id: string;
  track_title: string;
  downloaded_at: string;
}

export default function DescarguasPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupedDownloads, setGroupedDownloads] = useState<Record<string, DownloadRecord[]>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Obtener usuario
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);
    };

    getUser();
  }, [router]);

  // Cargar descargas
  useEffect(() => {
    if (!userId) return;

    const loadDownloads = async () => {
      setIsLoading(true);
      try {
        const userDownloads = await getUserDownloads(userId);
        setDownloads(userDownloads);
        setGroupedDownloads(groupDownloadsByDate(userDownloads));
      } catch (error) {
        console.error("Error cargando descargas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDownloads();
  }, [userId]);

  const handleDeleteDownload = async (downloadId: string) => {
    try {
      await deleteDownloadRecord(downloadId);
      setDownloads(downloads.filter((d) => d.id !== downloadId));
      setGroupedDownloads(groupDownloadsByDate(downloads.filter((d) => d.id !== downloadId)));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error eliminando descarga:", error);
      alert("Error al eliminar descarga");
    }
  };

  const handleClearHistory = async () => {
    if (!userId) return;

    try {
      await clearDownloadHistory(userId);
      setDownloads([]);
      setGroupedDownloads({});
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Error limpiando historial:", error);
      alert("Error al limpiar historial");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando descargas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-4 pb-10">
      <div className="max-w-4xl mx-auto px-3 md:px-4">
        {/* Botón Regreso */}
        <a
          href="/platform"
          className="text-red-500 hover:text-red-400 transition inline-flex items-center gap-2 mb-6"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </a>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
              Descargas
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              {downloads.length} descarga(s)
            </p>
          </div>

          {downloads.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Limpiar Historial
            </button>
          )}
        </div>

        {/* Modal de confirmación para limpiar */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-sm">
              <h3 className="text-white font-bold text-lg mb-4">
                ¿Limpiar historial de descargas?
              </h3>
              <p className="text-gray-400 mb-6">
                No podrás deshacer esta acción. Se eliminarán todos los registros.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Downloads por fecha */}
        {Object.entries(groupedDownloads).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedDownloads).map(([date, dateDownloads]) => (
              <div key={date}>
                <h2 className="text-xl font-semibold text-white mb-4 sticky top-0 bg-black pt-2">
                  {date}
                </h2>

                <div className="space-y-3">
                  {dateDownloads.map((download) => (
                    <div
                      key={download.id}
                      className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Icono de descarga */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold truncate">
                            {download.track_title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(download.downloaded_at)}
                          </p>
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      {showDeleteConfirm === download.id ? (
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDeleteDownload(download.id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition"
                          >
                            Confirmar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(download.id)}
                          className="text-gray-400 hover:text-red-500 transition ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100"
                          title="Eliminar"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <p className="text-gray-400 font-semibold mb-2">
              No tienes descargas aún
            </p>
            <p className="text-gray-500 text-sm">
              Las descargas aparecerán aquí cuando descargues una canción
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
