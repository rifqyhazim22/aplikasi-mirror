create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  focus_areas text[] default array[]::text[],
  consent_camera boolean default true,
  consent_data boolean default true,
  mood_baseline text default 'tenang',
  mbti_type text,
  enneagram_type text,
  primary_archetype text,
  zodiac_sign text,
  personality_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mood_entry (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profile(id) on delete cascade,
  mood text not null,
  note text,
  source text,
  created_at timestamptz default now()
);

alter table public.profile enable row level security;
alter table public.mood_entry enable row level security;

create policy if not exists "sandbox profile access" on public.profile
  for all
  using (true)
  with check (true);

create policy if not exists "sandbox mood access" on public.mood_entry
  for all
  using (true)
  with check (true);
