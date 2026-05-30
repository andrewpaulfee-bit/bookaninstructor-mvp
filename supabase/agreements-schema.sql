create table if not exists public.booking_agreements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  accepted_at timestamp with time zone,
  contract_number text,
  request_id uuid not null references public.client_requests(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  client_user_id uuid references auth.users(id) on delete set null,
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  instructor_user_id uuid references auth.users(id) on delete set null,
  status text default 'draft',
  client_name text,
  client_organisation text,
  instructor_name text,
  job_title text,
  style text,
  class_level text,
  location text,
  booking_details text,
  availability text,
  total_fee numeric,
  total_hours numeric,
  hourly_rate numeric,
  commission_rate numeric default 0.10,
  commission_amount numeric,
  instructor_payout numeric,
  agreement_version text default 'bookaninstructor-v1',
  unique (offer_id)
);

alter table public.booking_agreements
alter column status set default 'draft';

alter table public.booking_agreements
add column if not exists contract_number text;

alter table public.booking_agreements
alter column contract_number set default lpad(floor(random() * 100000000)::int::text, 8, '0');

update public.booking_agreements
set contract_number = lpad(floor(random() * 100000000)::int::text, 8, '0')
where contract_number is null;

create unique index if not exists booking_agreements_contract_number_key
on public.booking_agreements (contract_number);

alter table public.booking_agreements enable row level security;

drop policy if exists "Agreement participants can view agreements" on public.booking_agreements;
drop policy if exists "Clients can create booking agreements" on public.booking_agreements;
drop policy if exists "Clients can update sent booking agreements" on public.booking_agreements;
drop policy if exists "Instructors can accept own agreements" on public.booking_agreements;

create policy "Agreement participants can view agreements"
on public.booking_agreements
for select
to authenticated
using (
  client_user_id = auth.uid()
  or (instructor_user_id = auth.uid() and status in ('sent', 'accepted'))
);

create policy "Clients can create booking agreements"
on public.booking_agreements
for insert
to authenticated
with check (client_user_id = auth.uid());

create policy "Clients can update sent booking agreements"
on public.booking_agreements
for update
to authenticated
using (client_user_id = auth.uid() and status in ('draft', 'sent'))
with check (client_user_id = auth.uid());

create policy "Instructors can accept own agreements"
on public.booking_agreements
for update
to authenticated
using (instructor_user_id = auth.uid() and status = 'sent')
with check (instructor_user_id = auth.uid() and status = 'accepted');

notify pgrst, 'reload schema';
