-- Crear tabla de descargas
CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL,
  track_title TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_downloaded_at ON downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_downloads_user_date ON downloads(user_id, downloaded_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Crear política para que los usuarios solo vean sus propias descargas
CREATE POLICY "Usuarios pueden ver sus propias descargas" 
  ON downloads 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Crear política para que los usuarios solo inserten sus propias descargas
CREATE POLICY "Usuarios pueden insertar sus propias descargas" 
  ON downloads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Crear política para que los usuarios eliminen solo sus propias descargas
CREATE POLICY "Usuarios pueden eliminar sus propias descargas" 
  ON downloads 
  FOR DELETE 
  USING (auth.uid() = user_id);
