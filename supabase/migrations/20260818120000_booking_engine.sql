-- Mini moteur de réservation Cobreo (diagnostic → CRM → calendrier)
create extension if not exists "btree_gist";

-- 1) Règles de disponibilité (hôte Cobreo)
create table if not exists public.booking_availability_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'default',
  timezone text not null default 'America/Toronto',
  duration_minutes integer not null default 15 check (duration_minutes > 0),
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0),
  notice_minutes integer not null default 120 check (notice_minutes >= 0),
  horizon_days integer not null default 14 check (horizon_days > 0),
  max_slots_displayed integer not null default 24 check (max_slots_displayed > 0),
  -- 0=Sunday … 6=Saturday (JS getDay)
  weekdays smallint[] not null default '{1,2,3,4,5}',
  -- windows in local time, e.g. [{"start":"09:00","end":"12:00"},{"start":"13:00","end":"17:00"}]
  windows jsonb not null default '[{"start":"09:00","end":"12:00"},{"start":"13:00","end":"17:00"}]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Connexions calendrier (OAuth / provider)
create table if not exists public.calendar_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('google', 'microsoft', 'manual')),
  account_email text,
  calendar_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  meta jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Holds temporaires sur créneaux
create table if not exists public.booking_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Toronto',
  status text not null default 'held'
    check (status in ('held', 'released', 'converted', 'expired')),
  hold_token text not null unique,
  hold_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint booking_slots_range_chk check (ends_at > starts_at)
);

create index if not exists booking_slots_range_idx
  on public.booking_slots (starts_at, ends_at)
  where status = 'held';

create index if not exists booking_slots_expiry_idx
  on public.booking_slots (hold_expires_at)
  where status = 'held';

-- 4) Réservations confirmées (rattachées au CRM)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  diagnostic_submission_id uuid references public.diagnostic_submissions (id) on delete set null,
  calendar_connection_id uuid references public.calendar_connections (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  status text not null default 'confirmed'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  prospect_name text not null,
  prospect_email text not null,
  company_name text,
  declared_ambitions text[] not null default '{}',
  selected_sections jsonb not null default '[]'::jsonb,
  suggested_services jsonb not null default '[]'::jsonb,
  diagnostic_summary text,
  calendar_event_id text,
  calendar_html_link text,
  ics_uid text,
  locale text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_range_chk check (ends_at > starts_at)
);

create index if not exists bookings_starts_idx on public.bookings (starts_at);
create index if not exists bookings_lead_idx on public.bookings (lead_id);
create index if not exists bookings_status_idx on public.bookings (status);

-- Empêche le double booking sur créneaux confirmés (ou pending)
alter table public.bookings
  drop constraint if exists bookings_no_overlap;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

-- Allow diagnostic booking as lead source
alter table public.leads drop constraint if exists leads_source_check;
alter table public.leads
  add constraint leads_source_check
  check (source = any (array['contact_form'::text, 'diagnostic'::text, 'diagnostic_booking'::text, 'manual'::text]));

-- Seed default availability if empty
insert into public.booking_availability_rules (name)
select 'Cobreo — appels découverte 15 min'
where not exists (select 1 from public.booking_availability_rules);

-- RLS: admin read/write; public writes only via service role
alter table public.booking_availability_rules enable row level security;
alter table public.calendar_connections enable row level security;
alter table public.booking_slots enable row level security;
alter table public.bookings enable row level security;

create policy booking_rules_admin_all on public.booking_availability_rules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy calendar_connections_admin_all on public.calendar_connections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy booking_slots_admin_all on public.booking_slots
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy bookings_admin_all on public.bookings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Expire stale holds (callable from service role)
create or replace function public.expire_stale_booking_holds()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.booking_slots
  set status = 'expired'
  where status = 'held'
    and hold_expires_at < now();
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.expire_stale_booking_holds() from public;
revoke all on function public.expire_stale_booking_holds() from anon, authenticated;
grant execute on function public.expire_stale_booking_holds() to service_role;
