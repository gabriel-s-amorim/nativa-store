import { formatPrice } from "@/lib/products";
import { formatAddressLine, formatCepDisplay } from "@shared/types/address";
import { PAYMENT_METHOD_LABELS } from "@shared/lib/orderLabels";
import type { Order, PaymentMethod } from "@shared/types/order";
import {
  Barcode,
  Copy,
  CreditCard,
  ExternalLink,
  MapPin,
  QrCode,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

function PaymentIcon({ method }: { method: PaymentMethod }) {
  if (method === "pix") return <QrCode size={14} />;
  if (method === "credit_card") return <CreditCard size={14} />;
  return <Barcode size={14} />;
}

interface OrderDetailContentProps {
  order: Order;
  productLinkPrefix?: string;
  /** "admin" usa o tema slate do painel; "store" mantém a estética da loja. */
  variant?: "store" | "admin";
}

export default function OrderDetailContent({
  order,
  productLinkPrefix = "/produto",
  variant = "store",
}: OrderDetailContentProps) {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const isAdmin = variant === "admin";

  const panel = isAdmin
    ? "rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-hover)] p-4"
    : "rounded-xl bg-[#FAF7F2] p-4";
  const title = isAdmin
    ? "mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]"
    : "mb-2 flex items-center gap-2 text-sm font-semibold text-[#3D2B1F]";
  const body = isAdmin
    ? "text-sm leading-relaxed text-[var(--admin-text-secondary)]"
    : "text-sm leading-relaxed text-[#8B6F5E]";
  const muted = isAdmin
    ? "text-xs text-[var(--admin-text-muted)]"
    : "text-xs text-[#8B6F5E]";
  const iconAccent = isAdmin ? "text-[var(--admin-accent)]" : "text-[#C4522A]";
  const itemCard = isAdmin
    ? "flex gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 shadow-sm"
    : "flex gap-3 rounded-xl border border-[#E8D5C4]/80 bg-white p-3";
  const itemImg = isAdmin
    ? "h-16 w-14 shrink-0 rounded-xl border border-[var(--admin-border)] object-cover"
    : "h-16 w-14 shrink-0 rounded-lg border border-[#E8D5C4] object-cover";
  const itemName = isAdmin
    ? "block truncate font-semibold text-[var(--admin-text)] hover:text-[var(--admin-accent)]"
    : "block truncate font-semibold text-[#3D2B1F] hover:text-[#C4522A]";
  const itemMeta = isAdmin
    ? "text-xs text-[var(--admin-text-muted)]"
    : "text-xs text-[#8B6F5E]";
  const itemPrice = isAdmin
    ? "mt-1 text-sm font-semibold text-[var(--admin-accent)]"
    : "mt-1 text-sm font-semibold text-[#C4522A]";
  const totals = isAdmin
    ? "rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 text-sm shadow-sm"
    : "rounded-xl border border-[#E8D5C4] bg-[#FFFCF8] p-4 text-sm";
  const totalsMuted = isAdmin
    ? "text-[var(--admin-text-secondary)]"
    : "text-[#8B6F5E]";
  const totalsStrong = isAdmin
    ? "mt-3 flex justify-between border-t border-[var(--admin-border)] pt-3 font-semibold text-[var(--admin-text)]"
    : "mt-3 flex justify-between border-t border-[#E8D5C4] pt-3 font-semibold text-[#3D2B1F]";
  const instructions = order.paymentInstructions;

  async function copyPaymentCode(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Código de pagamento copiado");
    } catch {
      toast.error("Não foi possível copiar o código");
    }
  }

  return (
    <div className="space-y-5">
      {order.paymentStatus !== "approved" && instructions && (
        <div className={panel}>
          <div className={title}>
            <PaymentIcon method={order.paymentMethod} />
            Instruções para pagamento
          </div>
          {order.paymentMethod === "pix" && instructions.qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${instructions.qrCodeBase64}`}
              alt="QR Code Pix"
              className="mx-auto my-4 size-48 rounded-lg bg-white p-2"
            />
          )}
          {instructions.qrCode && (
            <button
              type="button"
              onClick={() => void copyPaymentCode(instructions.qrCode!)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-4 py-2 text-sm font-semibold text-white"
            >
              <Copy className="size-4" /> Copiar código Pix
            </button>
          )}
          {instructions.barcode && (
            <button
              type="button"
              onClick={() => void copyPaymentCode(instructions.barcode!)}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              <Copy className="size-4" /> Copiar linha digitável
            </button>
          )}
          {instructions.ticketUrl && (
            <a
              href={instructions.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-2 rounded-xl bg-[#C4522A] px-4 py-2 text-sm font-semibold text-white"
            >
              <ExternalLink className="size-4" /> Abrir instruções
            </a>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <div className={panel}>
          <div className={title}>
            <MapPin size={15} className={iconAccent} />
            Endereço de entrega
          </div>
          <p
            className={body}
            style={isAdmin ? undefined : { fontFamily: "'Nunito', sans-serif" }}
          >
            {formatAddressLine(order.shippingAddress)}
          </p>
          <p className={`mt-1 ${muted}`}>
            CEP {formatCepDisplay(order.shippingAddress.cep)}
          </p>
        </div>

        <div className={panel}>
          <div className={title}>
            <span className={iconAccent}>
              <PaymentIcon method={order.paymentMethod} />
            </span>
            Pagamento
          </div>
          <p
            className={body}
            style={isAdmin ? undefined : { fontFamily: "'Nunito', sans-serif" }}
          >
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </p>
          {order.couponCode && (
            <p
              className={`mt-2 text-xs font-semibold uppercase tracking-wide ${
                isAdmin ? "text-[var(--admin-accent)]" : "text-[#C4522A]"
              }`}
            >
              Cupom: {order.couponCode}
            </p>
          )}
        </div>
      </div>

      <div>
        <p
          className={
            isAdmin
              ? "mb-3 text-sm font-semibold text-[var(--admin-text)]"
              : "mb-3 text-sm font-semibold text-[#3D2B1F]"
          }
          style={isAdmin ? undefined : { fontFamily: "'Nunito', sans-serif" }}
        >
          Itens do pedido
        </p>
        <ul className="space-y-3">
          {order.items.map(item => (
            <li key={item.id} className={itemCard}>
              <img src={item.image} alt={item.name} className={itemImg} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`${productLinkPrefix}/${item.productSlug}`}
                  className={itemName}
                  style={
                    isAdmin
                      ? undefined
                      : { fontFamily: "'Playfair Display', serif" }
                  }
                >
                  {item.name}
                </Link>
                <p
                  className={itemMeta}
                  style={
                    isAdmin ? undefined : { fontFamily: "'Nunito', sans-serif" }
                  }
                >
                  {item.quantity}x · {item.size}
                  {item.color ? ` · ${item.color}` : ""}
                </p>
                <p className={itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={totals}
        style={isAdmin ? undefined : { fontFamily: "'Nunito', sans-serif" }}
      >
        <div className={`flex justify-between ${totalsMuted}`}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className={`mt-2 flex justify-between ${totalsMuted}`}>
            <span>
              Desconto{order.couponCode ? ` (${order.couponCode})` : ""}
            </span>
            <span>−{formatPrice(order.discountAmount)}</span>
          </div>
        )}
        <div className={`mt-2 flex justify-between ${totalsMuted}`}>
          <span className="flex items-center gap-1">
            <Truck size={14} />
            Frete
          </span>
          <span>
            {order.shippingAmount === 0
              ? "Grátis"
              : formatPrice(order.shippingAmount)}
          </span>
        </div>
        <div className={totalsStrong}>
          <span>
            {order.paymentStatus === "approved"
              ? "Total pago"
              : "Total do pedido"}
          </span>
          <span
            style={
              isAdmin ? undefined : { fontFamily: "'Playfair Display', serif" }
            }
          >
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
