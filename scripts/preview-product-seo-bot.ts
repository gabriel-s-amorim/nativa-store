/**
 * Simula Googlebot numa PDP e grava o HTML final em disco para auditoria visual.
 *
 * Uso:
 *   pnpm preview:seo-bot
 *   pnpm preview:seo-bot -- shoulder-bag-mandala-bhbmh
 *
 * Abra o ficheiro gerado no browser e compare o texto com a PDP humana.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { absoluteUrl, stripHtml, truncateMeta } from "../shared/lib/seo";
import { SITE_KEYWORDS, SITE_NAME } from "../shared/const/site";
import { getProductBySlug, listProducts, listRelatedProducts } from "../server/services/products";
import {
  injectSeoIntoHtml,
  loadSpaHtmlAsync,
  resolvePublicBaseUrl,
} from "../server/lib/seoHtml";
import { renderProductSeoBody } from "../server/lib/renderProductSeoBody";

const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

async function main() {
  const slugArg = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
  const baseUrl = resolvePublicBaseUrl(
    undefined,
    undefined,
  ) || "https://www.nativa.art.br";

  let slug = slugArg?.trim();
  if (!slug) {
    const products = await listProducts();
    slug = products[0]?.slug;
  }
  if (!slug) {
    throw new Error("Nenhum produto encontrado. Passe um slug: pnpm preview:seo-bot -- meu-slug");
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    throw new Error(`Produto não encontrado: ${slug}`);
  }

  const spaHtml = await loadSpaHtmlAsync(baseUrl);
  if (!spaHtml) {
    throw new Error(
      "Não foi possível carregar o index.html do SPA. Rode `pnpm build` antes, ou garanta APP_URL acessível.",
    );
  }

  const related = await listRelatedProducts(product.category, product.id, 3);
  const bodyContent = renderProductSeoBody({ product, relatedProducts: related });

  const description = truncateMeta(
    stripHtml(product.shortDescription || product.description) || product.name,
  );
  const url = absoluteUrl(baseUrl, `/produto/${product.slug}`);
  const image = absoluteUrl(
    baseUrl,
    product.image || product.images[0] || "/images/bannerNativa.jpg",
  );
  const categoryUrl = absoluteUrl(
    baseUrl,
    product.category === "Bolsas" ? "/categoria/bolsas" : "/#colecoes",
  );

  const html = injectSeoIntoHtml(spaHtml, {
    title: `${product.name} — ${SITE_NAME}`,
    description,
    url,
    image,
    type: "website",
    keywords: `${product.name}, ${product.category}, ${SITE_KEYWORDS}`,
    product: {
      price: product.price,
      currency: "BRL",
      availability: product.inStock ? "in stock" : "out of stock",
      brand: SITE_NAME,
    },
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          name: product.name,
          description,
          image,
          sku: product.sku,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl(baseUrl, "/") },
            {
              "@type": "ListItem",
              position: 2,
              name: product.category || "Coleções",
              item: categoryUrl,
            },
            { "@type": "ListItem", position: 3, name: product.name, item: url },
          ],
        },
      ],
    },
    bodyContent,
    preloadLcpImage: image,
  });

  const outDir = path.join(process.cwd(), "tmp");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `seo-bot-${product.slug}.html`);
  await writeFile(outPath, html, "utf8");

  const hasRootContent = /<div id="root">[\s\S]*?<h1[\s\S]*?<\/h1>/i.test(html);
  console.log(`User-Agent simulado: ${GOOGLEBOT_UA}`);
  console.log(`Slug: ${product.slug}`);
  console.log(`Body populado: ${hasRootContent ? "sim" : "NÃO — verificar"}`);
  console.log(`HTML gravado em: ${outPath}`);
  console.log("Abra o ficheiro no browser e compare o texto com a PDP humana.");
}

main().catch((error) => {
  console.error("preview-product-seo-bot:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
