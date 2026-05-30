alter table public.client_requests
add column if not exists repeat_start_date date,
add column if not exists repeat_end_date date,
add column if not exists repeat_day text,
add column if not exists repeat_start_time time,
add column if not exists repeat_end_time time,
add column if not exists repeat_weeks numeric,
add column if not exists repeat_notes text;

notify pgrst, 'reload schema';
