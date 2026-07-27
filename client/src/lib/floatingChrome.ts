import { useSyncExternalStore } from "react";

/** Sinaliza a barra sticky da PDP (mobile) para FABs globais se reposicionarem/ocultarem. */
let productStickyCtaVisible = false;
const listeners = new Set<() => void>();

export function setProductStickyCtaVisible(visible: boolean) {
  if (productStickyCtaVisible === visible) return;
  productStickyCtaVisible = visible;
  if (typeof document !== "undefined") {
    document.body.classList.toggle("nativa-sticky-cta", visible);
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return productStickyCtaVisible;
}

function getServerSnapshot() {
  return false;
}

export function useProductStickyCtaVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
