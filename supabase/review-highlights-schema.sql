create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  instructor_id uuid references public.instructors(id) on delete cascade,
  reviewer_name text,
  reviewer_type text check (reviewer_type in ('client', 'instructor')),
  rating integer check (rating between 1 and 5),
  comment text,
  published boolean default false
);

alter table public.reviews enable row level security;

drop policy if exists "Anyone can view published reviews" on public.reviews;

create policy "Anyone can view published reviews"
on public.reviews
for select
to anon, authenticated
using (published = true);

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

alter table public.reviews
add column if not exists review_tags text[] default '{}';

alter table public.client_reviews
add column if not exists review_tags text[] default '{}';

notify pgrst, 'reload schema';
