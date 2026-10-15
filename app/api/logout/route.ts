import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        }
      }
    }
  );

  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json(
      { error: "No se pudo cerrar la sesión" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
