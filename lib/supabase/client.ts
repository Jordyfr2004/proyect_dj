import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // 🔐 Flujo más seguro
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    // Configuración de reintentos para la API
    global: {
      headers: {
        'X-Client-Info': 'supabase-js',
      }
    }
  }
)

// 🔄 Event listener para cambios en la autenticación
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    // console.log('[Auth Event]', event, session?.user?.email)
    
    // Aquí puedes manejar eventos de autenticación:
    // - 'SIGNED_IN': Usuario inició sesión
    // - 'SIGNED_OUT': Usuario cerró sesión
    // - 'TOKEN_REFRESHED': Token fue refrescado
    // - 'USER_UPDATED': Datos del usuario fueron actualizados
    
    // Puedes usar esto para actualizar el estado global o local
  })
}