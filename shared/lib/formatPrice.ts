/** Formata preço em BRL (pt-BR) — utilizável no client e no server. */
export function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
