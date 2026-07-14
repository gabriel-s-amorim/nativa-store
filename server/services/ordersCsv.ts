import {
  formatOrderShortId,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@shared/lib/orderLabels";
import { formatAddressLine } from "@shared/types/address";
import type { AdminOrderDetail } from "@shared/types/order";

function csvEscape(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatBrlNumber(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export function buildOrdersCsv(orders: AdminOrderDetail[]): string {
  const header = [
    "pedido_id",
    "pedido_curto",
    "status",
    "data",
    "cliente",
    "email",
    "telefone",
    "pagamento",
    "status_pagamento",
    "pago_em",
    "cupom",
    "desconto",
    "frete",
    "total",
    "itens",
    "endereco",
    "transportadora",
    "servico_frete",
  ];

  const lines = orders.map(order => {
    const itemsSummary = order.items
      .map(item => {
        const variant = [item.size, item.color].filter(Boolean).join("/");
        return `${item.quantity}x ${item.name}${variant ? ` (${variant})` : ""}`;
      })
      .join(" | ");

    return [
      order.id,
      formatOrderShortId(order.id),
      ORDER_STATUS_LABELS[order.status],
      new Date(order.createdAt).toISOString(),
      order.customerName ?? "",
      order.customerEmail ?? "",
      order.customerPhone ?? "",
      PAYMENT_METHOD_LABELS[order.paymentMethod],
      PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus,
      order.paidAt ?? "",
      order.couponCode ?? "",
      formatBrlNumber(order.discountAmount),
      formatBrlNumber(order.shippingAmount),
      formatBrlNumber(order.totalAmount),
      itemsSummary,
      formatAddressLine(order.shippingAddress),
      order.shippingCompany ?? "",
      order.shippingServiceName ?? "",
    ]
      .map(csvEscape)
      .join(",");
  });

  return `\uFEFF${[header.join(","), ...lines].join("\n")}`;
}
