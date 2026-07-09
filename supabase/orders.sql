-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard)
-- Pedidos — checkout com snapshots dos itens do carrinho

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'canceled')),
  total_amount numeric(10, 2) not null,
  shipping_amount numeric(10, 2) not null default 0,
  coupon_code text,
  shipping_address jsonb not null,
  payment_method text not null
    check (payment_method in ('pix', 'credit_card', 'boleto')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  name text not null,
  quantity int not null check (quantity > 0),
  price numeric(10, 2) not null,
  size text not null,
  color text,
  image text not null
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- Escrita/leitura via API Express (service role) — RLS habilitado sem policies públicas
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Checkout atômico: cria pedido, insere itens, esvazia carrinho e marca como convertido
create or replace function public.checkout_create_order(
  p_customer_id uuid,
  p_cart_id uuid,
  p_status text,
  p_total_amount numeric,
  p_shipping_amount numeric,
  p_coupon_code text,
  p_shipping_address jsonb,
  p_payment_method text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart public.carts%rowtype;
  v_order public.orders%rowtype;
  v_item jsonb;
begin
  select * into v_cart
  from public.carts
  where id = p_cart_id
    and customer_id = p_customer_id
    and status = 'active'
  for update;

  if not found then
    raise exception 'Carrinho não encontrado ou inválido';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Carrinho vazio';
  end if;

  insert into public.orders (
    customer_id,
    status,
    total_amount,
    shipping_amount,
    coupon_code,
    shipping_address,
    payment_method
  ) values (
    p_customer_id,
    p_status,
    p_total_amount,
    p_shipping_amount,
    p_coupon_code,
    p_shipping_address,
    p_payment_method
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id,
      product_slug,
      name,
      quantity,
      price,
      size,
      color,
      image
    ) values (
      v_order.id,
      v_item->>'product_slug',
      v_item->>'name',
      (v_item->>'quantity')::int,
      (v_item->>'price')::numeric,
      v_item->>'size',
      nullif(v_item->>'color', ''),
      v_item->>'image'
    );
  end loop;

  delete from public.cart_items where cart_id = p_cart_id;

  update public.carts
  set status = 'converted'
  where id = p_cart_id;

  return v_order;
end;
$$;
