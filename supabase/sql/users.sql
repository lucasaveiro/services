-- users table for regular clients
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_self"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_self"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_self"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_delete_self"
  on public.users for delete
  using (auth.uid() = id);
