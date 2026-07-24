import { trackMetaPageView } from "@/lib/metaPixel";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

/**
 * Dispara PageView do Meta Pixel a cada navegação SPA (Wouter).
 * O script base em index.html já dispara o PageView da primeira carga.
 */
export default function PixelRouteTracker() {
  const [location] = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (location.startsWith("/admin")) return;
    trackMetaPageView();
  }, [location]);

  return null;
}
