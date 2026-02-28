import { supabase } from "@/lib/supabase/client";

/**
 * Registrar un nuevo usuario
 */
export async function registerUser(
  email: string,
  password: string,
  nombre: string,
  telefono: string
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("No se pudo crear usuario");
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      nombre,
      telefono,
    });

    if (profileError) throw profileError;

    return { success: true, user: data.user };
  } catch (error) {
    console.error("[Auth] Error registrando usuario:", error);
    throw error;
  }
}

/**
 * Login de usuario
 */
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("No se pudo autenticar usuario");
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error("[Auth] Error en login:", error);
    throw error;
  }
}

/**
 * Logout del usuario
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Auth] Error en logout:", error);
    throw error;
  }
}

/**
 * Obtener sesión actual
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return { success: true, session };
  } catch (error) {
    console.error("[Auth] Error obteniendo sesión:", error);
    return { success: false, session: null };
  }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return { success: true, user };
  } catch (error) {
    console.error("[Auth] Error obteniendo usuario:", error);
    return { success: false, user: null };
  }
}

/**
 * Refrescar token
 */
export async function refreshToken() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error) throw error;

    return { success: true, session };
  } catch (error) {
    console.error("[Auth] Error refrescando token:", error);
    // Si el refresh falla, limpiar la sesión
    await supabase.auth.signOut();
    return { success: false, session: null };
  }
}

/**
 * Validar si el token está próximo a expirar (en los próximos 5 minutos)
 */
export function isTokenExpiringSoon(expiresAt?: number): boolean {
  if (!expiresAt) return true;
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  return expiresAt - now < fiveMinutes;
}

/**
 * Cambiar contraseña
 */
export async function changePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error("[Auth] Error cambiando contraseña:", error);
    throw error;
  }
}

/**
 * Solicitar reseteo de contraseña
 */
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("[Auth] Error solicitando reset:", error);
    throw error;
  }
}
