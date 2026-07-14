import type { PaymentStatus } from "@shared/types/mercadoPago";
import { supabase } from "../lib/supabase";
import {
  getBrevoTransactionalConfig,
  sendBrevoTransactionalEmail,
} from "./brevo";

export type OrderEmailEvent =
  | "order_received"
  | "order_received_merchant"
  | "payment_approved"
  | "payment_failed"
  | "payment_refunded"
  | "order_processing"
  | "order_shipped"
  | "order_delivered";

function appUrl(): string {
  const raw =
    process.env.APP_URL?.trim() ||
    process.env.VITE_APP_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return (raw.startsWith("http") ? raw : `https://${raw}`).replace(/\/$/, "");
}

function money(value: unknown): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function paymentMethodLabel(value: string): string {
  if (value === "pix") return "Pix";
  if (value === "boleto") return "Boleto";
  if (value === "credit_card") return "Cartão de crédito";
  return value;
}

export function sampleOrderEmailParams() {
  const shortId = "TESTE001";
  return {
    ORDER_ID: "00000000-0000-0000-0000-000000000001",
    ORDER_SHORT_ID: shortId,
    CUSTOMER_NAME: "Cliente Teste",
    ORDER_URL: `${appUrl()}/conta`,
    TOTAL: money(189.9),
    SUBTOTAL: money(159.9),
    SHIPPING_AMOUNT: money(30),
    PAYMENT_METHOD: "Pix",
    PAYMENT_STATUS: "pending",
    ITEMS: [
      {
        name: "Produto de teste",
        quantity: 1,
        price: money(159.9),
        size: "M",
        color: "Natural",
      },
    ],
    SHIPPING_COMPANY: "Correios",
    DELIVERY_DAYS: "5",
    TRACKING_CODE: "",
    TRACKING_URL: "",
    ADDRESS: "Rua Exemplo, 100, Centro, São Paulo, SP, 01000-000",
  };
}

async function loadOrderEmailContext(orderId: string) {
  const [{ data: order, error: orderError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
      supabase
        .from("order_items")
        .select("name, quantity, price, size, color")
        .eq("order_id", orderId)
        .order("id", { ascending: true }),
    ]);
  if (orderError || itemsError || !order) return null;

  const recipient = (order.shipping_recipient ?? {}) as {
    name?: string;
    email?: string;
  };
  let email = recipient.email?.trim().toLowerCase() ?? "";
  let customerName = recipient.name?.trim() ?? "";
  if ((!email || !customerName) && order.customer_id) {
    const [{ data: profile }, authResult] = await Promise.all([
      supabase
        .from("customer_profiles")
        .select("full_name")
        .eq("id", order.customer_id)
        .maybeSingle(),
      supabase.auth.admin.getUserById(order.customer_id),
    ]);
    email ||= authResult.data.user?.email?.toLowerCase() ?? "";
    customerName ||= profile?.full_name ?? "";
  }

  const address = (order.shipping_address ?? {}) as Record<string, string>;
  const itemParams = (items ?? []).map(item => ({
    name: item.name,
    quantity: Number(item.quantity),
    price: money(item.price),
    size: item.size,
    color: item.color,
  }));
  const shortId = String(order.id).slice(0, 8).toUpperCase();
  const params = {
    ORDER_ID: order.id,
    ORDER_SHORT_ID: shortId,
    CUSTOMER_NAME: customerName || "Cliente Nativa",
    ORDER_URL: `${appUrl()}/conta`,
    TOTAL: money(order.total_amount),
    SUBTOTAL: money(Number(order.total_amount) - Number(order.shipping_amount)),
    SHIPPING_AMOUNT: money(order.shipping_amount),
    PAYMENT_METHOD: paymentMethodLabel(order.payment_method),
    PAYMENT_STATUS: order.payment_status,
    ITEMS: itemParams,
    SHIPPING_COMPANY: order.shipping_company ?? "",
    DELIVERY_DAYS: order.shipping_delivery_days ?? "",
    TRACKING_CODE: order.tracking_code ?? "",
    TRACKING_URL: order.tracking_url ?? "",
    ADDRESS: [
      address.rua,
      address.numero,
      address.complemento,
      address.bairro,
      address.cidade,
      address.estado,
      address.cep,
    ]
      .filter(Boolean)
      .join(", "),
  };

  return { order, email, customerName, params };
}

