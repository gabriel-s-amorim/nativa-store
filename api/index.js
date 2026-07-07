// server/app.ts
import express from "express";

// server/routes/products.ts
import { Router } from "express";

// shared/lib/productMapper.ts
function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
function asSizes(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item) => typeof item === "object" && item !== null && "label" in item && "available" in item && typeof item.label === "string" && typeof item.available === "boolean"
  );
}
function asColors(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item) => typeof item === "object" && item !== null && "name" in item && "hex" in item && typeof item.name === "string" && typeof item.hex === "string"
  );
}
function asFaq(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item) => typeof item === "object" && item !== null && "question" in item && "answer" in item && typeof item.question === "string" && typeof item.answer === "string"
  );
}
function asArtisan(value) {
  if (typeof value !== "object" || value === null) {
    return { name: "", region: "", story: "" };
  }
  const artisan = value;
  return {
    name: typeof artisan.name === "string" ? artisan.name : "",
    region: typeof artisan.region === "string" ? artisan.region : "",
    story: typeof artisan.story === "string" ? artisan.story : ""
  };
}
function mapProductRowToProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    image: row.image,
    images: asStringArray(row.images),
    badge: row.badge,
    badgeColor: row.badge_color,
    rating: Number(row.rating),
    reviews: row.reviews,
    featured: row.featured,
    shortDescription: row.short_description,
    description: row.description,
    materials: asStringArray(row.materials),
    careInstructions: asStringArray(row.care_instructions),
    artisan: asArtisan(row.artisan),
    sizes: asSizes(row.sizes),
    colors: asColors(row.colors),
    sku: row.sku,
    inStock: row.in_stock,
    stockCount: row.stock_count,
    faq: asFaq(row.faq),
    highlights: asStringArray(row.highlights)
  };
}

// server/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
var url = process.env.SUPABASE_URL?.trim();
var secretKey = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
if (!url || !secretKey) {
  throw new Error(
    "Configure SUPABASE_URL e SUPABASE_SECRET_KEY no arquivo .env"
  );
}
if (secretKey.includes("COLE_") || secretKey.includes("sua_chave") || !secretKey.startsWith("sb_secret_") && !secretKey.startsWith("eyJ")) {
  throw new Error(
    "SUPABASE_SECRET_KEY inv\xE1lida. Use a Secret key (sb_secret_...) ou service_role (eyJ...) do Supabase."
  );
}
var supabase = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// server/services/products.ts
async function listProducts(category) {
  let query = supabase.from("products").select("*").order("id", { ascending: true });
  if (category) {
    query = query.eq("category", category);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data.map(mapProductRowToProduct);
}
async function getProductBySlug(slug) {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return mapProductRowToProduct(data);
}

// server/routes/products.ts
var router = Router();
router.get("/", async (req, res) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : void 0;
    const products = await listProducts(category);
    res.json(products);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar produtos"
    });
  }
});
router.get("/:slug", async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) {
      res.status(404).json({ error: "Produto n\xE3o encontrado" });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar produto"
    });
  }
});
var products_default = router;

// server/app.ts
function createApiApp() {
  const app2 = express();
  app2.use(express.json());
  app2.use("/api/products", products_default);
  return app2;
}

// server/vercel.ts
var app = createApiApp();
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default
};
