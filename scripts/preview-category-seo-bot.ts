/**
 * Simula Googlebot em /categoria/bolsas e grava o HTML final em disco.
 *
 * Uso:
 *   pnpm preview:seo-bot:categoria
 *
 * Abra o ficheiro gerado e compare o texto com a grade humana (filtro Bolsas).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { absoluteUrl } from "../shared/lib/seo";
import { SITE_KEYWORDS, SITE_NAME, SITE_OG_IMAGE_PATH } from "../shared/const/site";
import type { Product } from "../shared/types/product";
import { listProducts } from "../server/services/products";
import {
  injectSeoIntoHtml,
  loadSpaHtmlAsync,
  resolvePublicBaseUrl,
} from "../server/lib/seoHtml";
import { renderCategorySeoBody } from "../server/lib/renderCategorySeoBody";

const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const BAGS_TITLE = "Bolsas Artesanais — Nativa Store";
const BAGS_DESCRIPTION =
  "Bolsas artesanais autorais e exclusivas, feitas à mão com identidade brasileira. Conheça a coleção da Nativa Store.";
const BAGS_SECTION_HEADING = "Nossa Coleção";
const BAGS_SECTION_DESCRIPTION =
  "Cada bolsa é única, feita à mão com amor e identidade brasileira";

function sortProductsForCategoryGrid(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });
}

async function main() {
  const baseUrl =
    resolvePublicBaseUrl(undefined, undefined) || "https://www.nativa.art.br";

  const spaHtml = await loadSpaHtmlAsync(baseUrl);
  if (!spaHtml) {
    throw new Error(
      "Não foi possível carregar o index.html do SPA. Rode `pnpm build` antes, ou garanta APP_URL acessível.",
    );
  }

  const products = sortProductsForCategoryGrid(await listProducts("Bolsas"));
  const url = absoluteUrl(baseUrl, "/categoria/bolsas");
  const bodyContent = renderCategorySeoBody({
    categoryName: "Bolsas Artesanais",
    categorySlug: "bolsas",
    heading: BAGS_SECTION_HEADING,
    description: BAGS_SECTION_DESCRIPTION,
    products,
  });

  const html = injectSeoIntoHtml(spaHtml, {
    title: BAGS_TITLE,
    description: BAGS_DESCRIPTION,
    url,
    image: absoluteUrl(baseUrl, SITE_OG_IMAGE_PATH),
    type: "website",
    keywords: `bolsas artesanais, ${SITE_KEYWORDS}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${url}#collection`,
          name: BAGS_TITLE,
          description: BAGS_DESCRIPTION,
          url,
          mainEntity: { "@id": `${url}#itemlist` },
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: absoluteUrl(baseUrl, "/"),
          },
        },
        {
          "@type": "ItemList",
          "@id": `${url}#itemlist`,
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => {
            const productUrl = absoluteUrl(baseUrl, `/produto/${product.slug}`);
            return {
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                "@id": `${productUrl}#product`,
                name: product.name,
                url: productUrl,
              },
            };
          }),
        },
      ],
    },
    bodyContent,
  });

  const outDir = path.join(process.cwd(), "tmp");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "seo-bot-categoria-bolsas.html");
  await writeFile(outPath, html, "utf8");

  const hasHeading = /<div id="root">[\s\S]*?<h1[^>]*>Nossa Coleção<\/h1>/i.test(html);
  const productLinks = (html.match(/href="\/produto\/[^"]+"/g) ?? []).length;
  const hasItemListId = html.includes("#itemlist");
  const sampleProductId = products[0]
    ? `${absoluteUrl(baseUrl, `/produto/${products[0].slug}`)}#product`
    : null;

  console.log(`User-Agent simulado: ${GOOGLEBOT_UA}`);
  console.log(`Produtos na listagem: ${products.length}`);
  console.log(`Body com H1: ${hasHeading ? "sim" : "NÃO — verificar"}`);
  console.log(`Links /produto/: ${productLinks}`);
  console.log(`JSON-LD ItemList: ${hasItemListId ? "sim" : "NÃO"}`);
  if (sampleProductId) {
    console.log(`Exemplo @id produto (paridade PDP): ${sampleProductId}`);
    console.log(
      `  presente no HTML: ${html.includes(`"@id":"${sampleProductId}"`) || html.includes(`"@id": "${sampleProductId}"`) ? "sim" : "verificar encoding"}`,
    );
  }
  console.log(`HTML gravado em: ${outPath}`);
  console.log("Abra o ficheiro no browser e compare com /categoria/bolsas (humano).");
}

main().catch((error) => {
  console.error("preview-category-seo-bot:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
