import { createElement, useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (
        rootPathOrConfig?: string | Record<string, unknown>
      ) => void;
    };
  }
}

const SCRIPT_ID = "vlibras-plugin-script";
/** CDN oficial (www) — mesma base que o plugin usa nos assets */
const ROOT_PATH = "https://www.vlibras.gov.br/app";
let vlibrasBooted = false;

function pinVLibrasAnchor() {
  const root = document.querySelector<HTMLElement>("div[vw]");
  if (!root) return;

  // O plugin escreve top:50% + translateY no inline style (posição "L").
  // Forçamos canto inferior esquerdo, logo acima do FAB de acessibilidade.
  root.style.setProperty("top", "auto", "important");
  root.style.setProperty("bottom", "calc(4.75rem + env(safe-area-inset-bottom, 0px))", "important");
  root.style.setProperty("left", "1rem", "important");
  root.style.setProperty("right", "auto", "important");
  root.style.setProperty("transform", "none", "important");
  root.style.setProperty("margin", "0", "important");
  root.classList.add("isLeft", "nativa-vlibras-pinned");

  if (window.matchMedia("(min-width: 640px)").matches) {
    root.style.setProperty("bottom", "6rem", "important");
    root.style.setProperty("left", "1.5rem", "important");
  }

  const btn = root.querySelector<HTMLElement>("[vw-access-button]");
  btn?.classList.add("active", "isLeft");
}

/**
 * Widget oficial VLibras (Governo Federal / UFPB).
 * Mobile + desktop: FAB azul imediatamente acima da cadeira de rodas.
 */
export default function VLibrasWidget() {
  const [location] = useLocation();
  const isAdmin = location === "/admin" || location.startsWith("/admin/");

  useEffect(() => {
    document.body.classList.toggle("is-admin-route", isAdmin);
    return () => {
      document.body.classList.remove("is-admin-route");
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    let cancelled = false;
    let loadHandler: (() => void) | null = null;
    let pinTimer: number | undefined;
    let pinObserver: MutationObserver | undefined;

    const schedulePin = () => {
      pinVLibrasAnchor();
      window.clearTimeout(pinTimer);
      // O plugin reaplica posição no onload e num setTimeout(~2s) do popup
      pinTimer = window.setTimeout(pinVLibrasAnchor, 100);
      window.setTimeout(pinVLibrasAnchor, 500);
      window.setTimeout(pinVLibrasAnchor, 2200);
      window.setTimeout(pinVLibrasAnchor, 5200);
    };

    const boot = () => {
      if (cancelled || !window.VLibras?.Widget) return;

      if (!vlibrasBooted) {
        try {
          // BL = bottom-left (evita o top:50% da posição "L")
          new window.VLibras.Widget({
            rootPath: ROOT_PATH,
            position: "BL",
            opacity: 1,
          });
          vlibrasBooted = true;
        } catch {
          try {
            new window.VLibras.Widget(ROOT_PATH);
            vlibrasBooted = true;
          } catch {
            return;
          }
        }

        // SPA: se a página já carregou, o handler window.onload do plugin nunca roda.
        if (document.readyState === "complete" && typeof window.onload === "function") {
          try {
            window.onload(new Event("load"));
          } catch {
            // ignore
          }
        }
      }

      schedulePin();

      const root = document.querySelector("div[vw]");
      if (root && !pinObserver) {
        pinObserver = new MutationObserver(() => pinVLibrasAnchor());
        pinObserver.observe(root, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
      }
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.VLibras?.Widget) boot();
      else {
        loadHandler = () => boot();
        existing.addEventListener("load", loadHandler);
      }
    } else {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `${ROOT_PATH}/vlibras-plugin.js`;
      script.async = true;
      script.onload = boot;
      script.onerror = () => {
        script.remove();
      };
      document.body.appendChild(script);
    }

    const onResize = () => pinVLibrasAnchor();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.clearTimeout(pinTimer);
      window.removeEventListener("resize", onResize);
      pinObserver?.disconnect();
      if (loadHandler) {
        document.getElementById(SCRIPT_ID)?.removeEventListener("load", loadHandler);
      }
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return createElement(
    "div",
    {
      vw: "",
      className: "enabled left nativa-vlibras-pinned",
      "aria-label": "VLibras — tradução em Libras",
    },
    createElement("div", { "vw-access-button": "", className: "active isLeft" }),
    createElement(
      "div",
      { "vw-plugin-wrapper": "" },
      createElement("div", { className: "vw-plugin-top-wrapper" })
    )
  );
}
