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

notify pgrst, 'reload schema';
