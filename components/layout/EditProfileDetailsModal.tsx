'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface EditProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentData?: {
    display_name: string;
    nombre: string;
    telefono: string;
  };
  onProfileUpdated?: (newData: any) => void;
}

export default function EditProfileDetailsModal({
  isOpen,
  onClose,
  userId,
  currentData,
  onProfileUpdated,
}: EditProfileDetailsModalProps) {
  const [formData, setFormData] = useState({
    display_name: currentData?.display_name || '',
    nombre: currentData?.nombre || '',
    telefono: currentData?.telefono || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validar campos
    if (!formData.display_name.trim()) {
      setError('El apodo no puede estar vacío');
      return;
    }
    if (!formData.nombre.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }
    if (!formData.telefono.trim()) {
      setError('El teléfono no puede estar vacío');
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name.trim(),
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(formData);
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar los cambios'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-zinc-100 mb-6">
          Editar Perfil
        </h2>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4">
            ¡Perfil actualizado exitosamente!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name (Apodo) */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Apodo
            </label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              placeholder="Tu apodo"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/30 transition"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Este es tu nombre de usuario visible
            </p>
          </div>

          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/30 transition"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Tu teléfono"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900/30 transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-red-900 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed rounded-lg font-semibold transition text-zinc-100"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:cursor-not-allowed rounded-lg font-semibold transition text-zinc-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
