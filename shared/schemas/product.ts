import { z } from "zod";

export const productCategorySchema = z.enum(["Roupas", "Bolsas", "Acessórios"]);

export const productColorSchema = z.object({
  name: z.string().min(1, "Informe o nome da cor"),
  hex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor inválida (use o formato #RRGGBB)"),
});

export const productSizeSchema = z.object({
  label: z.string().min(1, "Informe o tamanho"),
  available: z.boolean(),
});

export const productFaqSchema = z.object({
  question: z.string().min(1, "Informe a pergunta"),
  answer: z.string().min(1, "Informe a resposta"),
});

export const productArtisanSchema = z.object({
  name: z.string(),
  region: z.string(),
  story: z.string(),
});

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function finiteOrNull(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n === 0) return null;
  return n;
}

function finiteOrZero(value: unknown): number {
  if (value === "" || value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Dimensão/peso: aceita undefined/null/NaN/0 e normaliza para null. */
const optionalMeasure = (max: number, label: string) =>
  z
    .any()
    .transform((value) => finiteOrNull(value))
    .pipe(
      z
        .number({ error: `Informe um valor de ${label} válido` })
        .positive(`Informe um valor de ${label} maior que zero`)
        .max(max, `${label} acima do permitido`)
        .nullable(),
    );

export const productSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(SLUG_PATTERN, "Use apenas letras minúsculas, números e hífens (ex: bolsa-de-praia)"),
  name: z.string().min(2, "Informe o nome do produto"),
  category: productCategorySchema,
  price: z
    .any()
    .transform((value) => finiteOrZero(value))
    .pipe(
      z
        .number({ error: "Informe um preço válido" })
        .nonnegative("O preço não pode ser negativo"),
    ),
  originalPrice: z
    .any()
    .transform((value) => finiteOrNull(value))
    .pipe(
      z
        .number({ error: "Informe um preço original válido" })
        .nonnegative("O preço original não pode ser negativo")
        .nullable(),
    ),
  image: z.string().min(1, "Adicione ao menos uma imagem"),
  images: z.array(z.string().min(1)).min(1, "Adicione ao menos uma imagem"),
  badge: z.string(),
  badgeColor: z.string().min(1, "Informe a cor do selo"),
  rating: z
    .any()
    .transform((value) => {
      const n = finiteOrZero(value);
      return Math.min(5, Math.max(0, n));
    })
    .pipe(z.number({ error: "Informe uma avaliação válida" }).min(0).max(5)),
  reviews: z
    .any()
    .transform((value) => Math.max(0, Math.floor(finiteOrZero(value))))
    .pipe(z.number({ error: "Informe o número de avaliações" }).int().min(0)),
  featured: z.boolean(),
  shortDescription: z.string(),
  description: z.string(),
  materials: z.array(z.string()),
  careInstructions: z.array(z.string()),
  artisan: productArtisanSchema,
  sizes: z.array(productSizeSchema),
  colors: z.array(productColorSchema),
  sku: z.string(),
  inStock: z.boolean(),
  stockCount: z
    .any()
    .transform((value) => Math.max(0, Math.floor(finiteOrZero(value))))
    .pipe(z.number({ error: "Informe a quantidade em estoque" }).int().min(0)),
  widthCm: optionalMeasure(200, "largura"),
  heightCm: optionalMeasure(200, "altura"),
  lengthCm: optionalMeasure(200, "comprimento"),
  weightKg: optionalMeasure(100, "peso"),
  faq: z.array(productFaqSchema),
  highlights: z.array(z.string()),
  styleTags: z.array(z.string()),
  regionId: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value == null) return null;
      const trimmed = String(value).trim();
      return trimmed.length > 0 ? trimmed : null;
    }),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productDefaults: ProductInput = {
  slug: "",
  name: "",
  category: "Bolsas",
  price: 0,
  originalPrice: null,
  image: "",
  images: [],
  badge: "",
  badgeColor: "#C4522A",
  rating: 0,
  reviews: 0,
  featured: false,
  shortDescription: "",
  description: "",
  materials: [],
  careInstructions: [],
  artisan: { name: "", region: "", story: "" },
  sizes: [{ label: "Único", available: true }],
  colors: [],
  sku: "",
  inStock: true,
  stockCount: 0,
  widthCm: null,
  heightCm: null,
  lengthCm: null,
  weightKg: null,
  faq: [],
  highlights: [],
  styleTags: [],
  regionId: null,
};

