alter table public.booking_agreements
add column if not exists payout_approved_at timestamp with time zone,
add column if not exists payout_approved_by uuid references auth.users(id) on delete set null,
add column if not exists payout_paid_at timestamp with time zone,
add column if not exists payout_paid_by uuid references auth.users(id) on delete set null,
add column if not exists payout_reference text,
add column if not exists payout_notes text;

update public.booking_agreements
set payout_status = 'ready_for_review'
where payment_status = 'paid'
  and class_completed_at is not null
  and (payout_status is null or payout_status = 'not_ready');
