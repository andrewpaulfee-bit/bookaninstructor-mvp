drop policy if exists "Admins can view all instructor profiles" on public.instructors;
drop policy if exists "Admins can update instructor profiles" on public.instructors;
drop policy if exists "Admins can view all client requests" on public.client_requests;
drop policy if exists "Admins can update client requests" on public.client_requests;
drop policy if exists "Admins can view all booking agreements" on public.booking_agreements;

create policy "Admins can view all instructor profiles"
on public.instructors
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can update instructor profiles"
on public.instructors
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can view all client requests"
on public.client_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can update client requests"
on public.client_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can view all booking agreements"
on public.booking_agreements
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

notify pgrst, 'reload schema';
