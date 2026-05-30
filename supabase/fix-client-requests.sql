alter table public.client_requests
  add column if not exists client_user_id uuid references auth.users(id) on delete set null,
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
  add column if not exists image_urls text[] default '{}',
  add column if not exists selected_instructor_id uuid references public.instructors(id) on delete set null,
  add column if not exists review_notes text;

alter table public.client_requests
  alter column status set default 'pending_review';

alter table public.client_requests enable row level security;

drop policy if exists "Public can view approved client requests" on public.client_requests;
drop policy if exists "Clients can create own requests" on public.client_requests;
drop policy if exists "Clients can view own requests" on public.client_requests;
drop policy if exists "Clients can update own requests" on public.client_requests;

create policy "Public can view approved client requests"
on public.client_requests
for select
to anon, authenticated
using (status in ('open', 'instructor_selected', 'booking_confirmed'));

create policy "Clients can create own requests"
on public.client_requests
for insert
to authenticated
with check (client_user_id = auth.uid());

create policy "Clients can view own requests"
on public.client_requests
for select
to authenticated
using (client_user_id = auth.uid() or client_email = auth.jwt() ->> 'email');

create policy "Clients can update own requests"
on public.client_requests
for update
to authenticated
using (client_user_id = auth.uid())
with check (client_user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('request-files', 'request-files', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload request files" on storage.objects;
drop policy if exists "Anyone can view request files" on storage.objects;

create policy "Authenticated users can upload request files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'request-files');

create policy "Anyone can view request files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'request-files');

notify pgrst, 'reload schema';
