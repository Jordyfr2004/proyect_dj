import { supabase } from "@/lib/supabase/client";

interface DownloadRecord {
  id: string;
  user_id: string;
  track_id: string;
  track_title: string;
  downloaded_at: string;
  created_at?: string;
}

/**
 * Guardar un registro de descarga en la BD
 */
export async function saveDownloadRecord(
  userId: string | null,
  trackId: string,
  trackTitle: string
): Promise<void> {
  try {
    // Si no hay usuario, no guardar (evitar error)
    if (!userId) {
      console.warn("No user ID provided for download record");
      return;
    }

    const { error } = await supabase
      .from("downloads")
      .insert({
        user_id: userId,
        track_id: trackId,
        track_title: trackTitle,
        downloaded_at: new Date().toISOString(),
      });

    if (error) {
      // Si la tabla no existe, solo log (no romper el flujo de descarga)
      if (error.code === "PGRST116" || error.message.includes("doesn't exist")) {
        console.warn("Downloads table not yet created in Supabase. Please run SETUP_DOWNLOADS.md SQL.");
        return;
      }
      console.error("Error guardando descarga:", error);
    }
  } catch (error) {
    console.error("Error en saveDownloadRecord:", error);
    // No lanzar error para no romper el flujo de descarga
  }
}

/**
 * Obtener historial de descargas del usuario
 */
export async function getUserDownloads(userId: string): Promise<DownloadRecord[]> {
  try {
    const { data, error } = await supabase
      .from("downloads")
      .select("*")
      .eq("user_id", userId)
      .order("downloaded_at", { ascending: false });

    if (error) {
      // Si la tabla no existe, retornar array vacío
      if (error.code === "PGRST116" || error.message.includes("doesn't exist")) {
        console.warn("Downloads table not yet created in Supabase. Please run SETUP_DOWNLOADS.md SQL.");
        return [];
      }
      console.error("Error obteniendo descargas:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error en getUserDownloads:", error);
    return [];
  }
}

/**
 * Agrupar descargas por día
 */
export function groupDownloadsByDate(downloads: DownloadRecord[]): Record<string, DownloadRecord[]> {
  const grouped: Record<string, DownloadRecord[]> = {};

  downloads.forEach((download) => {
    const date = new Date(download.downloaded_at);
    const dateKey = date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(download);
  });

  return grouped;
}

/**
 * Eliminar un registro de descarga
 */
export async function deleteDownloadRecord(downloadId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("downloads")
      .delete()
      .eq("id", downloadId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error eliminando descarga:", error);
    throw error;
  }
}

/**
 * Limpiar todo el historial de descargas
 */
export async function clearDownloadHistory(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("downloads")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error limpiando historial:", error);
    throw error;
  }
}
