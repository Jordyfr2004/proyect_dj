import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const audioUrl = searchParams.get('url');
    const fileName = searchParams.get('name') || 'cancion.mp3';

    if (!audioUrl) {
      return new Response('URL de audio faltante', { status: 400 });
    }

    // Descargar el archivo desde la URL
    const response = await fetch(audioUrl);
    
    if (!response.ok) {
      return new Response('Error al descargar el archivo', { status: 500 });
    }

    const buffer = await response.arrayBuffer();

    // Retornar con headers para descargar como archivo
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}.mp3"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error en descarga:', error);
    return new Response('Error al procesar la descarga', { status: 500 });
  }
}
