-- Drop old tables (FK-chained, safe order)
drop table if exists public.payroll_rows cascade;
drop table if exists public.payroll_jobs cascade;
drop table if exists public.transactions cascade;
drop table if exists public.profiles cascade;

-- Drop old trigger
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- profiles — standalone, no FK to auth.users (we use Firebase auth)
create table public.profiles (
  id             uuid default gen_random_uuid() primary key,
  firebase_uid   text unique not null,
  name           text not null,
  email          text,
  avatar         text,
  wallet_id      text unique,
  wallet_address text,
  created_at     timestamptz default now()
);

create index profiles_firebase_uid_idx on public.profiles(firebase_uid);

-- transactions
create table public.transactions (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  circle_id           text unique,
  amount              numeric not null,
  recipient_address   text not null,
  destination_country text,
  input_currency      text default 'USD',
  input_amount        numeric,
  status              text default 'INITIATED',
  tx_hash             text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- payroll_jobs
create table public.payroll_jobs (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  name       text not null,
  status     text default 'pending',
  total_usdc numeric default 0,
  created_at timestamptz default now()
);

-- payroll_rows
create table public.payroll_rows (
  id      uuid default gen_random_uuid() primary key,
  job_id  uuid references public.payroll_jobs(id) on delete cascade not null,
  name    text not null,
  address text not null,
  amount  numeric not null,
  status  text default 'pending',
  tx_id   text,
  error   text
);

-- Disable RLS on all (we use service role key server-side)
alter table public.profiles    disable row level security;
alter table public.transactions disable row level security;
alter table public.payroll_jobs disable row level security;
alter table public.payroll_rows disable row level security;
