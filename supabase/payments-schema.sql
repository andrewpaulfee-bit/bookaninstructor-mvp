alter table public.booking_agreements
add column if not exists stripe_checkout_session_id text,
add column if not exists stripe_payment_intent_id text,
add column if not exists payment_status text default 'unpaid',
add column if not exists paid_at timestamp with time zone;

update public.booking_agreements
set payment_status = 'unpaid'
where payment_status is null;

notify pgrst, 'reload schema';
