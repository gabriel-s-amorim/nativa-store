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
const ROOT_PATH = "https://vlibras.gov.br/app";
let vlibrasBooted = false;

/**
 * Widget oficial VLibras (Governo Federal / UFPB).
 * Traduz o conteúdo da página para Libras — script público pronto.
 * Posicionado à esquerda para não sobrepor o WhatsApp (direita).
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

    const boot = () => {
      if (cancelled || vlibrasBooted || !window.VLibras?.Widget) return;
      try {
        new window.VLibras.Widget({
          rootPath: ROOT_PATH,
          position: "L",
          opacity: 1,
        });
        vlibrasBooted = true;
      } catch {
        try {
          new window.VLibras.Widget(ROOT_PATH);
          vlibrasBooted = true;
        } catch {
          // Widget indisponível ou já inicializado
        }
      }
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.VLibras?.Widget) {
        boot();
      } else {
        loadHandler = () => boot();
        existing.addEventListener("load", loadHandler);
      }
      return () => {
        cancelled = true;
        if (loadHandler) existing.removeEventListener("load", loadHandler);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${ROOT_PATH}/vlibras-plugin.js`;
    script.async = true;
    script.onload = boot;
    script.onerror = () => {
      script.remove();
    };
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return createElement(
    "div",
    { vw: "", className: "enabled", "aria-label": "VLibras — tradução em Libras" },
    createElement("div", { "vw-access-button": "", className: "active" }),
    createElement(
      "div",
      { "vw-plugin-wrapper": "" },
      createElement("div", { className: "vw-plugin-top-wrapper" })
    )
  );
}
