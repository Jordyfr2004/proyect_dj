import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, email, nombre, telefono } = body;

  if (!userId || !nombre || !telefono) {
    return NextResponse.json({ 
      error: "Datos incompletos" 
    }, { status: 400 });
  }

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

  // Crear perfil en la tabla profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      display_name: nombre.trim()
    });

  if (profileError) {
    return NextResponse.json({ 
      error: profileError.message 
    }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
