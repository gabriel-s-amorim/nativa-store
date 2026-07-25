-- Bloqueia chamada pública das RPCs privilegiadas (SECURITY DEFINER).
-- Só o backend com service_role deve executá-las.
-- Já aplicado no projeto remoto; mantenha este arquivo para reaplicar em novos ambientes.

REVOKE ALL ON FUNCTION public.checkout_accept_payment(uuid, text, text, text, text, timestamptz, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_accept_payment(uuid, text, text, text, text, timestamptz, jsonb, jsonb) TO service_role;

REVOKE ALL ON FUNCTION public.checkout_create_order(uuid, uuid, text, numeric, numeric, text, jsonb, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_create_order(uuid, uuid, text, numeric, numeric, text, jsonb, text, jsonb) TO service_role;

REVOKE ALL ON FUNCTION public.checkout_create_payment_order(uuid, uuid, numeric, numeric, text, jsonb, text, jsonb, uuid, text, uuid, text, text, text, integer, text, jsonb, jsonb, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_create_payment_order(uuid, uuid, numeric, numeric, text, jsonb, text, jsonb, uuid, text, uuid, text, text, text, integer, text, jsonb, jsonb, numeric) TO service_role;

REVOKE ALL ON FUNCTION public.reconcile_mercado_pago_payment(text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_mercado_pago_payment(text, text, text, text, jsonb) TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_customer() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_admin_new_order() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_admin_new_customer() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_admin_paid_order() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_customer() SET search_path = public, auth;
