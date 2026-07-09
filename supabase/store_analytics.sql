-- Execute no SQL Editor do Supabase
-- Rastreamento leve de visitas à loja (page views por sessão de visitante)

create table if not exists public.store_page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists store_page_views_created_at_idx
  on public.store_page_views (created_at desc);

create index if not exists store_page_views_session_id_idx
  on public.store_page_views (session_id);

create index if not exists store_page_views_path_idx
  on public.store_page_views (path);

alter table public.store_page_views enable row level security;
