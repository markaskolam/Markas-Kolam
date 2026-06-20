create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  price text,
  use_cases text[],
  whatsapp_message text,
  featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.site_settings enable row level security;

create policy "Products are readable by everyone"
  on public.products for select
  using (true);

create policy "Authenticated users can manage products"
  on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Site settings are readable by everyone"
  on public.site_settings for select
  using (true);

create policy "Authenticated users can manage site settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
