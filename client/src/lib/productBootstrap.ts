import type { Product } from "@shared/types/product";

export const PRODUCT_BOOTSTRAP_SCRIPT_ID = "__PRODUCT_DATA__";

/**
 * Lê o produto injetado no HTML pela rota SEO (SSR-lite).
 * Só vale no cold load da PDP — em navegação client-side o slug tem de bater.
 */
export function readProductBootstrap(slug: string): Product | null {
  if (typeof document === "undefined" || !slug) return null;

  const el = document.getElementById(PRODUCT_BOOTSTRAP_SCRIPT_ID);
  const raw = el?.textContent?.trim();
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as Product;
    if (!data || typeof data !== "object" || data.slug !== slug) return null;
    return data;
  } catch {
    return null;
  }
}
