-- updated_at em products (lastmod do sitemap + auditoria de edição).
-- Execute no SQL Editor se a migration MCP não tiver sido aplicada.

alter table public.products
  add column if not exists updated_at timestamptz;

update public.products
set updated_at = created_at
where updated_at is null;

alter table public.products
  alter column updated_at set default now(),
  alter column updated_at set not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();
