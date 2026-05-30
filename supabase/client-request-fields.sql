alter table public.client_requests
  add column if not exists title text,
  add column if not exists budget numeric,
  add column if not exists total_hours numeric,
  add column if not exists style text,
  add column if not exists class_level text,
  add column if not exists style_levels jsonb default '[]'::jsonb,
  add column if not exists class_frequency text,
  add column if not exists company_name text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists mobile text,
  add column if not exists terms_accepted boolean default false,
  add column if not exists image_urls text[] default '{}';

alter table public.client_requests
  add column if not exists selected_instructor_id uuid references public.instructors(id) on delete set null;

insert into storage.buckets (id, name, public)
values ('request-files', 'request-files', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload request files" on storage.objects;
drop policy if exists "Anyone can view request files" on storage.objects;

create policy "Anyone can upload request files"
on storage.objects
for insert
to anon
with check (bucket_id = 'request-files');

create policy "Anyone can view request files"
on storage.objects
for select
to anon
using (bucket_id = 'request-files');
