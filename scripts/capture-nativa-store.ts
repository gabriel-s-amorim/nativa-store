import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";

const ROOT = process.cwd();
const CAPTURE_SET = process.env.NATIVA_CAPTURE_SET === "post-seo" ? "post-seo" : "pre-seo";
const CAPTURE_SCOPE = process.env.NATIVA_CAPTURE_SCOPE || "all";
const BASE_URL = (process.env.NATIVA_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const OUT_DIR = path.join(ROOT, "docs", "screenshots", CAPTURE_SET);
const VIEWPORT = { width: 1440, height: 900 };

async function settle(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1_200);
  await page.evaluate(() => document.fonts.ready);
}

async function screenshot(page: Page, name: string) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    fullPage: false,
    animations: "disabled",
  });
}

async function openHome(page: Page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.getByRole("heading", { name: "Explore nossa loja" }).waitFor({ state: "attached" });
  await page
    .locator('[aria-label="Banners da loja"] img:visible')
    .first()
    .waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const image = document.querySelector<HTMLImageElement>(
      '[aria-label="Banners da loja"] img:not(.sm\\:hidden)',
    );
    return Boolean(image?.complete && image.naturalWidth > 0);
  });
}

async function captureHome(page: Page) {
  await openHome(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, "home");
}

async function captureCategory(page: Page) {
  if (CAPTURE_SET === "post-seo") {
    await page.goto(`${BASE_URL}/categoria/bolsas`, { waitUntil: "domcontentloaded" });
    await settle(page);
  } else {
    await openHome(page);
    await page.locator("#colecoes").getByRole("button", { name: "Bolsas", exact: true }).click();
  }

  await page.locator("#colecoes").evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await page.waitForTimeout(500);
  await screenshot(page, "categoria-bolsas");
}

async function captureProduct(page: Page) {
  await openHome(page);
  const slug = await page.evaluate(async () => {
    const response = await fetch("/api/products");
    if (!response.ok) return null;
    const products = (await response.json()) as Array<{ slug?: string }>;
    return products[0]?.slug ?? null;
  });
  if (!slug) throw new Error("Nenhum produto público foi encontrado para a captura.");

  await page.goto(`${BASE_URL}/produto/${encodeURIComponent(slug)}`, { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible", timeout: 20_000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, "produto");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => console.error("[browser]", error.message));
  page.on("console", (message) => {
    if (message.type() === "error") console.error("[browser console]", message.text());
  });

  try {
    if (CAPTURE_SCOPE === "all" || CAPTURE_SCOPE === "home") await captureHome(page);
    if (CAPTURE_SCOPE === "all" || CAPTURE_SCOPE === "category") await captureCategory(page);
    if (CAPTURE_SCOPE === "all" || CAPTURE_SCOPE === "product") await captureProduct(page);
    await writeFile(
      path.join(OUT_DIR, "capture.json"),
      JSON.stringify({ baseUrl: BASE_URL, captureSet: CAPTURE_SET, viewport: VIEWPORT }, null, 2),
      "utf8",
    );
  } finally {
    await context.close();
    await browser.close();
  }

  console.log(`Capturas ${CAPTURE_SET} salvas em ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
