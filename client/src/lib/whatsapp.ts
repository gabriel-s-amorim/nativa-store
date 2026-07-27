import { appPath } from "@/lib/appUrl";
import { formatPrice } from "@/lib/products";
import { DEFAULT_STORE_SETTINGS } from "@shared/types/storeSettings";

/** Número com DDI (ex.: 5511976984558). Preferir valor de /api/settings; env como override local. */
export const WHATSAPP_NUMBER =
  ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ??
    DEFAULT_STORE_SETTINGS.whatsappNumber).replace(/\D/g, "");

export const WHATSAPP_DISPLAY = DEFAULT_STORE_SETTINGS.whatsappDisplay;

export function buildWhatsAppUrl(message?: string, number?: string): string {
  const digits = (number ?? WHATSAPP_NUMBER).replace(/\D/g, "") || WHATSAPP_NUMBER;
  const base = `https://wa.me/${digits}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function defaultWhatsAppMessage(): string {
  return "Olá! Vim pela Nativa Store e gostaria de saber mais.";
}

export function productInterestWhatsAppMessage(product: {
  name: string;
  slug: string;
  price: number;
}): string {
  const url = appPath(`/produto/${product.slug}`);
  return [
    `Olá! Me interessei pelo produto *${product.name}* da Nativa Store.`,
    "",
    `Valor: ${formatPrice(product.price)}`,
    `Link: ${url}`,
    "",
    "Gostaria de mais informações.",
  ].join("\n");
}
