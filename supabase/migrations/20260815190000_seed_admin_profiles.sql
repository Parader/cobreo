-- Fix empty admin_profiles so authenticated admins can read CRM via RLS (is_admin()).
-- Safe to re-run: skips existing rows.
insert into public.admin_profiles (user_id, email, role)
select u.id, u.email, 'admin'
from auth.users u
where u.email is not null
on conflict (user_id) do nothing;
