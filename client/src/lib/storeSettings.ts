import type { StoreSettings } from "@shared/types/storeSettings";
import { DEFAULT_STORE_SETTINGS } from "@shared/types/storeSettings";

let cached: StoreSettings | null = null;
let inflight: Promise<StoreSettings> | null = null;

export async function fetchStoreSettings(): Promise<StoreSettings> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const response = await fetch("/api/settings", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return DEFAULT_STORE_SETTINGS;
      const data = (await response.json()) as StoreSettings;
      cached = data;
      return data;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function getCachedStoreSettings(): StoreSettings {
  return cached ?? DEFAULT_STORE_SETTINGS;
}
