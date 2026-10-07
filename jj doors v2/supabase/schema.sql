-- ---------- Extensions -------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------- Tables ---------------------------------------------------
create table if not exists public.categories (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text,
  small_description text default '',
  description       text default '',
  status            text not null default 'Active', 
  badge_color       text default 'gold',
  image             text,
  video             text,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

-- Ensure video column exists on existing categories table if updated
alter table public.categories add column if not exists video text;

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  sku            text,
  category_id    uuid references public.categories(id) on delete set null,
  category_name  text default '',
  price          numeric,
  badge          text default '',
  tagline        text default '',
  status         text not null default 'Published',   -- 'Published' | 'Draft'
  stock          integer default 0,
  image          text,
  description    text default '',
  features       jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_created_at_idx  on public.products (created_at desc);
create index if not exists categories_sort_idx      on public.categories (sort_order);

-- ---------- Row Level Security --------------------------------------
--  NOTE: this admin panel is a static site with no login wired to
--  Supabase Auth, so the anon key must be allowed to read & write.
--  If you later add real auth, replace the "true" checks below with
--  `auth.role() = 'authenticated'`.
alter table public.categories enable row level security;
alter table public.products   enable row level security;

drop policy if exists "catalog categories read"  on public.categories;
drop policy if exists "catalog categories write" on public.categories;
drop policy if exists "catalog products read"    on public.products;
drop policy if exists "catalog products write"   on public.products;

create policy "catalog categories read"  on public.categories for select using (true);
create policy "catalog categories write" on public.categories for all    using (true) with check (true);
create policy "catalog products read"    on public.products   for select using (true);
create policy "catalog products write"   on public.products   for all    using (true) with check (true);

-- ---------- Storage bucket for media (images & showcase videos) -------
insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do update set public = true;

drop policy if exists "catalog bucket read"   on storage.objects;
drop policy if exists "catalog bucket insert" on storage.objects;
drop policy if exists "catalog bucket update" on storage.objects;
drop policy if exists "catalog bucket delete" on storage.objects;

create policy "catalog bucket read"   on storage.objects for select using  (bucket_id = 'catalog');
create policy "catalog bucket insert" on storage.objects for insert with check (bucket_id = 'catalog');
create policy "catalog bucket update" on storage.objects for update using  (bucket_id = 'catalog');
create policy "catalog bucket delete" on storage.objects for delete using  (bucket_id = 'catalog');
