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

notify pgrst, 'reload schema';
