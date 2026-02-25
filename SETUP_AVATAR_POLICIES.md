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

