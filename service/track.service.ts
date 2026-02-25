import { supabase } from "@/lib/supabase/client";

const AUDIO_BUCKET = "audio";
const COVERS_BUCKET = "covers";
const AUDIO_LIMIT = 50 * 1024 * 1024; // 50MB

interface TrackData {
  title: string;
  content_type: string;
  genre?: string;
  is_downloadable?: boolean;
}

/**
 * Sube un archivo de audio a Supabase Storage
 */
export async function uploadAudio(
  userId: string,
  trackId: string,
  file: File
): Promise<string> {
  try {
    // Validar tamaño
    if (file.size > AUDIO_LIMIT) {
      throw new Error("El archivo no debe superar 50MB");
    }

    // Validar tipo
    if (!file.type.startsWith("audio/")) {
      throw new Error("El archivo debe ser de audio");
    }

    const filePath = `${userId}/${trackId}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error al subir audio:", error);
    throw error;
  }
}

/**
 * Subir portada de track o playlist
 */
export async function uploadCover(
  type: "tracks" | "playlists",
  itemId: string,
  file: File
): Promise<string> {
  try {
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen");
    }

    // Validar tamaño (máx 5MB para imágenes)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("La imagen no debe superar 5MB");
    }

    const ext = file.name.split(".").pop();
    const filePath = `${type}/${itemId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(COVERS_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(COVERS_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error al subir portada:", error);
    throw error;
  }
}

/**
 * Crear un track en la BD
 */
export async function createTrack(
  userId: string,
  trackData: TrackData,
  audioUrl: string,
  coverUrl?: string,
  duration?: number
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .insert({
        user_id: userId,
        title: trackData.title.trim(),
        content_type: trackData.content_type,
        genre: trackData.genre?.trim() || null,
        audio_url: audioUrl,
        cover_url: coverUrl || null,
        duration: duration ? Math.floor(duration) : null,
        is_downloadable: trackData.is_downloadable !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al crear track:", error);
    throw error;
  }
}

/**
 * Obtener tracks del usuario
 */
export async function getUserTracks(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener tracks:", error);
    return [];
  }
}

/**
 * Obtener todos los tracks (para la sección Samplers)
 */
export async function getAllTracks(limit: number = 100): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select("*, profiles:user_id(display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener todos los tracks:", error);
    return [];
  }
}

/**
 * Obtener un track específico
 */
export async function getTrack(trackId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", trackId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al obtener track:", error);
    return null;
  }
}

/**
 * Eliminar un track y sus archivos
 */
export async function deleteTrack(userId: string, trackId: string): Promise<void> {
  try {
    // Eliminar archivo de audio
    await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([`${userId}/${trackId}.mp3`]);

    // Eliminar record de la BD (las portadas se eliminan en cascade si es necesario)
    const { error } = await supabase
      .from("tracks")
      .delete()
      .eq("id", trackId)
      .eq("user_id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error al eliminar track:", error);
    throw error;
  }
}

/**
 * Actualizar información del track
 */
export async function updateTrack(
  trackId: string,
  userId: string,
  updates: Partial<TrackData>
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .update({
        ...(updates.title && { title: updates.title.trim() }),
        ...(updates.content_type && { content_type: updates.content_type }),
        ...(updates.genre !== undefined && { genre: updates.genre?.trim() || null }),
        ...(updates.is_downloadable !== undefined && { is_downloadable: updates.is_downloadable }),
      })
      .eq("id", trackId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al actualizar track:", error);
    throw error;
  }
}

/**
 * Agregar/Quitar like a un track
 */
export async function toggleTrackLike(userId: string, trackId: string): Promise<boolean> {
  try {
    // Verificar si ya existe like
    const { data: existingLike } = await supabase
      .from("track_likes")
      .select("*")
      .eq("user_id", userId)
      .eq("track_id", trackId)
      .single();

    if (existingLike) {
      // Eliminar like
      await supabase
        .from("track_likes")
        .delete()
        .eq("user_id", userId)
        .eq("track_id", trackId);
      return false;
    } else {
      // Agregar like
      await supabase
        .from("track_likes")
        .insert({
          user_id: userId,
          track_id: trackId,
        });
      return true;
    }
  } catch (error) {
    console.error("Error al hacer like:", error);
    throw error;
  }
}

/**
 * Contar likes de un track
 */
export async function getTrackLikeCount(trackId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from("track_likes")
      .select("*", { count: "exact", head: true })
      .eq("track_id", trackId);

    return count || 0;
  } catch (error) {
    console.error("Error al contar likes:", error);
    return 0;
  }
}
