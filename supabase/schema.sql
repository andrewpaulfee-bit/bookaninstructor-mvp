create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  first_name text,
  last_name text,
  name text not null,
  email text not null,
  location text,
  categories text[],
  bio text,
  hourly_rate numeric,
  date_of_birth date,
  abn text,
  registered_for_gst boolean default false,
  mobile text,
  country text default 'Australia',
  service_areas text[] default '{}',
  headshot_url text,
  cv_url text,
  profile_video_url text,
  working_with_children_card text,
  working_with_children_expiry date,
  terms_accepted boolean default false,
  approved boolean default false,
  review_status text default 'pending_review',
  review_notes text
);

create table public.client_requests (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  title text,
  budget numeric,
  total_hours numeric,
  style text,
  class_level text,
  class_frequency text,
  company_name text,
  first_name text,
  last_name text,
  client_name text not null,
  client_email text not null,
  mobile text,
  category text not null,
  location text,
  event_date date,
  details text,
  style_levels jsonb default '[]'::jsonb,
  terms_accepted boolean default false,
  image_urls text[] default '{}',
  selected_instructor_id uuid references public.instructors(id) on delete set null,
  status text default 'pending_review',
  review_notes text
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  request_id uuid references public.client_requests(id) on delete cascade,
  instructor_id uuid references public.instructors(id) on delete cascade,
  price numeric,
  proposed_rate numeric,
  availability text,
  message text,
  status text default 'sent',
  updated_at timestamp with time zone default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  instructor_id uuid references public.instructors(id) on delete cascade,
  reviewer_name text,
  reviewer_type text check (reviewer_type in ('client', 'instructor')),
  rating integer check (rating between 1 and 5),
  comment text,
  published boolean default false
);

create table public.conversations (
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

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_role text check (author_role in ('client', 'instructor', 'admin')),
  body text not null,
  blocked_contact_attempt boolean default false
);
