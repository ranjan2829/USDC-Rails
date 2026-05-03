create table if not exists public.escrows (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  title        text not null,
  description  text,
  amount       numeric not null,
  recipient    text not null,
  status       text default 'locked',
  tx_id        text,
  created_at   timestamptz default now(),
  released_at  timestamptz
);

create table if not exists public.invoices (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  client_name  text not null,
  description  text,
  amount       numeric not null,
  due_date     date,
  status       text default 'unpaid',
  tx_id        text,
  created_at   timestamptz default now(),
  paid_at      timestamptz
);

alter table public.escrows  disable row level security;
alter table public.invoices disable row level security;
