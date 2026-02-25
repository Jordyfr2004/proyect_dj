import { supabase } from "@/lib/supabase/client";

export async function getPopularUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .limit(5);

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  return data || [];
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .order("display_name", { ascending: true });

  if (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }

  return data || [];
}
