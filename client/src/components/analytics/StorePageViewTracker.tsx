import { trackPageView } from "@/lib/analytics";
import { useEffect } from "react";
import { useLocation } from "wouter";

/** Registra visitas à loja pública (não admin) para o dashboard. */
export default function StorePageViewTracker() {
  const [location] = useLocation();

  useEffect(() => {
    if (location.startsWith("/admin")) return;
    trackPageView(location);
  }, [location]);

  return null;
}
