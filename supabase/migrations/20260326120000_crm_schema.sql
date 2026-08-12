-- Cobreo CRM schema (apply on project Cobreo only)
-- Enable required extensions
create extension if not exists "pgcrypto";

-- Admin profiles (invite-only; no public signup)
create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  company_name text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  source text not null check (source in ('contact_form', 'diagnostic', 'manual')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'won', 'archived')),
  title text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  message text not null,
  locale text,
  created_at timestamptz not null default now()
);

create table if not exists public.diagnostic_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  summary text,
  locale text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists contacts_email_idx on public.contacts (email);

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.diagnostic_submissions enable row level security;
alter table public.admin_audit_events enable row level security;

-- No anon/authenticated read of CRM data
create policy admin_profiles_select on public.admin_profiles
  for select to authenticated using (public.is_admin());

create policy contacts_admin_all on public.contacts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy leads_admin_all on public.leads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy contact_submissions_admin_all on public.contact_submissions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy diagnostic_submissions_admin_all on public.diagnostic_submissions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy audit_admin_select on public.admin_audit_events
  for select to authenticated using (public.is_admin());

-- Public inserts go through service role from server actions (not anon policies).
-- Optionally allow locked-down anon insert later; default is deny.
