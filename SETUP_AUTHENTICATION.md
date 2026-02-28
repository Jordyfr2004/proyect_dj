# 🔐 Mejoras de Autenticación y Middleware

## 📋 Resumen de cambios

Se han mejorado significativamente los sistemas de autenticación, middleware y manejo de refresh tokens para mayor seguridad y experiencia de usuario.

---

## ✨ Cambios Realizados

### 1. **Middleware.ts** - Mejorado
**Ubicación:** `middleware.ts`

#### Nuevas características:
- ✅ Refresh automático de tokens usando cookies seguras
- ✅ Protección CSRF con configuración `sameSite: 'lax'`
- ✅ Manejo robusto de errores
- ✅ Redirección inteligente post-login (guardar URL anterior)
- ✅ Evitar que usuarios autenticados accedan a `/auth/login`
- ✅ Tokens con maxAge de 7 días

```typescript
// Ahora protege automáticamente:
// - /platform/* (requiere autenticación)
// - /auth/* (redirige si ya está autenticado)
```

---

### 2. **Auth Service** - Expandido
**Ubicación:** `service/auth.service.ts`

#### Nuevas funciones:
```typescript
// Login/Logout
loginUser(email, password)
logoutUser()

// Sesión
getCurrentSession()
getCurrentUser()
refreshToken()

// Utilidades
isTokenExpiringSoon(expiresAt)

// Cambios
changePassword(newPassword)
requestPasswordReset(email)
```

**Mejoras:**
- ✅ Mejor manejo de errores con try/catch
- ✅ Retorna objetos estructurados `{ success, data }`
- ✅ Logging detallado
- ✅ Auto-limpieza en caso de fallo

---

### 3. **Client Supabase** - Optimizado
**Ubicación:** `lib/supabase/client.ts`

#### Cambios:
- ✅ Flujo PKCE habilitado (más seguro)
- ✅ localStorage como almacenamiento explícito
- ✅ Event listeners para cambios auth
- ✅ Comentarios para entender eventos

**Eventos escuchados:**
- `SIGNED_IN` - Usuario inició sesión
- `SIGNED_OUT` - Usuario cerró sesión
- `TOKEN_REFRESHED` - Token refrescado
- `USER_UPDATED` - Datos actualizados

---

### 4. **useAuth Hook** - Completamente reescrito
**Ubicación:** `hooks/useAuth.ts`

#### Nuevas características:
- ✅ Refresh automático de tokens (5 min antes de expirar)
- ✅ Estado extendido con `isRefreshing` y `error`
- ✅ Programación inteligente de refresh
- ✅ Limpieza de timeouts
- ✅ Mejor manejo del ciclo de vida

```typescript
// Uso:
const { user, loading, logoutLoading, isRefreshing, error, logout } = useAuth();

// Ahora también retorna:
// - isRefreshing: boolean (indica si está refrescando token)
// - error: string | null (mensaje de error si existe)
```

---

### 5. **Auth Utils** - Nuevo archivo
**Ubicación:** `lib/auth-utils.ts`

#### Proporciona:
```typescript
// Configuración
DEFAULT_AUTH_CONFIG
DEFAULT_AUTH_CONFIG.maxAge // 7 días
DEFAULT_AUTH_CONFIG.refreshThreshold // 5 minutos

// Funciones de utilidad
isTokenExpiring(expiresAt, threshold)
getTimeUntilExpiration(expiresAt)
formatExpirationTime(expiresAt)

// Constantes de rutas
isPublicRoute(pathname)
isProtectedRoute(pathname)
```

---

## 🔄 Flujo de Refresh Token

```
┌─────────────────────────────────────┐
│     Usuario Inicia Sesión           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Token recibido (expires_at = +7d)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  useAuth.scheduleTokenRefresh()     │
│  (Programar refresh 5 min antes)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  setInterval espera 5 minutos       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Llamar refreshToken()              │
│  (Obtener nuevo token)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Nuevo token guardado en cookies    │
│  scheduleTokenRefresh() nuevamente  │
└─────────────────────────────────────┘
```

---

## 🚀 Cómo usar

### Verificar autenticación en componentes:
```typescript
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, loading, error } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No autenticado</div>;

  return <div>¡Hola {user.email}!</div>;
}
```

### Login:
```typescript
import { loginUser } from '@/service/auth.service';

async function handleLogin(email, password) {
  const { success, user, session } = await loginUser(email, password);
  if (success) {
    // Redirigir a /platform (useAuth ya lo maneja)
  }
}
```

### Logout:
```typescript
const { logout } = useAuth();
await logout(); // Redirige a /auth/login
```

### Refrescar manualmente:
```typescript
import { refreshToken } from '@/service/auth.service';

const { success, session } = await refreshToken();
```

---

## 🔒 Características de Seguridad

| Feature | Antes | Después |
|---------|-------|---------|
| Auto-refresh token | ❌ No | ✅ Sí (5 min antes) |
| CSRF Protection | ❌ No | ✅ sameSite: 'lax' |
| Secure cookies | ❌ No | ✅ Sí (en prod) |
| PKCE Flow | ❌ No | ✅ Sí |
| Token expiration check | ❌ No | ✅ Sí |
| Error handling | ⚠️ Básico | ✅ Robusto |
| Request logging | ❌ No | ✅ Sí |

---

## ⚙️ Configuración

Si necesitas modificar tiempos o comportamientos:

```typescript
// lib/auth-utils.ts
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  maxAge: 60 * 60 * 24 * 7, // ← Cambiar duración de sesión
  refreshThreshold: 5 * 60, // ← Cambiar cuándo refrescar (5 min)
  secure: true, // ← Requerir HTTPS
  sameSite: 'lax', // ← Tipo CSRF protection
};
```

```typescript
// middleware.ts
export const config = {
  matcher: ["/platform/:path*", "/auth/:path*"], // ← Rutas protegidas
};
```

---

## 🐛 Debugging

Para activar logs de autenticación, descomenta en `lib/supabase/client.ts`:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Auth Event]', event, session?.user?.email) // ← Descomenta
})
```

---

## 📝 Próximas mejoras sugeridas

- [ ] Implementar rate limiting en login
- [ ] Agregar MFA (autenticación multifactor)
- [ ] Implementar refresh token rotation
- [ ] Agregar auditoría de intentos fallidos
- [ ] Implementar biometría (WebAuthn)
- [ ] Agregar sesiones múltiples

