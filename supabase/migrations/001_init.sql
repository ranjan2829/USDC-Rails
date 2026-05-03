-- Run this in Supabase Dashboard > SQL Editor

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  name          text not null,
  wallet_id     text unique,
  wallet_address text,
  created_at    timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile"  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Transactions
create table if not exists public.transactions (
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
alter table public.transactions enable row level security;
create policy "Users can view own transactions"   on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);

-- Payroll jobs
create table if not exists public.payroll_jobs (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  name       text not null,
  status     text default 'pending',
  total_usdc numeric default 0,
  created_at timestamptz default now()
);
alter table public.payroll_jobs enable row level security;
create policy "Users can view own payroll jobs"   on public.payroll_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own payroll jobs" on public.payroll_jobs for insert with check (auth.uid() = user_id);
create policy "Users can update own payroll jobs" on public.payroll_jobs for update using (auth.uid() = user_id);

-- Payroll rows
create table if not exists public.payroll_rows (
  id      uuid default gen_random_uuid() primary key,
  job_id  uuid references public.payroll_jobs(id) on delete cascade not null,
  name    text not null,
  address text not null,
  amount  numeric not null,
  status  text default 'pending',
  tx_id   text,
  error   text
);
alter table public.payroll_rows enable row level security;
create policy "Users can manage own payroll rows" on public.payroll_rows
  for all using (
    exists (select 1 from public.payroll_jobs j where j.id = job_id and j.user_id = auth.uid())
  );

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
