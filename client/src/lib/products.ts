import type { Product } from "@shared/types/product";

export { formatPrice } from "@shared/lib/formatPrice";

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");

  if (!response.ok) {
    throw new Error("Não foi possível carregar os produtos");
  }

  return response.json();
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const response = await fetch(`/api/products/${encodeURIComponent(slug)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar o produto");
  }

  return response.json();
}

/** Relacionados já filtrados no backend (mesma categoria, sem o produto atual). */
export async function fetchRelatedProducts(slug: string, limit = 3): Promise<Product[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const response = await fetch(
    `/api/products/${encodeURIComponent(slug)}/related?${params.toString()}`,
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar produtos relacionados");
  }

  return response.json();
}

/** @deprecated Preferir fetchRelatedProducts (filtro no backend). */
export function getRelatedProducts(
  allProducts: Product[],
  product: Product,
  limit = 3,
): Product[] {
  return allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