export async function dispatchOrderEmail(
  orderId: string,
  event: OrderEmailEvent
): Promise<"sent" | "duplicate" | "skipped" | "failed"> {
  let config: Awaited<ReturnType<typeof getBrevoTransactionalConfig>>;
  try {
    config = await getBrevoTransactionalConfig();
  } catch {
    return "skipped";
  }

  const templateId = config.templates[event];
  if (!templateId) return "skipped";

  const context = await loadOrderEmailContext(orderId);
  if (!context) return "failed";

  const isMerchant = event === "order_received_merchant";
  const email = isMerchant
    ? config.merchantNotifyEmail.trim().toLowerCase()
    : context.email;
  const recipientName = isMerchant
    ? "Loja Nativa"
    : context.customerName || undefined;
  if (!email) return "skipped";

  const idempotencyKey = `${orderId}:${event}`;
  const { data: insertedDelivery, error: deliveryError } = await supabase
    .from("brevo_email_deliveries")
    .upsert(
      {
        order_id: orderId,
        event,
        idempotency_key: idempotencyKey,
        kind: "transactional",
        recipient_email: email,
        template_id: templateId,
        status: "queued",
        metadata: { orderId, event },
      },
      { onConflict: "idempotency_key", ignoreDuplicates: true }
    )
    .select("id, attempt_count")
    .maybeSingle();
  if (deliveryError) return "failed";
  let delivery = insertedDelivery;
  if (!delivery) {
    const { data: failedDelivery } = await supabase
      .from("brevo_email_deliveries")
      .select("id, attempt_count")
      .eq("idempotency_key", idempotencyKey)
      .eq("status", "failed")
      .lt("attempt_count", 3)
      .maybeSingle();
    if (!failedDelivery) return "duplicate";
    const { data: claimed } = await supabase
      .from("brevo_email_deliveries")
      .update({
        status: "sending",
        error_message: null,
        attempt_count: Number(failedDelivery.attempt_count) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", failedDelivery.id)
      .eq("status", "failed")
      .select("id, attempt_count")
      .maybeSingle();
    if (!claimed) return "duplicate";
    delivery = claimed;
  } else {
    await supabase
      .from("brevo_email_deliveries")
      .update({
        status: "sending",
        attempt_count: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", delivery.id);
  }

  try {
    const result = await sendBrevoTransactionalEmail(
      {
        to: [{ email, name: recipientName }],
        replyTo: config.replyTo ? { email: config.replyTo } : undefined,
        templateId,
        params: context.params,
        tags: ["order", event],
      },
      "transactional",
      { record: false }
    );
    await supabase
      .from("brevo_email_deliveries")
      .update({
        message_id: result.messageId ?? null,
        status: "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", delivery.id);
    return "sent";
  } catch (error) {
    await supabase
      .from("brevo_email_deliveries")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        error_message:
          error instanceof Error ? error.message.slice(0, 2000) : "Erro desconhecido",
        updated_at: new Date().toISOString(),
      })
      .eq("id", delivery.id);
    return "failed";
  }
}

export async function dispatchOrderCreatedEmails(orderId: string) {
  const customer = await dispatchOrderEmail(orderId, "order_received");
  const merchant = await dispatchOrderEmail(orderId, "order_received_merchant");
  return { customer, merchant };
}

export function dispatchPaymentStatusEmail(
  orderId: string,
  status: PaymentStatus
) {
  if (status === "approved") {
    return dispatchOrderEmail(orderId, "payment_approved");
  }
  if (status === "refunded") {
    return dispatchOrderEmail(orderId, "payment_refunded");
  }
  if (["rejected", "canceled", "expired"].includes(status)) {
    return dispatchOrderEmail(orderId, "payment_failed");
  }
  return Promise.resolve<"skipped">("skipped");
}

export async function retryOrderEmail(
  orderId: string,
  deliveryId: string
): Promise<"sent" | "duplicate" | "skipped" | "failed"> {
  const { data, error } = await supabase
    .from("brevo_email_deliveries")
    .select("event")
    .eq("id", deliveryId)
    .eq("order_id", orderId)
    .eq("status", "failed")
    .maybeSingle();
  if (error || !data?.event) return "failed";
  return dispatchOrderEmail(orderId, data.event as OrderEmailEvent);
}

export async function sendOrderTemplateTest(input: {
  event: "order_received" | "order_received_merchant" | "payment_approved";
  email: string;
}) {
  const config = await getBrevoTransactionalConfig();
  const templateId = config.templates[input.event];
  if (!templateId) {
    throw new Error("Template não configurado para este evento");
  }
  const email = input.email.trim().toLowerCase();
  const params = {
    ...sampleOrderEmailParams(),
    ...(input.event === "payment_approved"
      ? { PAYMENT_STATUS: "approved" }
      : {}),
  };
  return sendBrevoTransactionalEmail(
    {
      to: [
        {
          email,
          name:
            input.event === "order_received_merchant"
              ? "Loja Nativa"
              : "Cliente Teste",
        },
      ],
      replyTo: config.replyTo ? { email: config.replyTo } : undefined,
      templateId,
      params,
      tags: ["order", "test", input.event],
    },
    "test"
  );
}
