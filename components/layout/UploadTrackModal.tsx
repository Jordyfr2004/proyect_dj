"use client";

import { useState, useRef } from "react";
import { createTrack, uploadAudio, uploadCover } from "@/service/track.service";

interface UploadTrackModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onTrackUploaded?: (track: any) => void;
}

type ContentType = string;

export default function UploadTrackModal({
  userId,
  isOpen,
  onClose,
  onTrackUploaded,
}: UploadTrackModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    content_type: "" as ContentType,
    genre: "",
    audio_file: null as File | null,
    cover_file: null as File | null,
    is_downloadable: true,
  });

  const [audioPreview, setAudioPreview] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Extraer duración del audio
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
          resolve(audio.duration);
        };
        audio.onerror = () => reject(new Error("Error al leer audio"));
        audio.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Error al leer archivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleAudioSelect = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      setError("El archivo debe ser de audio");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("El archivo no debe superar 50MB");
      return;
    }

    setFormData({ ...formData, audio_file: file });
    setAudioPreview({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    });
    setError(null);
  };

  const handleCoverSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB");
      return;
    }

    setFormData({ ...formData, cover_file: file });

    // Preview de la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error("El título es requerido");
      }

      if (!formData.content_type.trim()) {
        throw new Error("El tipo de contenido es requerido");
      }

      if (!formData.audio_file) {
        throw new Error("Debes seleccionar un archivo de audio");
      }

      // Generar IDs
      const trackId = crypto.randomUUID();

      // Subir audio
      console.log("Subiendo audio...");
      const audioUrl = await uploadAudio(userId, trackId, formData.audio_file);

      // Obtener duración
      let duration = 0;
      try {
        duration = await getAudioDuration(formData.audio_file);
      } catch (err) {
        console.warn("No se pudo extraer la duración:", err);
      }

      // Subir portada si existe
      let coverUrl = undefined;
      if (formData.cover_file) {
        console.log("Subiendo portada...");
        coverUrl = await uploadCover("tracks", trackId, formData.cover_file);
      }

      // Crear registro en BD
      console.log("Creando registro en BD...");
      const track = await createTrack(
        userId,
        {
          title: formData.title.trim(),
          content_type: formData.content_type,
          genre: formData.genre || undefined,
          is_downloadable: formData.is_downloadable,
        },
        audioUrl,
        coverUrl,
        duration
      );

      setSuccess(true);
      setFormData({
        title: "",
        content_type: "" as ContentType,
        genre: "",
        audio_file: null,
        cover_file: null,
        is_downloadable: true,
      });
      setAudioPreview(null);
      setCoverPreview(null);

      if (audioRef.current) audioRef.current.value = "";
      if (coverRef.current) coverRef.current.value = "";

      // Llamar callback
      if (onTrackUploaded) {
        onTrackUploaded(track);
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Error al subir track:", err);
      setError(err.message || "Error al subir la canción");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Subir Canción</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded mb-4">
            ¡Canción subida exitosamente!
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ej: Mi Remix 2024"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              disabled={isLoading}
            />
          </div>

          {/* Tipo de contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Contenido (ej: Set, Remix, Edit, Mashup)
            </label>
            <input
              type="text"
              value={formData.content_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content_type: e.target.value as ContentType,
                })
              }
              placeholder="Ej: Set, Remix, Edit, Mashup"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              disabled={isLoading}
            />
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Género
            </label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
              placeholder="Ej: Techno, House, Deep House"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              disabled={isLoading}
            />
          </div>

          {/* Audio File */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Archivo de Audio * (Max 50MB)
            </label>
            <input
              ref={audioRef}
              type="file"
              accept="audio/*"
              onChange={(e) =>
                e.target.files && handleAudioSelect(e.target.files[0])
              }
              className="w-full px-3 py-2 bg-slate-900 border border-gray-600 rounded text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 cursor-pointer file:cursor-pointer file:bg-red-600 file:border-0 file:text-white file:px-3 file:py-1 file:rounded file:mr-3"
              disabled={isLoading}
            />
            {audioPreview && (
              <p className="text-xs text-gray-400 mt-2">
                ✓ {audioPreview.name} ({audioPreview.size})
              </p>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Portada (Opcional)
            </label>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleCoverSelect(e.target.files[0])
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 cursor-pointer file:cursor-pointer file:bg-red-600 file:border-0 file:text-white file:px-3 file:py-1 file:rounded file:mr-3"
              disabled={isLoading}
            />
            {coverPreview && (
              <div className="mt-2">
                <img
                  src={coverPreview}
                  alt="Preview"
                  className="w-20 h-20 rounded object-cover"
                />
              </div>
            )}
          </div>

          {/* Descargable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_downloadable"
              checked={formData.is_downloadable}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_downloadable: e.target.checked,
                })
              }
              className="w-4 h-4 accent-red-600"
              disabled={isLoading}
            />
            <label
              htmlFor="is_downloadable"
              className="ml-2 text-sm text-gray-300"
            >
              Permitir descargas
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Subir Canción"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
