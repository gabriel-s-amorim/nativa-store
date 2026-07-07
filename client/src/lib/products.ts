import type { Product } from "@shared/types/product";

export function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

export function getRelatedProducts(
  allProducts: Product[],
  product: Product,
  limit = 3,
): Product[] {
  return allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
