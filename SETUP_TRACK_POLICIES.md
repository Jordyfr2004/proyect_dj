# Políticas RLS para Tracks

**Nota**: Las tablas (tracks, track_likes, playlists, playlist_tracks) aún no tienen políticas RLS habilitadas. Solo se configuran las políticas de Storage.

## Bucket Policies: audio

### 1. SELECT (Public Read)
```sql
CREATE POLICY "Public read access for audio"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio');
```

---

### 2. INSERT (Authenticated Users)
```sql
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'audio' 
  AND auth.role() = 'authenticated'
);
```

---

### 3. UPDATE/DELETE (Own Files Only)
```sql
CREATE POLICY "Users can only update/delete their own audio"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'audio' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'audio' AND auth.uid() = owner);

CREATE POLICY "Users can only delete their own audio"
ON storage.objects
FOR DELETE
USING (bucket_id = 'audio' AND auth.uid() = owner);
```

---

## Bucket Policies: covers

### 1. SELECT (Public Read)
```sql
CREATE POLICY "Public read access for covers"
ON storage.objects
FOR SELECT
USING (bucket_id = 'covers');
```

---

### 2. INSERT (Authenticated Users)
```sql
CREATE POLICY "Authenticated users can upload covers"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.role() = 'authenticated'
);
```

---

### 3. UPDATE/DELETE (Own Files Only)
```sql
CREATE POLICY "Users can only update/delete their own covers"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'covers' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'covers' AND auth.uid() = owner);

CREATE POLICY "Users can only delete their own covers"
ON storage.objects
FOR DELETE
USING (bucket_id = 'covers' AND auth.uid() = owner);
```

---

## Instalación

Las políticas de las tablas se agregarán posteriormente. Por ahora solo configura los buckets de Storage.
