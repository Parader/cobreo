-- Allow phone-first diagnostic leads (email optional)
alter table public.contacts
  alter column email drop not null;

-- Empty string email should not collide; normalize via app. Unique still applies to non-null emails.
create unique index if not exists contacts_phone_unique
  on public.contacts (phone)
  where phone is not null and phone <> '';
