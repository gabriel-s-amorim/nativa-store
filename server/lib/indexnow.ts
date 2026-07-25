/**
 * IndexNow — notifica Bing, Yandex e Naver sobre URLs novas/alteradas/removidas.
 * Não cobre o Google (que não participa do protocolo IndexNow para e-commerce).
 * @see https://www.indexnow.org/documentation
 */

import { SITE_ORIGIN } from "@shared/const/site";
import { absoluteUrl, normalizeBaseUrl } from "@shared/lib/seo";

/** Chave pública de verificação (também em client/public/{key}.txt). */
export const INDEXNOW_KEY = "ce40a867a6ebe270144cefc89de5b40c";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

function resolveIndexNowOrigin(): string {
  const fromEnv = process.env.APP_URL || process.env.VITE_APP_URL;
  const origin = normalizeBaseUrl(fromEnv || SITE_ORIGIN);
  try {
    const url = new URL(origin);
    // Produção redireciona apex → www; IndexNow exige host alinhado ao canónico final
    if (url.hostname === "nativa.art.br") {
      url.hostname = "www.nativa.art.br";
      return url.origin;
    }
  } catch {
    // mantém origin
  }
  return origin;
}

function productPageUrl(slug: string, origin = resolveIndexNowOrigin()): string {
  return absoluteUrl(origin, `/produto/${slug}`);
}

/**
 * Envia URLs ao IndexNow. Falhas são apenas logadas — nunca lançam.
 * Dispare com `void submitUrlsToIndexNow(...)` para não bloquear a resposta HTTP.
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<void> {
  const uniqueUrls = Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean)));
  if (uniqueUrls.length === 0) return;

  if (process.env.INDEXNOW_DISABLED === "1" || process.env.INDEXNOW_DISABLED === "true") {
    return;
  }

  const origin = resolveIndexNowOrigin();
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    console.warn("[indexnow] origem inválida, ping ignorado:", origin);
    return;
  }

  const keyLocation = absoluteUrl(origin, `/${INDEXNOW_KEY}.txt`);
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: uniqueUrls,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    // 200 OK / 202 Accepted = sucesso; demais códigos só logam
    if (response.ok || response.status === 202) {
      console.info(
        `[indexnow] ${uniqueUrls.length} URL(s) enviada(s) a Bing/Yandex/Naver (${response.status})`,
      );
      return;
    }

    const body = await response.text().catch(() => "");
    console.warn(
      `[indexnow] falha HTTP ${response.status}:`,
      body.slice(0, 300) || response.statusText,
    );
  } catch (error) {
    console.warn(
      "[indexnow] erro de rede (ping ignorado):",
      error instanceof Error ? error.message : error,
    );
  }
}

/** Notifica IndexNow sobre um ou mais slugs de produto (fire-and-forget). */
export function notifyProductUrls(...slugs: Array<string | null | undefined>): void {
  const origin = resolveIndexNowOrigin();
  const urls = slugs
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
    .map((slug) => productPageUrl(slug, origin));

  void submitUrlsToIndexNow(urls);
}
