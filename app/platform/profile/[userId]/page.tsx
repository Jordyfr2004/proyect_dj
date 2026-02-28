'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import EditProfileModal from '@/components/layout/EditProfileModal';
import EditProfileDetailsModal from '@/components/layout/EditProfileDetailsModal';
import TrackCard from '@/components/layout/TrackCard';
import { getUserTracks } from '@/service/track.service';
import Image from 'next/image';

interface UserProfile {
  id: string;
  display_name: string;
  nombre: string;
  telefono: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: authUser, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
  const [userTracks, setUserTracks] = useState<any[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    if (profile) {
      setProfile({
        ...profile,
        avatar_url: newAvatarUrl,
      });
    }
    setIsEditModalOpen(false);
  };

  const handleDetailsUpdated = (newData: any) => {
    if (profile) {
      setProfile({
        ...profile,
        ...newData,
      });
    }
    setIsEditDetailsModalOpen(false);
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setError('ID de usuario no válido');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError) {
          throw new Error('No se encontró el perfil');
        }

        setProfile(data);
        
        // Verificar si es el perfil del usuario autenticado
        if (authUser && authUser.id === userId) {
          setIsOwnProfile(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [userId, authUser, authLoading]);

  // Cargar canciones del usuario
  useEffect(() => {
    const loadUserTracks = async () => {
      if (!userId) return;
      
      setTracksLoading(true);
      try {
        const tracks = await getUserTracks(userId);
        setUserTracks(tracks || []);
      } catch (err) {
        console.error('Error al cargar canciones:', err);
        setUserTracks([]);
      } finally {
        setTracksLoading(false);
      }
    };

    loadUserTracks();
  }, [userId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-900 rounded-full animate-spin mb-4" />
          <p className="text-zinc-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-zinc-200 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-zinc-400 mb-8">{error || 'Perfil no encontrado'}</p>
          <a 
            href="/platform" 
            className="text-red-500 hover:text-red-400 underline"
          >
            Volver a Populares
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <a 
            href="/platform" 
            className="text-red-500 hover:text-red-400 transition inline-flex items-center gap-2 mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </a>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-24 h-24 text-zinc-300 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 bg-red-900 hover:bg-red-800 rounded-full p-2 shadow-lg transition"
                  title="Cambiar foto de perfil"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-2">
                {profile.display_name}
              </h1>
              <p className="text-xl text-zinc-400 mb-6">{profile.nombre}</p>
              
              {isOwnProfile && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditDetailsModalOpen(true)}
                    className="px-6 py-2 bg-red-900 hover:bg-red-800 rounded-full font-semibold transition"
                  >
                    Editar Perfil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userId={userId}
          currentAvatar={profile.avatar_url}
          onAvatarUpdated={handleAvatarUpdated}
        />

        {/* Edit Profile Details Modal */}
        <EditProfileDetailsModal
          isOpen={isEditDetailsModalOpen}
          onClose={() => setIsEditDetailsModalOpen(false)}
          userId={userId}
          currentData={{
            display_name: profile?.display_name || '',
            nombre: profile?.nombre || '',
            telefono: profile?.telefono || '',
          }}
          onProfileUpdated={handleDetailsUpdated}
        />

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2">
            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Información</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Apodo</p>
                  <p className="text-lg text-zinc-100">{profile.display_name}</p>
                </div>

                <div>
                  <p className="text-zinc-500 text-sm mb-1">Nombre Completo</p>
                  <p className="text-lg text-zinc-100">{profile.nombre}</p>
                </div>

                <div>
                  <p className="text-zinc-500 text-sm mb-1">Teléfono</p>
                  <p className="text-lg text-zinc-100">{profile.telefono || 'No especificado'}</p>
                </div>

                {profile.bio && (
                  <div>
                    <p className="text-zinc-500 text-sm mb-1">Bio</p>
                    <p className="text-lg text-zinc-100">{profile.bio}</p>
                  </div>
                )}

                {profile.created_at && (
                  <div>
                    <p className="text-zinc-500 text-sm mb-1">Miembro desde</p>
                    <p className="text-lg text-zinc-100">
                      {new Date(profile.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-zinc-900 rounded-lg p-6 sticky top-20">
              <h3 className="text-xl font-bold mb-4">Estadísticas</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Sets</span>
                  <span className="text-red-500 font-semibold">{userTracks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Seguidores</span>
                  <span className="text-red-500 font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Siguiendo</span>
                  <span className="text-red-500 font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canciones Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Canciones</h2>
          
          {tracksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-red-900/30 border-t-red-900 rounded-full animate-spin mb-2" />
                <p className="text-zinc-400">Cargando canciones...</p>
              </div>
            </div>
          ) : userTracks.length === 0 ? (
            <div className="bg-zinc-900 rounded-lg p-12 text-center">
              <p className="text-zinc-400 text-lg">Sin contenido</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  id={track.id}
                  title={track.title}
                  artist={profile?.display_name || 'Artista desconocido'}
                  audio_url={track.audio_url}
                  cover_url={track.cover_url}
                  avatar_url={profile?.avatar_url}
                  duration={track.duration}
                  content_type={track.content_type}
                  is_downloadable={track.is_downloadable}
                  userId={authUser?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
