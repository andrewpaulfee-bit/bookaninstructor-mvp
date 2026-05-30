alter table public.reviews enable row level security;

drop policy if exists "Anyone can view published reviews" on public.reviews;
drop policy if exists "Anyone can submit reviews for MVP" on public.reviews;
drop policy if exists "Authenticated users can view published reviews" on public.reviews;
drop policy if exists "Booked clients can submit instructor reviews" on public.reviews;

create policy "Anyone can view published reviews"
on public.reviews
for select
to anon, authenticated
using (published = true);

create policy "Booked clients can submit instructor reviews"
on public.reviews
for insert
to authenticated
with check (
  reviewer_type = 'client'
  and exists (
    select 1
    from public.client_requests
    where client_requests.selected_instructor_id = reviews.instructor_id
      and client_requests.client_user_id = auth.uid()
      and client_requests.status in ('booking_confirmed', 'completed')
  )
);

notify pgrst, 'reload schema';
