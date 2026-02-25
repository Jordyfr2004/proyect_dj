import { supabase } from "@/lib/supabase/client";

const BUCKET_NAME = "avatars";
const BUCKET_PATH = "public"; // Carpeta dentro del bucket

/**
 * Sube una imagen de perfil
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const fileName = `${userId}-${timestamp}.${ext}`;
    const filePath = `${BUCKET_PATH}/${fileName}`;

    // Subir archivo
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error al subir avatar:", error);
    throw error;
  }
}

/**
 * Actualiza el campo avatar_url en el perfil del usuario
 */
export async function updateProfileAvatar(
  userId: string,
  avatarUrl: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error al actualizar avatar en perfil:", error);
    throw error;
  }
}

/**
 * Elimina un avatar anterior basado en la URL
 */
export async function deleteOldAvatar(avatarUrl: string): Promise<void> {
  try {
    if (!avatarUrl) return;

    // Extraer el path del archivo de la URL
    // URL formato: https://tu-proyecto.supabase.co/storage/v1/object/public/avatars/public/file.jpg
    const pathParts = avatarUrl.split("/avatars/");
    if (pathParts.length < 2) return;

    const filePath = pathParts[1]; // public/file.jpg

    // Eliminar archivo del storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.warn("Advertencia al eliminar avatar anterior:", error);
      // No lanzar error, continuar con el upload
    }
  } catch (error) {
    console.warn("Error al eliminar avatar anterior:", error);
    // No lanzar error, continuar con el upload
  }
}

/**
 * Elimina un avatar del storage
 */
export async function deleteAvatar(userId: string): Promise<void> {
  try {
    // Obtener todos los archivos del usuario en el bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(BUCKET_PATH, {
        limit: 100,
        offset: 0,
      });

    if (listError) throw listError;

    // Filtrar archivos del usuario actual
    const userFiles = files
      ?.filter((file) => file.name.startsWith(userId))
      .map((file) => `${BUCKET_PATH}/${file.name}`) || [];

    if (userFiles.length > 0) {
      // Eliminar todos los avatares del usuario
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(userFiles);

      if (deleteError) throw deleteError;
    }

    // Actualizar perfil para eliminar referencia
    await updateProfileAvatar(userId, "");
  } catch (error) {
    console.error("Error al eliminar avatar:", error);
    throw error;
  }
}

/**
 * Obtiene la URL del avatar de un usuario
 */
export async function getAvatarUrl(userId: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    return data?.avatar_url || null;
  } catch (error) {
    console.error("Error al obtener URL del avatar:", error);
    return null;
  }
}
