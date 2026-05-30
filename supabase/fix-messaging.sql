create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  request_id uuid references public.client_requests(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  client_user_id uuid references auth.users(id) on delete set null,
  instructor_id uuid references public.instructors(id) on delete cascade,
  instructor_user_id uuid references auth.users(id) on delete set null,
  status text default 'open',
  unique (request_id, instructor_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_role text check (author_role in ('client', 'instructor', 'admin')),
  body text not null,
  blocked_contact_attempt boolean default false
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Participants can view conversations" on public.conversations;
drop policy if exists "Clients can create conversations" on public.conversations;
drop policy if exists "Instructors can create conversations" on public.conversations;
drop policy if exists "Participants can update conversations" on public.conversations;

create policy "Participants can view conversations"
on public.conversations
for select
to authenticated
using (client_user_id = auth.uid() or instructor_user_id = auth.uid());

create policy "Clients can create conversations"
on public.conversations
for insert
to authenticated
with check (client_user_id = auth.uid());

create policy "Instructors can create conversations"
on public.conversations
for insert
to authenticated
with check (instructor_user_id = auth.uid());

create policy "Participants can update conversations"
on public.conversations
for update
to authenticated
using (client_user_id = auth.uid() or instructor_user_id = auth.uid())
with check (client_user_id = auth.uid() or instructor_user_id = auth.uid());

drop policy if exists "Participants can view messages" on public.messages;
drop policy if exists "Participants can create messages" on public.messages;

create policy "Participants can view messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.client_user_id = auth.uid()
        or conversations.instructor_user_id = auth.uid()
      )
  )
);

create policy "Participants can create messages"
on public.messages
for insert
to authenticated
with check (
  author_user_id = auth.uid()
  and exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.client_user_id = auth.uid()
        or conversations.instructor_user_id = auth.uid()
      )
  )
);

create or replace function public.message_contains_contact_details(message_body text)
returns boolean
language plpgsql
immutable
as $$
declare
  compact text;
  digits text;
begin
  compact := lower(coalesce(message_body, ''));
  digits := regexp_replace(compact, '[^0-9]', '', 'g');

  if compact ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}' then
    return true;
  end if;

  if compact ~* '\b[A-Z0-9._%+-]+\s*(\(|\[)?\s*(at|@)\s*(\)|\])?\s*[A-Z0-9.-]+\s*(\(|\[)?\s*(dot|\.)\s*(\)|\])?\s*[A-Z]{2,}\b' then
    return true;
  end if;

  if digits ~ '^04[0-9]{8}$'
    or digits ~ '^614[0-9]{8}$'
    or digits ~ '^0[2378][0-9]{8}$' then
    return true;
  end if;

  if length(digits) >= 8
    and compact ~* '(\+?[0-9][0-9\s().-]{6,}[0-9])' then
    return true;
  end if;

  if compact ~* '\b(email|e-mail|gmail|hotmail|outlook|icloud|yahoo|phone|mobile|mob|call|text|sms|whatsapp|telegram|signal)\b'
    and compact ~* '\b(https?://|www\.)' then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.reject_message_contact_details()
returns trigger
language plpgsql
as $$
begin
  if public.message_contains_contact_details(new.body) then
    new.blocked_contact_attempt := true;
    raise exception 'Please do not share mobile numbers, phone numbers, email addresses, or external contact links in chat.';
  end if;

  return new;
end;
$$;

drop trigger if exists reject_message_contact_details_trigger on public.messages;
create trigger reject_message_contact_details_trigger
before insert or update on public.messages
for each row execute function public.reject_message_contact_details();

notify pgrst, 'reload schema';
