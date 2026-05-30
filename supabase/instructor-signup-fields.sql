alter table public.instructors
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists date_of_birth date,
  add column if not exists abn text,
  add column if not exists registered_for_gst boolean default false,
  add column if not exists mobile text,
  add column if not exists country text default 'Australia',
  add column if not exists service_areas text[] default '{}',
  add column if not exists headshot_url text,
  add column if not exists cv_url text,
  add column if not exists profile_video_url text,
  add column if not exists working_with_children_card text,
  add column if not exists working_with_children_expiry date,
  add column if not exists terms_accepted boolean default false;

insert into storage.buckets (id, name, public)
values ('instructor-files', 'instructor-files', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload instructor files" on storage.objects;
drop policy if exists "Anyone can view instructor files" on storage.objects;

create policy "Anyone can upload instructor files"
on storage.objects
for insert
to anon
with check (bucket_id = 'instructor-files');

create policy "Anyone can view instructor files"
on storage.objects
for select
to anon
using (bucket_id = 'instructor-files');
