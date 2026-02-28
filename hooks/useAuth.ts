import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { refreshToken, isTokenExpiringSoon } from '@/service/auth.service';

interface AuthState {
  user: any;
  loading: boolean;
  logoutLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    logoutLoading: false,
    isRefreshing: false,
    error: null,
  });

  const initRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // 🔄 Refrescar token antes de que expire
  const scheduleTokenRefresh = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.expires_at) return;

      // Calcular tiempo hasta que expire el token (en ms)
      const expiresIn = session.expires_at * 1000 - Date.now();
      
      // Refrescar cuando falten 5 minutos
      const refreshIn = Math.max(0, expiresIn - 5 * 60 * 1000);

      // Limpiar timeout anterior
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      if (refreshIn > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          console.log('[Auth] Refrescando token...');
          const result = await refreshToken();
          if (result.success) {
            console.log('[Auth] Token refrescado exitosamente');
            scheduleTokenRefresh(); // Programar siguiente refresh
          }
        }, refreshIn);
      }
    } catch (error) {
      console.error('[Auth] Error programando refresh:', error);
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Verificar sesión actual
    const checkSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        setState((prev) => ({
          ...prev,
          user,
          loading: false,
          error: null,
        }));

        if (user) {
          scheduleTokenRefresh();
        }
      } catch (error) {
        console.error('[Auth] Error verificando sesión:', error);
        setState((prev) => ({
          ...prev,
          user: null,
          loading: false,
          error: 'Error al verificar sesión',
        }));
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      
      setState((prev) => ({
        ...prev,
        user,
        error: null,
      }));

      if (event === 'SIGNED_IN') {
        console.log('[Auth] Usuario inició sesión');
        scheduleTokenRefresh();
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] Usuario cerró sesión');
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        router.push('/auth/login');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[Auth] Token refrescado automáticamente');
        scheduleTokenRefresh();
      } else if (event === 'USER_UPDATED') {
        console.log('[Auth] Datos del usuario actualizados');
      }
    });

    return () => {
      subscription?.unsubscribe();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [router, scheduleTokenRefresh]);

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, logoutLoading: true }));
      await supabase.auth.signOut();
      setState((prev) => ({
        ...prev,
        user: null,
        logoutLoading: false,
        error: null,
      }));
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      router.push('/auth/login');
    } catch (error) {
      console.error('[Auth] Error haciendo logout:', error);
      setState((prev) => ({
        ...prev,
        logoutLoading: false,
        error: 'Error al cerrar sesión',
      }));
    }
  }, [router]);

  return {
    user: state.user,
    loading: state.loading,
    logoutLoading: state.logoutLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    logout,
  };
}
