'use client';

import { useState, useRef } from 'react';
import { uploadAvatar, updateProfileAvatar, deleteAvatar, deleteOldAvatar } from '@/service/avatar.service';
import Image from 'next/image';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentAvatar?: string;
  onAvatarUpdated?: (newAvatarUrl: string) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  userId,
  currentAvatar,
  onAvatarUpdated,
}: EditProfileModalProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentAvatar || null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Eliminar avatar anterior si existe
      if (currentAvatar) {
        await deleteOldAvatar(currentAvatar);
      }

      // Subir archivo nuevo
      const avatarUrl = await uploadAvatar(userId, file);
      
      // Actualizar perfil
      await updateProfileAvatar(userId, avatarUrl);

      // Notificar cambio
      if (onAvatarUpdated) {
        onAvatarUpdated(avatarUrl);
      }

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al subir la imagen'
      );
      setAvatarPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?')) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await deleteAvatar(userId);
      setAvatarPreview(null);

      if (onAvatarUpdated) {
        onAvatarUpdated('');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al eliminar la imagen'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-zinc-100 mb-6">
          Cambiar foto de perfil
        </h2>

        {/* Avatar Preview */}
        <div className="mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-900 mx-auto flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Preview"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-24 h-24 text-zinc-300 opacity-50"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-2 bg-red-900 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed rounded-lg font-semibold transition text-zinc-100"
          >
            {uploading ? 'Subiendo...' : avatarPreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
          </button>

          {avatarPreview && (
            <button
              onClick={handleDeleteAvatar}
              disabled={uploading}
              className="w-full px-4 py-2 bg-red-950 hover:bg-red-900/80 disabled:bg-red-950/50 disabled:cursor-not-allowed rounded-lg font-semibold transition text-red-300"
            >
              {uploading ? 'Eliminando...' : 'Eliminar foto'}
            </button>
          )}

          <button
            onClick={onClose}
            disabled={uploading}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:cursor-not-allowed rounded-lg font-semibold transition text-zinc-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
