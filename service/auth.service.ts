import { supabase } from "@/lib/supabase/client";

export async function registerUser(
  email: string,
  password: string,
  nombre: string,
  telefono: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;

  if (!data.user) {
    throw new Error("No se pudo crear usuario");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: data.user.id,
      nombre,
      telefono
    });

  if (profileError) throw profileError;

  return data.user;
}
