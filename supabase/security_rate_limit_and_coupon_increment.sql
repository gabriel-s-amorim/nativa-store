-- Rate limit durável (serverless) + incremento atômico de cupom
-- Já aplicado no projeto remoto; mantenha para reaplicar em novos ambientes.

create table if not exists public.rate_limit_events (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_bucket_created_idx
  on public.rate_limit_events (bucket, created_at desc);

alter table public.rate_limit_events enable row level security;

create or replace function public.increment_coupon_usage(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated int;
begin
  update public.coupons
  set
    usage_count = usage_count + 1,
    updated_at = now()
  where lower(code) = lower(trim(p_code))
    and (max_uses is null or usage_count < max_uses);

  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;

revoke all on function public.increment_coupon_usage(text) from public;
revoke all on function public.increment_coupon_usage(text) from anon;
revoke all on function public.increment_coupon_usage(text) from authenticated;
grant execute on function public.increment_coupon_usage(text) to service_role;
