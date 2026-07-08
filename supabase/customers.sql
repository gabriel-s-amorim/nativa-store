-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard)
-- Objetivo: Perfil do cliente ligado ao Supabase Auth (auth.users)

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Manter updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_customer_profiles_updated_at on public.customer_profiles;
create trigger trg_customer_profiles_updated_at
before update on public.customer_profiles
for each row execute function public.set_updated_at();

-- RLS
alter table public.customer_profiles enable row level security;

drop policy if exists "Customers can read their profile" on public.customer_profiles;
create policy "Customers can read their profile"
  on public.customer_profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Customers can update their profile" on public.customer_profiles;
create policy "Customers can update their profile"
  on public.customer_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Criar linha de perfil automaticamente quando um usuário é criado no Auth
create or replace function public.handle_new_customer()
returns trigger as $$
begin
  insert into public.customer_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Importante: limitar o search_path para evitar riscos de segurança
alter function public.handle_new_customer() set search_path = public, auth;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
after insert on auth.users
for each row execute procedure public.handle_new_customer();

