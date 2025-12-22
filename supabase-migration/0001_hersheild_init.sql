-- Hersheild → Supabase migration
-- Run this once in your Supabase project's SQL editor.

-- Extensions ------------------------------------------------------------------

-- UUID generation (for default ids if needed)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- USERS -----------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_number text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_phone_number
  on public.users (phone_number);

create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_timestamp on public.users;
create trigger set_users_timestamp
before update on public.users
for each row
execute procedure public.set_timestamp();

-- CONTACTS --------------------------------------------------------------------

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone_number text not null,
  relationship text,
  is_emergency boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contacts_user_id
  on public.contacts (user_id);

create unique index if not exists uq_contacts_user_phone
  on public.contacts (user_id, phone_number);

drop trigger if exists set_contacts_timestamp on public.contacts;
create trigger set_contacts_timestamp
before update on public.contacts
for each row
execute procedure public.set_timestamp();

-- EVIDENCE --------------------------------------------------------------------

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('photo', 'audio')),
  path text not null,
  size bigint not null,
  location jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_evidence_user_id
  on public.evidence (user_id, created_at desc);

-- STORAGE BUCKET --------------------------------------------------------------

-- This creates the bucket used by the /api/evidence routes.
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

-- OPTIONAL: Row-Level Security (RLS) -----------------------------------------
-- Note: the app uses the Supabase **service role key** from the backend,
-- which bypasses RLS. These policies are here in case you later decide
-- to access data directly from the client with Supabase auth.

alter table public.users enable row level security;
alter table public.contacts enable row level security;
alter table public.evidence enable row level security;

-- Allow each authenticated user to see/update only their own contacts/evidence
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'contacts'
      and policyname = 'Users can manage their contacts'
  ) then
    create policy "Users can manage their contacts"
      on public.contacts
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'evidence'
      and policyname = 'Users can manage their evidence'
  ) then
    create policy "Users can manage their evidence"
      on public.evidence
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;


