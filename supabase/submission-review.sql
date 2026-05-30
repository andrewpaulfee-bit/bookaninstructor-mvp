alter table public.instructors
  add column if not exists review_status text default 'pending_review',
  add column if not exists review_notes text;

alter table public.client_requests
  add column if not exists review_notes text;

update public.instructors
set review_status = case
  when approved = true then 'approved'
  when review_status is null then 'pending_review'
  else review_status
end;

alter table public.client_requests
  alter column status set default 'pending_review';

notify pgrst, 'reload schema';
