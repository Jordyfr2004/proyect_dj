# Configuración de Políticas de Seguridad para Bucket de Avatares

## Políticas Requeridas

### Política 1: SELECT
**Rol:** `public`
```sql
bucket_id = 'avatars'
```

---

### Política 2: INSERT
**Rol:** `authenticated`
```sql
bucket_id = 'avatars' AND auth.uid() IS NOT NULL
```

---

### Política 3: UPDATE
**Rol:** `authenticated`
```sql
bucket_id = 'avatars' AND auth.uid() IS NOT NULL
```

---

### Política 4: DELETE
**Rol:** `authenticated`
```sql
bucket_id = 'avatars' AND auth.uid() IS NOT NULL
```

---

## Bucket Policies: audio

### Política 1: Public read access for audio
**Rol:** `public`
```sql
bucket_id = 'audio'
```

---

### Política 2: Authenticated users can upload audio
**Rol:** `authenticated`
```sql
bucket_id = 'audio' AND auth.role() = 'authenticated'
```

---

### Política 3: Users can modify their own audio
**Rol:** `authenticated`
```sql
bucket_id = 'audio' AND auth.uid() = owner
```

---

## Bucket Policies: covers

### Política 1: Public read access for covers
**Rol:** `public`
```sql
bucket_id = 'covers'
```

---

### Política 2: Authenticated users can upload covers
**Rol:** `authenticated`
```sql
bucket_id = 'covers' AND auth.role() = 'authenticated'
```

---

### Política 3: Users can modify their own covers
**Rol:** `authenticated`
```sql
bucket_id = 'covers' AND auth.uid() = owner
```

