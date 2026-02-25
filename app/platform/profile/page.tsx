'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirigir al perfil del usuario autenticado
      router.push(`/platform/profile/${user.id}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-900 rounded-full animate-spin mb-4" />
          <p className="text-zinc-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return null;
}
