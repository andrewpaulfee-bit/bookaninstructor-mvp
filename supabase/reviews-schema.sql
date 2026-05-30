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
drop policy if exists "Anyone can submit reviews for MVP" on public.reviews;

create policy "Anyone can view published reviews"
on public.reviews
for select
to anon
using (published = true);

create policy "Anyone can submit reviews for MVP"
on public.reviews
for insert
to anon
with check (true);

