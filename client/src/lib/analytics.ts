import {
  ANALYTICS_EXCLUDE_COOKIE,
  ANALYTICS_EXCLUDE_COOKIE_MAX_AGE_MS,
  ANALYTICS_EXCLUDE_COOKIE_VALUE,
  ANALYTICS_INTERNAL_QUERY,
} from "@shared/const/analytics";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

function writeExcludeCookie(enabled: boolean) {
  if (typeof document === "undefined") return;

  if (enabled) {
    const maxAge = Math.floor(ANALYTICS_EXCLUDE_COOKIE_MAX_AGE_MS / 1000);
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${ANALYTICS_EXCLUDE_COOKIE}=${ANALYTICS_EXCLUDE_COOKIE_VALUE}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
    return;
  }

  document.cookie = `${ANALYTICS_EXCLUDE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function isAnalyticsExcluded(): boolean {
  return readCookie(ANALYTICS_EXCLUDE_COOKIE) === ANALYTICS_EXCLUDE_COOKIE_VALUE;
}

/**
 * Lê ?nativa_internal=1|0 na URL, aplica o cookie e limpa o parâmetro da barra.
 * Retorna true se a URL foi alterada (para o caller poder reagir).
 */
export function applyInternalAnalyticsFlagFromUrl(): boolean {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const value = url.searchParams.get(ANALYTICS_INTERNAL_QUERY);
  if (value !== "1" && value !== "0") return false;

  const enabled = value === "1";
  writeExcludeCookie(enabled);

  void fetch("/api/analytics/exclude", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  }).catch(() => {
    // Cookie local já foi aplicado; falha de rede não bloqueia.
  });

  url.searchParams.delete(ANALYTICS_INTERNAL_QUERY);
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", next);
  return true;
}

export function trackPageView(path: string) {
  if (path.startsWith("/admin")) return;
  if (isAnalyticsExcluded()) return;

  fetch("/api/analytics/page-view", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
    keepalive: true,
  }).catch(() => {
    // Silencioso — analytics não deve atrapalhar a loja
  });
}
