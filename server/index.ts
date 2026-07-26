import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createApiApp } from "./app";
import { getProductBySlug, listRelatedProducts } from "./services/products";
import { absoluteUrl, stripHtml, truncateMeta } from "@shared/lib/seo";
import { SITE_KEYWORDS, SITE_NAME } from "@shared/const/site";
import {
  injectSeoIntoHtml,
  isSocialCrawler,
  loadSpaHtml,
  resolvePublicBaseUrl,
} from "./lib/seoHtml";
import { renderProductSeoBody } from "./lib/renderProductSeoBody";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  const apiApp = createApiApp();
  app.use(apiApp);

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("/categoria/:slug", (req, res, next) => {
    const slug = String(req.params.slug ?? "").trim().toLowerCase();
    if (slug === "bolsas") {
      next();
      return;
    }

    const indexPath = path.join(staticPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      next();
      return;
    }

    const proto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
    const host =
      (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim() ||
      req.headers.host;
    const baseUrl = resolvePublicBaseUrl(host, proto);
    const spaHtml = fs.readFileSync(indexPath, "utf8");

    res
      .status(404)
      .type("html")
      .send(
        injectSeoIntoHtml(spaHtml, {
          title: `Categoria não encontrada — ${SITE_NAME}`,
          description: "Esta categoria não está disponível na Nativa Store.",
          url: absoluteUrl(baseUrl, `/categoria/${encodeURIComponent(slug)}`),
          image: absoluteUrl(baseUrl, "/images/bannerNativa.jpg"),
          type: "website",
          noIndex: true,
        }),
      );
  });

  app.get("/produto/:slug", async (req, res, next) => {
    try {
      const indexPath = path.join(staticPath, "index.html");
      const spaHtml =
        loadSpaHtml() ?? (fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : null);

      if (!spaHtml) {
        next();
        return;
      }

      const slug = String(req.params.slug ?? "").trim();
      const proto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
      const host =
        (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim() ||
        req.headers.host;
      const baseUrl = resolvePublicBaseUrl(host, proto);
      const product = slug ? await getProductBySlug(slug) : null;

      if (!product) {
        res
          .status(404)
          .type("html")
          .send(
            injectSeoIntoHtml(spaHtml, {
              title: `Produto não encontrado — ${SITE_NAME}`,
              description: "Este produto não está disponível na Nativa Store.",
              url: absoluteUrl(baseUrl, `/produto/${encodeURIComponent(slug)}`),
              image: absoluteUrl(baseUrl, "/images/bannerNativa.jpg"),
              noIndex: true,
            }),
          );
        return;
      }

      const description = truncateMeta(
        stripHtml(product.shortDescription || product.description) || product.name,
      );
      const image = absoluteUrl(
        baseUrl,
        product.image || product.images[0] || "/images/bannerNativa.jpg",
      );
      const url = absoluteUrl(baseUrl, `/produto/${product.slug}`);
      const categoryUrl = absoluteUrl(
        baseUrl,
        product.category === "Bolsas" ? "/categoria/bolsas" : "/#colecoes",
      );

      const ua = req.headers["user-agent"];
      const crawler = isSocialCrawler(typeof ua === "string" ? ua : undefined);
      let bodyContent: string | undefined;
      if (crawler) {
        try {
          const related = await listRelatedProducts(product.category, product.id, 3);
          bodyContent = renderProductSeoBody({ product, relatedProducts: related });
        } catch (renderError) {
          console.warn(
            "[seo] falha ao renderizar body para bot (meta mantida):",
            renderError instanceof Error ? renderError.message : renderError,
          );
        }
      }

      res
        .status(200)
        .setHeader("Cache-Control", "public, s-maxage=30, must-revalidate")
        .setHeader("Vary", "User-Agent")
        .type("html")
        .send(
          injectSeoIntoHtml(spaHtml, {
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
            },
            jsonLd: {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Product",
                  "@id": `${url}#product`,
                  name: product.name,
                  description,
                  image: (product.images?.length ? product.images : [product.image])
                    .filter(Boolean)
                    .map((img) => absoluteUrl(baseUrl, img)),
                  sku: product.sku,
                  category: product.category,
                  brand: { "@type": "Brand", name: SITE_NAME },
                  offers: {
                    "@type": "Offer",
                    url,
                    priceCurrency: "BRL",
                    price: product.price,
                    availability: product.inStock
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                    itemCondition: "https://schema.org/NewCondition",
                    seller: { "@type": "Organization", name: SITE_NAME },
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Início",
                      item: absoluteUrl(baseUrl, "/"),
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: product.category || "Coleções",
                      item: categoryUrl,
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: product.name,
                      item: url,
                    },
                  ],
                },
              ],
            },
            bodyContent,
            preloadLcpImage: image,
          }),
        );
    } catch (error) {
      console.error("[seo] produto:", error);
      next();
    }
  });

  app.get("/sitemap.xml", async (req, res, next) => {
    try {
      // Reutiliza o handler da API montada em /api/seo
      res.redirect(301, "/api/seo/sitemap.xml");
    } catch {
      next();
    }
  });

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
