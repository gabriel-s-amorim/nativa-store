import { buildGalleryUrls } from "@shared/lib/tiendanubeImages";
import { supabase } from "../lib/supabase";

async function fetchProductImages(slug: string): Promise<string[]> {
  const bases = [
    process.env.NUVEMSHOP_STORE_URL?.replace(/\/+$/, "") ?? "https://www.nativa.art.br",
    "https://www.nativa.art.br",
    "https://quintiluz.lojavirtualnuvem.com.br",
  ];

  for (const base of Array.from(new Set(bases))) {
    try {
      const response = await fetch(`${base}/produtos/${slug}/`, {
        headers: { "User-Agent": "NativaStoreMigration/1.0" },
      });
      if (!response.ok) continue;

      const gallery = buildGalleryUrls(await response.text());
      if (gallery.length > 0) return gallery;
    } catch {
      continue;
    }
  }

  return [];
}

async function fixImages() {
  const { data: products, error } = await supabase.from("products").select("slug, name");

  if (error || !products) {
    throw new Error(error?.message ?? "Não foi possível listar produtos");
  }

  for (const product of products) {
    const images = await fetchProductImages(product.slug);

    if (images.length === 0) {
      console.log(`⚠ ${product.name}: nenhuma imagem encontrada`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ image: images[0], images })
      .eq("slug", product.slug);

    if (updateError) {
      console.log(`✗ ${product.name}: ${updateError.message}`);
      continue;
    }

    console.log(`✓ ${product.name}: ${images.length} imagem(ns)`);
  }
}

fixImages().catch((error) => {
  console.error("Erro:", error instanceof Error ? error.message : error);
  process.exit(1);
});
