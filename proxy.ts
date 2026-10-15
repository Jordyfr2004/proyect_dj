import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          // Forward refreshed cookies both to server components and the browser.
          const previousCookies = response.cookies.getAll();
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          previousCookies.forEach(cookie => response.cookies.set(cookie));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  function finish(destination?: URL) {
    const result = destination ? NextResponse.redirect(destination) : response;
    if (destination) response.cookies.getAll().forEach(cookie => result.cookies.set(cookie));
    // Auth decisions and refreshed cookies must never be reused across sessions.
    result.headers.set('Cache-Control', 'private, no-store');
    return result;
  }
  const pathname = request.nextUrl.pathname;
  const protectedPath = pathname === '/platform' || pathname.startsWith('/platform/');
  function loginRedirect() {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirectTo', pathname + request.nextUrl.search);
    return finish(url);
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && ['/', '/auth/login', '/auth/register'].includes(pathname)) {
      return finish(new URL('/platform', request.url));
    }
    if (!user && protectedPath) return loginRedirect();
    return finish();
  } catch {
    return protectedPath ? loginRedirect() : finish();
  }
}
export const config = { matcher: ['/', '/platform/:path*', '/auth/:path*'] };
