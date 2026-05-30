alter table public.instructors
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.client_requests
  add column if not exists client_user_id uuid references auth.users(id) on delete set null;

alter table public.offers
  add column if not exists proposed_rate numeric,
  add column if not exists availability text,
  add column if not exists updated_at timestamp with time zone default now();

alter table public.offers
  alter column status set default 'sent';

notify pgrst, 'reload schema';
