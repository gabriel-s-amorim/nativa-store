import type {
  Coupon,
  CouponApplication,
  CouponType,
} from "@shared/types/coupon";
import type { ShippingQuoteOption } from "@shared/types/melhorEnvio";
import { applyCheapestOptionFree } from "./shipping";

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export type CouponEvalErrorCode =
  | "invalid"
  | "inactive"
  | "not_started"
  | "expired"
  | "min_subtotal"
  | "exhausted"
  | "customer_limit";

export class CouponEvalError extends Error {
  readonly code: CouponEvalErrorCode;
  readonly minSubtotal?: number;

  constructor(code: CouponEvalErrorCode, message: string, minSubtotal?: number) {
    super(message);
    this.name = "CouponEvalError";
    this.code = code;
    this.minSubtotal = minSubtotal;
  }
}

export function couponErrorMessage(error: CouponEvalError): string {
  switch (error.code) {
    case "invalid":
      return "Cupom inválido";
    case "inactive":
      return "Cupom inativo";
    case "not_started":
      return "Cupom ainda não está válido";
    case "expired":
      return "Cupom expirado";
    case "min_subtotal":
      return error.minSubtotal != null
        ? `Pedido mínimo de R$ ${error.minSubtotal.toFixed(2).replace(".", ",")}`
        : "Subtotal abaixo do mínimo do cupom";
    case "exhausted":
      return "Cupom esgotado";
    case "customer_limit":
      return "Limite de uso atingido";
    default:
      return "Cupom inválido";
  }
}

export interface EvaluateCouponContext {
  subtotal: number;
  now?: Date;
  /** Usos do cliente para este cupom (pedidos não cancelados). */
  customerUsageCount?: number;
}

/** Regras puras de elegibilidade (sem I/O). */
export function evaluateCoupon(
  coupon: Coupon,
  ctx: EvaluateCouponContext,
): void {
  const now = ctx.now ?? new Date();

  if (!coupon.isActive) {
    throw new CouponEvalError("inactive", "Cupom inativo");
  }

  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    throw new CouponEvalError("not_started", "Cupom ainda não está válido");
  }

  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    throw new CouponEvalError("expired", "Cupom expirado");
  }

  if (coupon.minSubtotal != null && ctx.subtotal < coupon.minSubtotal) {
    throw new CouponEvalError(
      "min_subtotal",
      "Subtotal abaixo do mínimo do cupom",
      coupon.minSubtotal,
    );
  }

  if (coupon.maxUses != null && coupon.usageCount >= coupon.maxUses) {
    throw new CouponEvalError("exhausted", "Cupom esgotado");
  }

  if (
    coupon.maxUsesPerCustomer != null &&
    ctx.customerUsageCount != null &&
    ctx.customerUsageCount >= coupon.maxUsesPerCustomer
  ) {
    throw new CouponEvalError("customer_limit", "Limite de uso atingido");
  }
}

/** Desconto sobre o subtotal dos itens (nunca deixa subtotal negativo). */
export function computeItemDiscount(
  type: CouponType,
  value: number,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0;
  if (type === "free_shipping") return 0;

  let discount = 0;
  if (type === "percentage") {
    discount = (subtotal * value) / 100;
  } else if (type === "fixed") {
    discount = value;
  }

  const rounded = Math.round(discount * 100) / 100;
  return Math.min(rounded, subtotal);
}

export function applyCouponToSubtotal(
  coupon: Coupon,
  ctx: EvaluateCouponContext,
): CouponApplication {
  evaluateCoupon(coupon, ctx);
  const discountAmount = computeItemDiscount(coupon.type, coupon.value, ctx.subtotal);

  return {
    code: coupon.code,
    type: coupon.type,
    discountAmount,
    description: coupon.description,
    grantsFreeShipping: coupon.type === "free_shipping",
  };
}

/** Zera a opção mais barata (índice 0) — mesmo espírito de applyFreeShipping. */
export function applyFreeShippingCoupon(
  options: ShippingQuoteOption[],
): { options: ShippingQuoteOption[]; applied: boolean } {
  return applyCheapestOptionFree(options);
}
