import type { DashboardPeriod } from "@shared/types/dashboard";

export function trackPageView(path: string) {
  if (path.startsWith("/admin")) return;

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
