-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard)

create table if not exists products (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  category text not null check (category in ('Roupas', 'Bolsas', 'Acessórios')),
  price numeric(10,2) not null,
  original_price numeric(10,2),
  image text not null,
  images jsonb not null default '[]',
  badge text not null default '',
  badge_color text not null default '#C4522A',
  rating numeric(2,1) not null default 0,
  reviews int not null default 0,
  featured boolean not null default false,
  short_description text not null,
  description text not null,
  materials jsonb not null default '[]',
  care_instructions jsonb not null default '[]',
  artisan jsonb not null default '{}',
  sizes jsonb not null default '[]',
  colors jsonb not null default '[]',
  sku text not null,
  in_stock boolean not null default true,
  stock_count int not null default 0,
  faq jsonb not null default '[]',
  highlights jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table products enable row level security;

drop policy if exists "Produtos visíveis para todos" on products;

create policy "Produtos visíveis para todos"
  on products for select
  using (true);
