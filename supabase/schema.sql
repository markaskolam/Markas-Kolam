create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  price text,
  image_url text,
  use_cases text[],
  whatsapp_message text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null default 'admin',
  created_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_profiles enable row level security;

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

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  query text,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
  on public.admin_profiles for select
  using (public.is_admin());

drop policy if exists "Admins can read audit logs" on public.admin_audit_logs;
create policy "Admins can read audit logs"
  on public.admin_audit_logs for select
  using (public.is_admin());

drop policy if exists "Admins can insert audit logs" on public.admin_audit_logs;
create policy "Admins can insert audit logs"
  on public.admin_audit_logs for insert
  with check (public.is_admin());

drop policy if exists "Authenticated users can manage products" on public.products;
drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can manage site settings" on public.site_settings;
drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.admin_list_products()
returns setof public.products
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.products
  where public.is_admin()
  order by featured desc, created_at desc;
$$;

create or replace function public.admin_execute_readonly_sql(sql_query text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if sql_query is null or btrim(sql_query) = '' then
    raise exception 'Query wajib diisi.';
  end if;

  if not (lower(btrim(sql_query)) like 'select%') then
    raise exception 'Hanya SELECT read-only yang diizinkan.';
  end if;

  if sql_query ~* '\m(drop|truncate|alter|grant|revoke|create\s+extension|copy|execute|call)\M' then
    raise exception 'Statement berbahaya tidak diizinkan.';
  end if;

  if regexp_replace(sql_query, ';\s*$', '') like '%;%' then
    raise exception 'Multi-statement SQL tidak diizinkan.';
  end if;

  execute format('select coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb) from (%s) as t', sql_query) into result;
  return result;
end;
$$;

revoke all on function public.admin_execute_readonly_sql(text) from public, anon, authenticated;

grant execute on function public.admin_execute_readonly_sql(text) to service_role;


create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row
  execute function public.set_updated_at();
