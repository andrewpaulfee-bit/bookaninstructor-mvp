alter table public.booking_agreements
add column if not exists class_completed_at timestamp with time zone,
add column if not exists class_completed_by uuid references auth.users(id) on delete set null,
add column if not exists client_review_requested_at timestamp with time zone,
add column if not exists instructor_review_requested_at timestamp with time zone,
add column if not exists client_review_submitted_at timestamp with time zone,
add column if not exists instructor_review_submitted_at timestamp with time zone,
add column if not exists payout_status text default 'not_ready',
add column if not exists payout_ready_at timestamp with time zone;

update public.booking_agreements
set payout_status = 'not_ready'
where payout_status is null;

create table if not exists public.client_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  agreement_id uuid references public.booking_agreements(id) on delete cascade,
  request_id uuid references public.client_requests(id) on delete cascade,
  client_user_id uuid references auth.users(id) on delete set null,
  instructor_id uuid references public.instructors(id) on delete cascade,
  instructor_user_id uuid references auth.users(id) on delete set null,
  client_name text,
  reviewer_name text,
  rating integer check (rating between 1 and 5),
  comment text,
  published boolean default false,
  unique (agreement_id)
);

alter table public.client_reviews enable row level security;

drop policy if exists "Instructors can view own client reviews" on public.client_reviews;

create policy "Instructors can view own client reviews"
on public.client_reviews
for select
to authenticated
using (instructor_user_id = auth.uid());

notify pgrst, 'reload schema';
