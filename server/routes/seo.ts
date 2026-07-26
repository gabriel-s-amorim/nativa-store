import { Router, type Request, type Response } from "express";
import { absoluteUrl, stripHtml, truncateMeta } from "@shared/lib/seo";
import { SITE_KEYWORDS, SITE_NAME, SITE_OG_IMAGE_PATH } from "@shared/const/site";
import { getProductBySlug, listProducts, listRelatedProducts } from "../services/products";
import {
  buildStandaloneOgHtml,
  injectSeoIntoHtml,
  isSocialCrawler,
  loadSpaHtmlAsync,
  resolvePublicBaseUrl,
  type InjectMetaOptions,
} from "../lib/seoHtml";
import { renderProductSeoBody } from "../lib/renderProductSeoBody";

const router = Router();
const BAGS_TITLE = "Bolsas Artesanais — Nativa Store";
const BAGS_DESCRIPTION =
  "Bolsas artesanais autorais e exclusivas, feitas à mão com identidade brasileira. Conheça a coleção da Nativa Store.";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function requestBaseUrl(req: Request): string {
  const proto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
  const host =
    (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim() ||
    req.headers.host;
  return resolvePublicBaseUrl(host, proto);
}

async function sendSeoHtml(req: Request, res: Response, options: InjectMetaOptions, status = 200) {
  const ua = req.headers["user-agent"];
  const crawler = isSocialCrawler(typeof ua === "string" ? ua : undefined);
  const spaHtml = await loadSpaHtmlAsync(requestBaseUrl(req));

  // Humanos nunca recebem bodyContent — só crawlers (dynamic rendering).
  const htmlOptions: InjectMetaOptions = crawler
    ? options
    : { ...options, bodyContent: undefined };

  // Sempre preferir o SPA com OG no <head> (WhatsApp/Facebook leem só as meta tags).
  // HTML mínimo era cacheado no CDN sem Vary e quebrava a loja no navegador.
  if (!spaHtml) {
    res
      .status(status)
      .setHeader("Cache-Control", "private, no-store")
      .setHeader("Vary", "User-Agent")
      .type("html")
      .send(
        crawler
          ? buildStandaloneOgHtml(htmlOptions)
          : buildStandaloneOgHtml(htmlOptions).replace(
              "</body>",
              `<p><a href="/">Abrir a Nativa Store</a></p>
    <script>
      // Evita ficar na página de fallback: vai à home (SPA) e o usuário navega de novo.
      setTimeout(function () { location.replace("/"); }, 100);
    </script>
  </body>`,
            ),
      );
    return;
  }

  res
    .status(status)
    .setHeader("Cache-Control", "public, s-maxage=30, must-revalidate")
    .setHeader("Vary", "User-Agent")
    .type("html")
    .send(injectSeoIntoHtml(spaHtml, htmlOptions));
}

router.get("/categoria/:slug", async (req, res) => {
  const slug = String(req.params.slug ?? "").trim().toLowerCase();
  const baseUrl = requestBaseUrl(req);
  const url = absoluteUrl(baseUrl, `/categoria/${encodeURIComponent(slug)}`);

  if (slug !== "bolsas") {
    await sendSeoHtml(
      req,
      res,
      {
        title: `Categoria não encontrada — ${SITE_NAME}`,
        description: "Esta categoria não está disponível na Nativa Store.",
        url,
        image: absoluteUrl(baseUrl, SITE_OG_IMAGE_PATH),
        type: "website",
        noIndex: true,
      },
      404,
    );
    return;
  }

  await sendSeoHtml(req, res, {
    title: BAGS_TITLE,
    description: BAGS_DESCRIPTION,
    url,
    image: absoluteUrl(baseUrl, SITE_OG_IMAGE_PATH),
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: BAGS_TITLE,
      description: BAGS_DESCRIPTION,
      url,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: absoluteUrl(baseUrl, "/"),
      },
    },
  });
});

router.get("/produto/:slug", async (req, res) => {
  const slug = String(req.params.slug ?? "").trim();
  const baseUrl = requestBaseUrl(req);

  try {
    const product = slug ? await getProductBySlug(slug) : null;

    if (!product) {
      await sendSeoHtml(
        req,
        res,
        {
          title: `Produto não encontrado — ${SITE_NAME}`,
          description: "Este produto não está disponível na Nativa Store.",
          url: absoluteUrl(baseUrl, `/produto/${encodeURIComponent(slug)}`),
          image: absoluteUrl(baseUrl, "/images/bannerNativa.jpg"),
          type: "website",
          noIndex: true,
        },
        404,
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
    const title = `${product.name} — ${SITE_NAME}`;

    const categoryUrl = absoluteUrl(
      baseUrl,
      product.category === "Bolsas" ? "/categoria/bolsas" : "/#colecoes",
    );
    const jsonLd = {
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
    };

    const ua = req.headers["user-agent"];
    const crawler = isSocialCrawler(typeof ua === "string" ? ua : undefined);
    let bodyContent: string | undefined;
    if (crawler) {
      try {
        const related = await listRelatedProducts(product.category, product.id, 3);
        bodyContent = renderProductSeoBody({
          product,
          relatedProducts: related,
        });
      } catch (renderError) {
        console.warn(
          "[seo] falha ao renderizar body para bot (meta mantida):",
          renderError instanceof Error ? renderError.message : renderError,
        );
      }
    }

    await sendSeoHtml(req, res, {
      title,
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
      jsonLd,
      bodyContent,
      // Humano + bot: descoberta precoce da hero (sem srcset na galeria hoje)
      preloadLcpImage: image,
    });
  } catch (error) {
    console.error("[seo] falha ao montar meta do produto:", error);
    // Em erro, tenta o SPA sem meta específica em vez de HTML mínimo (quebra a loja).
    const spaHtml = await loadSpaHtmlAsync(baseUrl);
    if (spaHtml) {
      res.status(200).type("html").setHeader("Cache-Control", "no-store").send(spaHtml);
      return;
    }
    res
      .status(200)
      .type("html")
      .setHeader("Cache-Control", "private, no-store")
      .send(
        buildStandaloneOgHtml({
          title: SITE_NAME,
          description: "Bolsas artesanais brasileiras feitas à mão.",
          url: absoluteUrl(baseUrl, `/produto/${encodeURIComponent(slug)}`),
          image: absoluteUrl(baseUrl, "/images/bannerNativa.jpg"),
        }),
      );
  }
});

router.get("/sitemap.xml", async (req, res) => {
  const baseUrl = requestBaseUrl(req).replace(/\/$/, "");

  try {
    const products = await listProducts();
    const urls = [
      { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
      ...(products.some((product) => product.category === "Bolsas")
        ? [{ loc: `${baseUrl}/categoria/bolsas`, priority: "0.9", changefreq: "weekly" }]
        : []),
      ...products.map((product) => ({
        loc: `${baseUrl}/produto/${product.slug}`,
        priority: "0.8",
        changefreq: "weekly",
      })),
    ];

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

    res
      .status(200)
      .type("application/xml")
      .setHeader("Cache-Control", "public, s-maxage=300, must-revalidate")
      .send(body);
  } catch (error) {
    console.error("[seo] sitemap:", error);
    res.status(500).type("text/plain").send("Erro ao gerar sitemap");
  }
});

export default router;
