-- Drachma cloud schema (Supabase)
-- Run this in Supabase Dashboard -> SQL Editor.

create table if not exists public.expenses (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  title text not null default '',
  amount integer not null check (amount >= 0),
  category_id text not null default 'other',
  method text not null default '',
  date date not null,
  note text not null default '',
  ts bigint not null default 0,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.categories (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  color text not null default '#9a9b92',
  icon text not null default 'other',
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'đ',
  monthly_budget bigint not null default 0,
  payment_methods jsonb not null default '[]'::jsonb,
  tone boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists expenses_user_updated on public.expenses (user_id, updated_at);
create index if not exists categories_user_updated on public.categories (user_id, updated_at);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists expenses_touch on public.expenses;
create trigger expenses_touch before insert or update on public.expenses
for each row execute function public.touch_updated_at();

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before insert or update on public.categories
for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before insert or update on public.settings
for each row execute function public.touch_updated_at();

alter table public.expenses enable row level security;
alter table public.categories enable row level security;
alter table public.settings enable row level security;

drop policy if exists "own expenses" on public.expenses;
create policy "own expenses" on public.expenses
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own categories" on public.categories;
create policy "own categories" on public.categories
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own settings" on public.settings;
create policy "own settings" on public.settings
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.settings to authenticated;
