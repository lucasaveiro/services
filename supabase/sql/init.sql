-- Enable UUID generator
create extension if not exists pgcrypto;

-- Tables
create table public.providers (
id uuid primary key default gen_random_uuid(),
user_id uuid not null,
display_name text not null,
city text not null,
uf text not null,
hourly_rate numeric,
service_area_km int,
accepts_emergency bool default false,
created_at timestamptz not null default now()
);

create unique index providers_user_id_uidx on public.providers(user_id);

create table public.provider_categories (
provider_id uuid not null references public.providers(id) on delete cascade,
category_slug text not null,
primary key (provider_id, category_slug)
);

-- RLS
alter table public.providers enable row level security;
alter table public.provider_categories enable row level security;

-- Providers policies (owner = auth.uid())
create policy "providers_select_owner"
on public.providers for select
using ( auth.uid() = user_id );

create policy "providers_insert_owner"
on public.providers for insert
with check ( auth.uid() = user_id );

create policy "providers_update_owner"
on public.providers for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

create policy "providers_delete_owner"
on public.providers for delete
using ( auth.uid() = user_id );

-- Provider_categories policies via ownership of parent
create policy "pc_select_owner"
on public.provider_categories for select
using (
exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid())
);

create policy "pc_insert_owner"
on public.provider_categories for insert
with check (
exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid())
);

create policy "pc_update_owner"
on public.provider_categories for update
using (
exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid())
)
with check (
exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid())
);

create policy "pc_delete_owner"
on public.provider_categories for delete
using (
exists (select 1 from public.providers p where p.id = provider_id and p.user_id = auth.uid())
);