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
  updated_at timestamptz default now(),
  conversation_summary text
);

create table if not exists public.mood_entry (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profile(id) on delete cascade,
  mood text not null,
  note text,
  source text,
  created_at timestamptz default now()
);

create table if not exists public.conversation_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profile(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.personality_quiz (
  id uuid primary key default gen_random_uuid(),
  nickname text,
  mbti_result text,
  enneagram_result text,
  focus_note text,
  created_at timestamptz default now()
);

create table if not exists public.camera_emotion_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profile(id) on delete set null,
  emotion text not null,
  confidence numeric default 0,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table if exists public.profile
  add column if not exists conversation_summary text;

alter table if exists public.camera_emotion_log
  add column if not exists profile_id uuid references public.profile(id) on delete set null;
alter table if exists public.camera_emotion_log
  add column if not exists metadata jsonb;

alter table public.profile enable row level security;
alter table public.mood_entry enable row level security;
alter table public.conversation_log enable row level security;
alter table public.personality_quiz enable row level security;
alter table public.camera_emotion_log enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profile'
      and policyname = 'sandbox profile access'
  ) then
    create policy "sandbox profile access" on public.profile
      for all
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'camera_emotion_log'
      and policyname = 'sandbox camera access'
  ) then
    create policy "sandbox camera access" on public.camera_emotion_log
      for all
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'personality_quiz'
      and policyname = 'sandbox quiz access'
  ) then
    create policy "sandbox quiz access" on public.personality_quiz
      for all
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mood_entry'
      and policyname = 'sandbox mood access'
  ) then
    create policy "sandbox mood access" on public.mood_entry
      for all
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'conversation_log'
      and policyname = 'sandbox conversation access'
  ) then
    create policy "sandbox conversation access" on public.conversation_log
      for all
      using (true)
      with check (true);
  end if;
end $$;
