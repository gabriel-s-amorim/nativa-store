declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim() ?? "";

/** Só dispara se o Pixel ID estiver configurado (evita poluir dados em dev local). */
export function isMetaPixelEnabled(): boolean {
  return Boolean(PIXEL_ID) && typeof window !== "undefined" && typeof window.fbq === "function";
}

function track(event: string, params?: Record<string, unknown>) {
  if (!isMetaPixelEnabled()) return;
  if (params) {
    window.fbq!("track", event, params);
  } else {
    window.fbq!("track", event);
  }
}

export function trackMetaPageView() {
  track("PageView");
}

export function trackViewContent(params: {
  contentIds: string[];
  value: number;
  contentName?: string;
}) {
  track("ViewContent", {
    content_ids: params.contentIds,
    content_type: "product",
    content_name: params.contentName,
    value: params.value,
    currency: "BRL",
  });
}

export function trackAddToCart(params: {
  contentIds: string[];
  value: number;
  quantity?: number;
  contentName?: string;
}) {
  track("AddToCart", {
    content_ids: params.contentIds,
    content_type: "product",
    content_name: params.contentName,
    value: params.value,
    currency: "BRL",
    num_items: params.quantity,
  });
}

export function trackInitiateCheckout(params: {
  contentIds: string[];
  value: number;
  numItems: number;
}) {
  track("InitiateCheckout", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: "BRL",
    num_items: params.numItems,
  });
}

const trackedPurchases = new Set<string>();

export function trackPurchase(params: {
  orderId: string;
  contentIds: string[];
  value: number;
  numItems?: number;
}) {
  if (trackedPurchases.has(params.orderId)) return;
  trackedPurchases.add(params.orderId);
  track("Purchase", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: "BRL",
    num_items: params.numItems,
  });
}
