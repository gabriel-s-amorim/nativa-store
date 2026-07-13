/**
 * Pedidos antigos já pagos ou tentativas aceitas pelo Mercado Pago.
 * Tentativas locais que falharam antes de serem aceitas não aparecem como pedidos.
 */
export const VISIBLE_ORDER_FILTER =
  "and(mercado_pago_order_id.not.is.null,payment_status.neq.rejected),status.eq.paid";
