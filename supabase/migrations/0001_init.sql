-- Cheetahs House — esquema inicial.
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run.
-- RLS activado sin políticas: solo el servidor (service role) puede leer/escribir.

-- Invitados: solo nombre, opcional.
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now()
);

-- Canciones agregadas por invitados a la playlist.
create table if not exists public.songs (
  id bigint generated always as identity primary key,
  track_uri text not null,
  track_name text not null,
  artists text not null,
  image text,
  guest_id uuid references public.guests (id) on delete set null,
  added_by text,
  created_at timestamptz not null default now()
);
create index if not exists songs_created_at_idx on public.songs (created_at desc);

-- Ajustes privados del servidor (ej. el token de Spotify del anfitrión).
create table if not exists public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.guests enable row level security;
alter table public.songs enable row level security;
alter table public.settings enable row level security;
