alter table public.instructors
  add column if not exists user_id uuid references auth.users(id) on delete set null,
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
  add column if not exists terms_accepted boolean default false,
  add column if not exists review_status text default 'pending_review',
  add column if not exists review_notes text;

alter table public.instructors enable row level security;

drop policy if exists "Public can view approved instructors" on public.instructors;
drop policy if exists "Instructors can create own profile" on public.instructors;
drop policy if exists "Instructors can view own profile" on public.instructors;
drop policy if exists "Instructors can update own profile" on public.instructors;

create policy "Public can view approved instructors"
on public.instructors
for select
to anon, authenticated
using (approved = true and review_status = 'approved');

create policy "Instructors can create own profile"
on public.instructors
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Instructors can view own profile"
on public.instructors
for select
to authenticated
using (user_id = auth.uid() or email = auth.jwt() ->> 'email');

create policy "Instructors can update own profile"
on public.instructors
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('instructor-files', 'instructor-files', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload instructor files" on storage.objects;
drop policy if exists "Anyone can view instructor files" on storage.objects;

create policy "Authenticated users can upload instructor files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'instructor-files');

create policy "Anyone can view instructor files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'instructor-files');

notify pgrst, 'reload schema';
