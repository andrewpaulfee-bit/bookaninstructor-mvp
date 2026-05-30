create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  first_name text,
  last_name text,
  email text not null,
  phone text,
  city text,
  country text,
  contact_type text,
  lists text,
  tags text,
  role text,
  client_name text,
  source_user_id text
);

create unique index if not exists contacts_email_unique
on public.contacts (lower(email));

alter table public.contacts enable row level security;

drop policy if exists "Anyone can view contacts for MVP" on public.contacts;

create policy "Anyone can view contacts for MVP"
on public.contacts
for select
to anon
using (true);

