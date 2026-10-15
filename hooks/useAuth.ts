import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { logoutUser } from '@/service/auth.service';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loggingOut = useRef(false);

  useEffect(() => {
    let active = true;
    let revision = 0;
    // Keep this callback synchronous: Supabase already handles token refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      revision++;
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
      if (event === 'SIGNED_OUT' && !loggingOut.current) {
        router.replace('/auth/login');
        router.refresh();
      }
    });
    const initialRevision = revision;
    void supabase.auth.getUser().then(({ data, error: authError }) => {
      if (!active || revision !== initialRevision) return;
      setUser(data.user);
      setLoading(false);
      if (authError && authError.name !== 'AuthSessionMissingError') setError('No se pudo verificar la sesión.');
      if (!data.user) router.replace('/auth/login');
    }).catch(() => {
      if (!active || revision !== initialRevision) return;
      setLoading(false);
      setError('No se pudo verificar la sesión.');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [router]);

  const logout = useCallback(async () => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    setLogoutLoading(true);
    setError(null);
    try {
      await logoutUser();
      // A fresh document discards prefetched authenticated routes and client state.
      window.location.replace('/auth/login');
    } catch {
      loggingOut.current = false;
      setLogoutLoading(false);
      setError('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    }
  }, []);
  return { user, loading, logoutLoading, isRefreshing: false, error, logout };
}
