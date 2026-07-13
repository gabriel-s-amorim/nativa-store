export const FREE_SHIPPING_THRESHOLD = 299;

export const STANDARD_SHIPPING_COST = 0;

export function calculateShippingAmount(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

export const CART_SESSION_COOKIE = "nativa_cart_session";

export const CART_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export const CART_STATUS_ACTIVE = "active" as const;
export const CART_STATUS_CONVERTED = "converted" as const;
