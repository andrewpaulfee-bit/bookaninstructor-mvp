alter table public.instructors
add column if not exists stripe_connect_account_id text,
add column if not exists stripe_connect_onboarding_complete boolean default false,
add column if not exists stripe_connect_charges_enabled boolean default false,
add column if not exists stripe_connect_payouts_enabled boolean default false,
add column if not exists stripe_connect_requirements_due text[] default '{}',
add column if not exists stripe_connect_updated_at timestamp with time zone;

notify pgrst, 'reload schema';
