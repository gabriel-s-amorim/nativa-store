-- Execute no SQL Editor do Supabase (ou via migration).
-- Configurações públicas da loja + páginas de ajuda editáveis.
-- Acesso de escrita apenas via service role no backend.

create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  contact_email text not null default 'contato@nativa.com.br',
  whatsapp_number text not null default '5511976984558',
  whatsapp_display text not null default '(11) 97698-4558',
  address_line text not null default 'São Paulo, SP — Brasil',
  instagram_url text not null default 'https://www.instagram.com/nativa_criativa/',
  facebook_url text not null default 'https://www.facebook.com/share/1BjeTNQpat/?mibextid=wwXIfr',
  tiktok_url text not null default 'https://www.tiktok.com/@nativa.criativa',
  twitter_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.store_settings enable row level security;

create table if not exists public.content_pages (
  slug text primary key,
  title text not null,
  seo_title text not null default '',
  seo_description text not null default '',
  page_type text not null check (page_type in ('howto', 'sections', 'faq')),
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_pages enable row level security;
