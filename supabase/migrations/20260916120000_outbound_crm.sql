-- Outbound CRM: people, activity timeline, next steps, appointments

create table if not exists public.lead_people (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  full_name text not null,
  role text,
  email text,
  phone text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  person_id uuid references public.lead_people (id) on delete set null,
  kind text not null check (kind in ('note', 'call', 'email', 'meeting', 'other')),
  occurred_at timestamptz not null default now(),
  summary text not null,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_next_steps (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  person_id uuid references public.lead_people (id) on delete set null,
  title text not null,
  due_at date,
  status text not null default 'open' check (status in ('open', 'done', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.lead_appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  person_id uuid references public.lead_people (id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_or_link text,
  status text not null default 'planned' check (status in ('planned', 'done', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lead_people_lead_idx on public.lead_people (lead_id);
create index if not exists lead_activities_lead_idx on public.lead_activities (lead_id, occurred_at desc);
create index if not exists lead_next_steps_lead_idx on public.lead_next_steps (lead_id, status, due_at);
create index if not exists lead_appointments_lead_idx on public.lead_appointments (lead_id, starts_at);
create index if not exists lead_next_steps_open_due_idx on public.lead_next_steps (due_at) where status = 'open';
create index if not exists lead_appointments_upcoming_idx on public.lead_appointments (starts_at) where status = 'planned';

alter table public.lead_people enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_next_steps enable row level security;
alter table public.lead_appointments enable row level security;

create policy lead_people_admin_all on public.lead_people
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy lead_activities_admin_all on public.lead_activities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy lead_next_steps_admin_all on public.lead_next_steps
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy lead_appointments_admin_all on public.lead_appointments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
