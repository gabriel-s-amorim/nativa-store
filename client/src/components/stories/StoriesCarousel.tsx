import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { StoryWithUrls } from "@/content/stories";
import { StoryVideo } from "./StoryVideo";

type StoriesCarouselProps = {
  stories: StoryWithUrls[];
  /** Seção próxima da viewport — libera lazy load dos vídeos */
  nearViewport: boolean;
};

/**
 * Carrossel desktop/tablet: Embla para snap/arraste horizontal;
 * Framer Motion para escala, opacidade e glow do card ativo.
 * (Embla já está no projeto e evita reinventar drag+snap; Motion cobre a transição visual pedida.)
 */
export function StoriesCarousel({ stories, nearViewport }: StoriesCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    dragFree: false,
    skipSnaps: false,
    duration: reduceMotion ? 10 : 28,
  });
  const [selected, setSelected] = useState(0);
  const [muted, setMuted] = useState(true);
  /** Distância normalizada de cada slide ao snap ativo (0 = centro) */
  const [distances, setDistances] = useState<number[]>(() =>
    stories.map((_, i) => (i === 0 ? 0 : 1)),
  );

  const updateSelection = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const updateDistances = useCallback(() => {
    if (!emblaApi) return;
    const progress = emblaApi.scrollProgress();
    const snaps = emblaApi.scrollSnapList();
    if (!snaps.length) return;

    const next = snaps.map((snap) => {
      const raw = Math.abs(snap - progress);
      // Normaliza pela distância típica entre snaps (~1/(n-1) ou similar)
      return Math.min(1, raw * Math.max(snaps.length - 1, 1) * 1.15);
    });
    setDistances(next);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateSelection();
    updateDistances();
    emblaApi.on("select", updateSelection);
    emblaApi.on("scroll", updateDistances);
    emblaApi.on("reInit", () => {
      updateSelection();
      updateDistances();
    });
    return () => {
      emblaApi.off("select", updateSelection);
      emblaApi.off("scroll", updateDistances);
    };
  }, [emblaApi, updateSelection, updateDistances]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative">
      <div className="overflow-hidden px-2 sm:px-4" ref={emblaRef}>
        <div className="flex touch-pan-y items-center">
          {stories.map((story, index) => {
            const distance = distances[index] ?? 1;
            const isActive = index === selected;
            const isNeighbor = Math.abs(index - selected) === 1;
            const shouldLoad = nearViewport && (isActive || isNeighbor);
            const scale = reduceMotion ? (isActive ? 1 : 0.88) : 1 - distance * 0.18;
            const opacity = reduceMotion ? (isActive ? 1 : 0.55) : 1 - distance * 0.45;

            return (
              <div
                key={story.id}
                className="min-w-0 shrink-0 grow-0 basis-[min(72%,280px)] px-2 sm:basis-[min(52%,300px)] md:basis-[min(42%,320px)] lg:basis-[300px]"
              >
                <motion.div
                  className="relative mx-auto aspect-[9/16] w-full max-w-[280px]"
                  animate={{
                    scale: Math.max(0.78, scale),
                    opacity: Math.max(0.4, opacity),
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 280, damping: 32 }
                  }
                  style={{
                    borderRadius: story.borderRadius,
                    boxShadow: isActive
                      ? "0 18px 48px rgba(196, 82, 42, 0.28), 0 0 0 1px rgba(232, 130, 26, 0.2)"
                      : "0 8px 24px rgba(61, 43, 31, 0.12)",
                  }}
                >
                  <StoryVideo
                    story={story}
                    active={isActive && nearViewport}
                    shouldLoad={shouldLoad}
                    preload={isActive ? "auto" : isNeighbor ? "metadata" : "none"}
                    borderRadius={story.borderRadius}
                    loop
                    muted={muted}
                    onMutedChange={setMuted}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setas discretas */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-0 sm:px-1">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={selected === 0}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#E8D5C4]/80 bg-white/80 text-[#3D2B1F] shadow-sm backdrop-blur-sm transition hover:bg-white disabled:opacity-30"
          aria-label="Vídeo anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={selected >= stories.length - 1}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#E8D5C4]/80 bg-white/80 text-[#3D2B1F] shadow-sm backdrop-blur-sm transition hover:bg-white disabled:opacity-30"
          aria-label="Próximo vídeo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Indicadores */}
      <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Stories">
        {stories.map((story, index) => (
          <button
            key={story.id}
            type="button"
            role="tab"
            aria-selected={index === selected}
            aria-label={`Ir para story ${index + 1}`}
            onClick={() => emblaApi?.scrollTo(index)}
            className="h-1 overflow-hidden rounded-full transition-all duration-300"
            style={{
              width: index === selected ? 28 : 10,
              background:
                index === selected
                  ? "linear-gradient(90deg, #C4522A, #E8821A)"
                  : "#E8D5C4",
            }}
          />
        ))}
      </div>
    </div>
  );
}
