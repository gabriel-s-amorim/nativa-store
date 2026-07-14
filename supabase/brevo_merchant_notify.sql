-- Execute manualmente no SQL Editor do Supabase (produção/preview).
-- Completa brevo_settings com aviso de pedido para a loja.

alter table public.brevo_settings
  add column if not exists merchant_notify_email text not null default '';

alter table public.brevo_settings
  add column if not exists template_order_received_merchant bigint;