/** Labels amigáveis para mensagens de erro do formulário/API. */
export const productFieldLabels: Record<string, string> = {
  slug: "Slug",
  name: "Nome",
  category: "Categoria",
  price: "Preço de venda",
  originalPrice: "Preço original",
  image: "Imagem de capa",
  images: "Imagens",
  badge: "Selo",
  badgeColor: "Cor do selo",
  stockCount: "Estoque",
  inStock: "Disponibilidade",
  widthCm: "Largura",
  heightCm: "Altura",
  lengthCm: "Comprimento",
  weightKg: "Peso",
  sizes: "Tamanhos",
  colors: "Cores",
  faq: "FAQ",
  artisan: "Artesão",
  regionId: "Região de origem",
  shortDescription: "Descrição curta",
  description: "Descrição",
  styleTags: "Tags de estilo",
  materials: "Materiais",
  careInstructions: "Cuidados",
  highlights: "Destaques",
  sku: "SKU",
};

export function formatProductIssues(
  issues: Array<{ path: PropertyKey[]; message: string }> | undefined | null,
): string | undefined {
  if (!issues?.length) return undefined;
  return issues
    .slice(0, 3)
    .map((issue) => {
      const root = String(issue.path[0] ?? "");
      const label = productFieldLabels[root] ?? (root || "Campo");
      const message = issue.message.startsWith("Invalid input")
        ? "valor inválido — verifique se o campo está preenchido corretamente"
        : issue.message;
      return `${label}: ${message}`;
    })
    .join(" · ");
}

/** Normaliza produto da API/estado parcial para o formato do formulário. */
export function normalizeProductFormValues(
  input: Partial<ProductInput> & Record<string, unknown>,
): ProductInput {
  const parsed = productSchema.safeParse({
    ...productDefaults,
    ...input,
    materials: Array.isArray(input.materials) ? input.materials : productDefaults.materials,
    careInstructions: Array.isArray(input.careInstructions)
      ? input.careInstructions
      : productDefaults.careInstructions,
    sizes: Array.isArray(input.sizes) ? input.sizes : productDefaults.sizes,
    colors: Array.isArray(input.colors) ? input.colors : productDefaults.colors,
    faq: Array.isArray(input.faq) ? input.faq : productDefaults.faq,
    highlights: Array.isArray(input.highlights) ? input.highlights : productDefaults.highlights,
    styleTags: Array.isArray(input.styleTags) ? input.styleTags : productDefaults.styleTags,
    artisan: {
      ...productDefaults.artisan,
      ...(typeof input.artisan === "object" && input.artisan ? input.artisan : {}),
    },
    widthCm: input.widthCm ?? null,
    heightCm: input.heightCm ?? null,
    lengthCm: input.lengthCm ?? null,
    weightKg: input.weightKg ?? null,
    originalPrice: input.originalPrice ?? null,
    regionId: input.regionId ?? null,
    stockCount: input.stockCount ?? 0,
    rating: input.rating ?? productDefaults.rating,
    reviews: input.reviews ?? productDefaults.reviews,
    featured: typeof input.featured === "boolean" ? input.featured : productDefaults.featured,
    inStock: typeof input.inStock === "boolean" ? input.inStock : productDefaults.inStock,
  });

  if (parsed.success) return parsed.data;

  return {
    ...productDefaults,
    ...Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)),
    name: typeof input.name === "string" ? input.name : productDefaults.name,
    slug: typeof input.slug === "string" ? input.slug : productDefaults.slug,
    category: (input.category as ProductInput["category"]) ?? productDefaults.category,
    price: finiteOrZero(input.price),
    originalPrice: finiteOrNull(input.originalPrice),
    stockCount: Math.max(0, Math.floor(finiteOrZero(input.stockCount))),
    rating: Math.min(5, Math.max(0, finiteOrZero(input.rating))),
    reviews: Math.max(0, Math.floor(finiteOrZero(input.reviews))),
    widthCm: finiteOrNull(input.widthCm),
    heightCm: finiteOrNull(input.heightCm),
    lengthCm: finiteOrNull(input.lengthCm),
    weightKg: finiteOrNull(input.weightKg),
    images: Array.isArray(input.images) ? input.images : [],
    image: typeof input.image === "string" ? input.image : "",
    materials: Array.isArray(input.materials) ? input.materials : [],
    careInstructions: Array.isArray(input.careInstructions) ? input.careInstructions : [],
    sizes: Array.isArray(input.sizes) ? input.sizes : productDefaults.sizes,
    colors: Array.isArray(input.colors) ? input.colors : [],
    faq: Array.isArray(input.faq) ? input.faq : [],
    highlights: Array.isArray(input.highlights) ? input.highlights : [],
    styleTags: Array.isArray(input.styleTags) ? input.styleTags : [],
    regionId: input.regionId ? String(input.regionId) : null,
    artisan: {
      name: "",
      region: "",
      story: "",
      ...(typeof input.artisan === "object" && input.artisan ? input.artisan : {}),
    },
  };
}
