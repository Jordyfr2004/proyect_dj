/**
 * Utilidades para autenticación y middleware
 * Manejo centralizado de sesiones y refresh tokens
 */

export interface AuthConfig {
  maxAge: number; // Tiempo máximo de vida de la cookie en segundos
  refreshThreshold: number; // Tiempo antes de expiración para refrescar (segundos)
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  maxAge: 60 * 60 * 24 * 1, // 1 día
  refreshThreshold: 5 * 60, // 5 minutos
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

/**
 * Verificar si el token expira pronto (en los próximos N segundos)
 */
export function isTokenExpiring(
  expiresAt: number | undefined,
  threshold: number = DEFAULT_AUTH_CONFIG.refreshThreshold
): boolean {
  if (!expiresAt) return true;

  const now = Math.floor(Date.now() / 1000);
  return expiresAt - now < threshold;
}

/**
 * Calcular tiempo restante hasta expiración (en segundos)
 */
export function getTimeUntilExpiration(expiresAt: number | undefined): number {
  if (!expiresAt) return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiresAt - now);
}

/**
 * Formatear tiempo para logs
 */
export function formatExpirationTime(expiresAt: number | undefined): string {
  const timeLeft = getTimeUntilExpiration(expiresAt);

  if (timeLeft === 0) return 'expirado';
  if (timeLeft < 60) return `${timeLeft}s`;
  if (timeLeft < 3600) return `${Math.floor(timeLeft / 60)}m`;

  return `${Math.floor(timeLeft / 3600)}h`;
}

/**
 * Tipos de cookies de autenticación
 */
export const AUTH_COOKIES = {
  SESSION: 'sb-session',
  REFRESH_TOKEN: 'sb-refresh-token',
  ACCESS_TOKEN: 'sb-access-token',
} as const;

/**
 * Rutas públicas que no requieren autenticación
 */
export const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/confirm',
] as const;

/**
 * Rutas protegidas que requieren autenticación
 */
export const PROTECTED_ROUTES = [
  '/platform',
  '/profile',
  '/settings',
] as const;

/**
 * Verificar si una ruta es pública
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verificar si una ruta es protegida
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}
