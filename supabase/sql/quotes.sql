-- quote_requests table
create table if not exists public.quote_requests (
id uuid primary key default gen_random_uuid(),
user_id uuid not null,
category_slug text not null,
description text not null,
city text not null,
uf text not null,
preferred_times jsonb[] default '{}',
budget_max numeric,
created_at timestamptz not null default now()
);

create index if not exists qr_user_id_idx on public.quote_requests(user_id);
alter table public.quote_requests enable row level security;

-- RLS: owner = auth.uid()
create policy "qr_select_owner"
on public.quote_requests for select
using (auth.uid() = user_id);

create policy "qr_insert_owner"
on public.quote_requests for insert
with check (auth.uid() = user_id);

create policy "qr_update_owner"
on public.quote_requests for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "qr_delete_owner"
on public.quote_requests for delete
using (auth.uid() = user_id);