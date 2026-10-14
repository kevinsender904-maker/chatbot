-- Supabase Schema for Healthcare AI Assistant
-- Tables: profiles, chat_sessions, chat_messages, health_tips_history, anonymous_logs

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE
-- Fields: id, name, age_range, language, role default 'user'
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age_range text not null,
  language text not null default 'english',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile or admins view all"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile or admins update any"
  on public.profiles for update
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Automatically create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, age_range, language, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'age_range', '25-34'),
    coalesce(new.raw_user_meta_data->>'language', 'english'),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do update set
    name = excluded.name,
    age_range = excluded.age_range,
    language = excluded.language;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 2. CHAT_SESSIONS TABLE
-- User-owned chat sessions
-- ==============================================================================
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Health Inquiry',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;

create policy "Users can view their own chat sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own chat sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chat sessions"
  on public.chat_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chat sessions"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- 3. CHAT_MESSAGES TABLE
-- User-owned chat messages (sensitive medical data restricted to user's ownership)
-- ==============================================================================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'model', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can view messages from their own sessions"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert messages into their own sessions"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete messages from their own sessions"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- 4. HEALTH_TIPS_HISTORY TABLE
-- Track user's viewed and bookmarked health tips
-- ==============================================================================
create table if not exists public.health_tips_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tip_id text not null,
  tip_title text not null,
  category text,
  bookmarked boolean not null default false,
  viewed_at timestamptz not null default now()
);

alter table public.health_tips_history enable row level security;

create policy "Users can manage their health tips history"
  on public.health_tips_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- 5. ANONYMOUS_LOGS TABLE
-- STRICT PRIVACY: NO PII, NO message text, NO user ID, NO symptoms
-- Fields: event, severity, latency_ms, created_at
-- ==============================================================================
create table if not exists public.anonymous_logs (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  severity text not null check (severity in ('info', 'warn', 'error', 'critical')),
  latency_ms integer,
  created_at timestamptz not null default now()
);

alter table public.anonymous_logs enable row level security;

-- Anyone/Worker can insert anonymous operational metrics
create policy "Allow inserts to anonymous logs"
  on public.anonymous_logs for insert
  with check (true);

-- Only Admins (role = 'admin') or Service Role can read anonymous logs
create policy "Admins can view anonymous logs"
  on public.anonymous_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
