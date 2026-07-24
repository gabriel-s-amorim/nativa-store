import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { StoryWithUrls } from "@/content/stories";
import { StoryVideo } from "./StoryVideo";

type StoriesCarouselProps = {
  stories: StoryWithUrls[];
  /** Seção próxima da viewport — libera lazy load dos vídeos */
  nearViewport: boolean;
  /** No último vídeo, seta “próximo” fecha o making-of e volta à história */
  onCycleComplete?: () => void;
};

/**
 * Carrossel desktop: um slide ativo bem destacado; laterais menores.
 * Snap Embla sem containScroll (evita travar nos últimos).
 */
export function StoriesCarousel({
  stories,
  nearViewport,
  onCycleComplete,
}: StoriesCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    dragFree: false,
    skipSnaps: false,
    duration: reduceMotion ? 12 : 34,
  });
  const [selected, setSelected] = useState(0);
  const [muted, setMuted] = useState(false);
  const lastIndex = stories.length - 1;
  const isLast = selected >= lastIndex;
  const isFirst = selected <= 0;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reinit quando o painel monta (swap da About) — evita snaps “fantasmas”
  useEffect(() => {
    if (!emblaApi || !nearViewport) return;
    const id = window.requestAnimationFrame(() => emblaApi.reInit());
    return () => window.cancelAnimationFrame(id);
  }, [emblaApi, nearViewport, stories.length]);

  const scrollPrev = () => {
    if (!emblaApi || isFirst) return;
    emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (isLast) {
      onCycleComplete?.();
      return;
    }
    emblaApi?.scrollNext();
  };

  return (
    <div className="relative">
      {/* Glow atmosférico atrás do ativo */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[55%] w-[min(420px,55%)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(196,82,42,0.22) 0%, rgba(232,130,26,0.08) 45%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="overflow-hidden py-6 md:py-8" ref={emblaRef}>
        <div className="flex items-center">
          {stories.map((story, index) => {
            const isActive = index === selected;
            const dist = Math.abs(index - selected);
            const isNeighbor = dist === 1;
            const shouldLoad = nearViewport && dist <= 1;

            // Hierarquia clara: só UM protagonista
            const scale = reduceMotion
              ? isActive
                ? 1
                : 0.82
              : isActive
                ? 1.08
                : dist === 1
                  ? 0.78
                  : 0.68;
            const opacity = isActive ? 1 : dist === 1 ? 0.55 : 0.32;
            const y = reduceMotion ? 0 : isActive ? 0 : dist === 1 ? 10 : 18;

            return (
              <div
                key={story.id}
                className="min-w-0 shrink-0 grow-0 basis-[58%] px-2 sm:basis-[46%] md:basis-[38%] lg:basis-[280px] xl:basis-[300px]"
              >
                <motion.div
                  className="relative mx-auto w-full max-w-[300px]"
                  onClick={() => {
                    if (!isActive) emblaApi?.scrollTo(index);
                  }}
                  animate={{ scale, opacity, y }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 260, damping: 28, mass: 0.85 }
                  }
                  style={{
                    zIndex: isActive ? 20 : 10 - dist,
                    transformOrigin: "center center",
                    cursor: isActive ? "default" : "pointer",
                  }}
                  role={isActive ? undefined : "button"}
                  tabIndex={isActive ? undefined : 0}
                  onKeyDown={
                    isActive
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            emblaApi?.scrollTo(index);
                          }
                        }
                  }
                  aria-label={
                    isActive
                      ? undefined
                      : `Ir para ${story.label ?? `story ${index + 1}`}`
                  }
                  aria-current={isActive ? "true" : undefined}
                >
                  <motion.div
                    className="relative aspect-[9/16] w-full overflow-hidden"
                    animate={{
                      boxShadow: isActive
                        ? "0 28px 64px rgba(196,82,42,0.35), 0 0 0 2px rgba(255,255,255,0.85), 0 0 40px rgba(232,130,26,0.25)"
                        : "0 10px 28px rgba(61,43,31,0.14)",
                    }}
                    transition={{ duration: reduceMotion ? 0 : 0.35 }}
                    style={{ borderRadius: story.borderRadius }}
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

                    {!isActive ? (
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(61,43,31,0.15) 0%, rgba(61,43,31,0.35) 100%)",
                          borderRadius: story.borderRadius,
                        }}
                        aria-hidden
                      />
                    ) : null}
                  </motion.div>

                  <AnimatePresence>
                    {isActive && story.label ? (
                      <motion.p
                        key={`label-${story.id}`}
                        className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#C4522A]"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                      >
                        {story.label}
                      </motion.p>
                    ) : (
                      <div className="mt-4 h-4" aria-hidden />
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setas */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 top-0 flex items-center justify-between px-0 sm:px-1">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={isFirst}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#E8D5C4]/90 bg-white/90 text-[#3D2B1F] shadow-md backdrop-blur-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-25"
          aria-label="Vídeo anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={scrollNext}
          className="pointer-events-auto flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border border-[#E8D5C4]/90 bg-white/90 px-2.5 text-[#3D2B1F] shadow-md backdrop-blur-sm transition hover:bg-white"
          aria-label={
            isLast ? "Voltar para Nossa História" : "Próximo vídeo"
          }
          title={isLast ? "Voltar à história" : undefined}
        >
          {isLast && onCycleComplete ? (
            <>
              <RotateCcw className="h-3.5 w-3.5 text-[#C4522A]" />
              <span
                className="hidden text-[10px] font-bold uppercase tracking-wide text-[#C4522A] sm:inline"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                História
              </span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Indicadores + dica no último */}
      <div className="mt-2 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Stories">
          {stories.map((story, index) => (
            <button
              key={story.id}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-label={`Ir para story ${index + 1}`}
              onClick={() => emblaApi?.scrollTo(index)}
              className="h-1.5 overflow-hidden rounded-full transition-all duration-300"
              style={{
                width: index === selected ? 32 : 8,
                background:
                  index === selected
                    ? "linear-gradient(90deg, #C4522A, #E8821A)"
                    : "#E8D5C4",
              }}
            />
          ))}
        </div>

        {isLast && onCycleComplete ? (
          <motion.p
            className="text-[11px] text-[#8B6F5E]"
            style={{ fontFamily: "'Lora', serif" }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Próximo → volta à nossa história
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}
