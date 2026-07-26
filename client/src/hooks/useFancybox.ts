import type { FancyboxOptions } from "@fancyapps/ui/dist/fancybox/";

type FancyboxModule = typeof import("@fancyapps/ui/dist/fancybox/");

let fancyboxLoadPromise: Promise<FancyboxModule> | null = null;

/** Carrega Fancybox (+ CSS) sob demanda — fora do bundle inicial da PDP. */
export function loadFancybox(): Promise<FancyboxModule> {
  if (!fancyboxLoadPromise) {
    fancyboxLoadPromise = Promise.all([
      import("@fancyapps/ui/dist/fancybox/"),
      import("@fancyapps/ui/dist/fancybox/fancybox.css"),
    ]).then(([mod]) => mod);
  }
  return fancyboxLoadPromise;
}

export async function openFancyboxGallery(
  items: { src: string; caption?: string; thumb?: string }[],
  startIndex = 0,
  options: Partial<FancyboxOptions> = {},
): Promise<void> {
  const { Fancybox } = await loadFancybox();

  Fancybox.show(
    items.map((item) => ({
      src: item.src,
      type: "image" as const,
      caption: item.caption,
      thumb: item.thumb ?? item.src,
    })),
    {
      startIndex,
      Carousel: { infinite: true },
      theme: "dark",
      ...options,
    },
  );
}
