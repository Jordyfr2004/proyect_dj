--tabla profile

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text
);


--Activar seguridad
alter table profiles enable row level security;


Crear políticas
Permitir que el usuario inserte su propio perfil

create policy "Users can insert their own profile"
on profiles
for insert
with check (auth.uid() = id);



Permitir que vea su propio perfil
create policy "Users can view their own profile"
on profiles
for select
using (auth.uid() = id);




Permitir que actualice su propio perfil
create policy "Users can update their own profile"
on profiles
for update
using (auth.uid() = id);




select relrowsecurity
from pg_class
where relname = 'profiles';



# nuevas tablas

tabla tracks


create table tracks (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  title text not null,

  content_type text not null, 
  -- 'remix' | 'edit' | 'mashup' | 'set'

  genre text,

  audio_url text not null,
  cover_url text,

  duration integer,
  is_downloadable boolean default true,

  created_at timestamptz default now(),

  original_artist text
);


tabla playlist

create table playlists (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  name text not null,
  description text,
  cover_url text,
  is_public boolean default false,

  created_at timestamptz default now()
);


Relación playlist ↔ tracks

create table playlist_tracks (
  playlist_id uuid references playlists(id) on delete cascade,
  track_id uuid references tracks(id) on delete cascade,

  position integer,
  added_at timestamptz default now(),

  primary key (playlist_id, track_id)
);

likes

create table track_likes (
  user_id uuid references profiles(id) on delete cascade,
  track_id uuid references tracks(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, track_id)
);


# nuevo buckents
Supabase Storage
│
├── audio
│     └── user_id/
│             track_id.mp3
│
└── covers
      ├── tracks/
      └── playlists/


elbucket es de 50 mb (validar en el frontend)








