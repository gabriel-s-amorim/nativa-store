import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SITE_NAME, SITE_OG_IMAGE_PATH } from "../shared/const/site";
import { absoluteUrl, normalizeBaseUrl } from "../shared/lib/seo";
import { injectSeoIntoHtml } from "../server/lib/seoHtml";

const BAGS_TITLE = "Bolsas Artesanais — Nativa Store";
const BAGS_DESCRIPTION =
  "Bolsas artesanais autorais e exclusivas, feitas à mão com identidade brasileira. Conheça a coleção da Nativa Store.";

async function main() {
  const root = process.cwd();
  const baseUrl = normalizeBaseUrl(
    process.env.APP_URL ||
      process.env.VITE_APP_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      "https://nativa-store.vercel.app",
  );
  const sourcePath = path.join(root, "dist", "public", "index.html");
  const outputDir = path.join(root, "dist", "public", "categoria", "bolsas");
  const categoryUrl = absoluteUrl(baseUrl, "/categoria/bolsas");
  const sourceHtml = await readFile(sourcePath, "utf8");

  const html = injectSeoIntoHtml(sourceHtml, {
    title: BAGS_TITLE,
    description: BAGS_DESCRIPTION,
    url: categoryUrl,
    image: absoluteUrl(baseUrl, SITE_OG_IMAGE_PATH),
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: BAGS_TITLE,
      description: BAGS_DESCRIPTION,
      url: categoryUrl,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: absoluteUrl(baseUrl, "/"),
      },
    },
  });

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), html, "utf8");
  console.log(`generate-seo-pages: ${path.join(outputDir, "index.html")}`);
}

main().catch((error) => {
  console.error("generate-seo-pages:", error);
  process.exitCode = 1;
});
