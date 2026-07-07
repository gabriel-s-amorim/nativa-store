import { mapProductRowToProduct, type ProductRow } from "@shared/lib/productMapper";
import type { Product } from "@shared/types/product";
import { supabase } from "../lib/supabase";

export async function listProducts(category?: string): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("id", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProductRow[]).map(mapProductRowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapProductRowToProduct(data as ProductRow);
}
