-- Run this after the staff member has signed in at least once.
-- Replace joyce@example.com with the staff member's actual login email.

update public.profiles
set role = 'admin',
    updated_at = now()
where lower(email) = lower('joyce@example.com');

-- Optional check: this should return the staff profile with role = admin.
select id, email, full_name, role
from public.profiles
where lower(email) = lower('joyce@example.com');
