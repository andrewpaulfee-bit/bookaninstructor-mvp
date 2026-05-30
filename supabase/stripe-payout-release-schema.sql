alter table public.instructors
add column if not exists stripe_connect_account_id text,
add column if not exists stripe_connect_onboarding_complete boolean default false,
add column if not exists stripe_connect_charges_enabled boolean default false,
add column if not exists stripe_connect_payouts_enabled boolean default false,
add column if not exists stripe_connect_requirements_due text[] default '{}',
add column if not exists stripe_connect_updated_at timestamp with time zone;

alter table public.booking_agreements
add column if not exists payout_method text,
add column if not exists stripe_transfer_id text;

create unique index if not exists booking_agreements_stripe_transfer_id_key
on public.booking_agreements (stripe_transfer_id)
where stripe_transfer_id is not null;

notify pgrst, 'reload schema';
