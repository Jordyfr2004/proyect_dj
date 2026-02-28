import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];
const MAX_AGE = 60 * 60 * 24 * 1; // 1 día

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              maxAge: MAX_AGE,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          });
        },
      },
    }
  );

  try {
    // 🔄 Intentar obtener usuario y refrescar sesión si es necesario
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // 🏠 Ruta raíz: si hay sesión → ir a /platform, sino → continuar (página de inicio)
    if (pathname === "/") {
      if (user) {
        return NextResponse.redirect(new URL("/platform", request.url));
      }
      return response;
    }

    // Si el usuario está autenticado pero intenta ir a login/register
    if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
      return NextResponse.redirect(new URL("/platform", request.url));
    }

    // 🔒 Si intenta entrar a /platform sin login
    if (!user && pathname.startsWith("/platform")) {
      // Guardar URL anterior para redirigir después de login
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch (error) {
    console.error("[Middleware] Error al procesar autenticación:", error);
    
    // En caso de error, permitir al usuario continuar si tiene sesión
    if (request.nextUrl.pathname.startsWith("/platform")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return response;
  }
}

export const config = {
  matcher: ["/", "/platform/:path*", "/auth/:path*"],
};

