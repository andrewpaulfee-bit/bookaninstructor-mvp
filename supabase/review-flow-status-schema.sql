update public.booking_agreements
set payout_status = 'awaiting_client_review',
    payout_ready_at = null
where payment_status = 'paid'
  and class_completed_at is not null
  and client_review_submitted_at is null
  and payout_status = 'ready_for_review';

update public.booking_agreements
set payout_status = 'ready_for_review',
    payout_ready_at = coalesce(payout_ready_at, client_review_submitted_at, now())
where payment_status = 'paid'
  and class_completed_at is not null
  and client_review_submitted_at is not null
  and payout_status in ('not_ready', 'awaiting_client_review');

notify pgrst, 'reload schema';
