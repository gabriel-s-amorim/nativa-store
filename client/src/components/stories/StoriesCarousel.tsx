import { ChevronLeft, ChevronRight, Facebook, Instagram } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { StoryWithUrls } from "@/content/stories";
import { StoryVideo } from "./StoryVideo";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/nativa_criativa/",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1BjeTNQpat/?mibextid=wwXIfr",
    icon: Facebook,
  },
] as const;

const CTA_BORDER = "36px 14px 42px 18px";
const CTA_SLIDE_ID = "__social-cta__";

type StoriesCarouselProps = {
  stories: StoryWithUrls[];
  nearViewport: boolean;
  /** Depois do CTA social, avança de volta à história */
  onCycleComplete?: () => void;
};

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.8a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.01a8.2 8.2 0 0 0 4.76 1.51V7.07a4.84 4.84 0 0 1-1-.38Z" />
    </svg>
  );
}

function SocialCtaCard({
  active,
  reduceMotion,
  onReturnToStory,
}: {
  active: boolean;
  reduceMotion: boolean | null;
  onReturnToStory?: () => void;
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-5 py-8 text-center"
      style={{
        borderRadius: CTA_BORDER,
        background:
          "linear-gradient(160deg, #3D2B1F 0%, #5C4033 42%, #C4522A 100%)",
      }}
    >
      {/* Brilho animado */}
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["0%", "280%"] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          aria-hidden
        />
      ) : null}

      <motion.div
        className="relative z-[1] flex flex-col items-center"
        animate={
          active && !reduceMotion
            ? { y: [0, -4, 0] }
            : { y: 0 }
        }
        transition={
          active && !reduceMotion
            ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        <p
          className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8821A]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Continua lá fora
        </p>
        <h4
          className="mb-3 max-w-[14rem] text-xl font-bold leading-snug text-[#FFF8F0]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Vem ver mais bastidores nas redes
        </h4>
        <p
          className="mb-6 max-w-[13rem] text-xs leading-relaxed text-white/70"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Reels, novidades e o dia a dia do ateliê — te esperamos por lá.
        </p>

        <div className="mb-6 flex items-center gap-3">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
              aria-label={label}
              whileHover={reduceMotion ? undefined : { scale: 1.08, y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              <Icon className="h-5 w-5" />
            </motion.a>
          ))}
          <motion.a
            href="https://www.tiktok.com/@nativa.criativa?_r=1&_t=ZS-98HzhNyOEYj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
            aria-label="TikTok"
            whileHover={reduceMotion ? undefined : { scale: 1.08, y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          >
            <TikTokGlyph className="h-5 w-5" />
          </motion.a>
        </div>

        {onReturnToStory ? (
          <button
            type="button"
            onClick={onReturnToStory}
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#FFF8F0] transition hover:bg-white/20"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Voltar à história
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}

/**
 * Carrossel desktop: altura fixa (sem pular a seção), setas simétricas,
 * slide final = CTA de redes; depois disso volta à história.
 */
export function StoriesCarousel({
  stories,
  nearViewport,
  onCycleComplete,
}: StoriesCarouselProps) {
  const reduceMotion = useReducedMotion();
  const slideCount = stories.length + 1; // + CTA
  const ctaIndex = stories.length;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    dragFree: false,
    skipSnaps: false,
    duration: reduceMotion ? 10 : 22,
  });
  const [selected, setSelected] = useState(0);
  const [muted, setMuted] = useState(false);

  const isFirst = selected <= 0;
  const isCta = selected === ctaIndex;
  const isLastVideo = selected === stories.length - 1;

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

  useEffect(() => {
    if (!emblaApi || !nearViewport) return;
    const id = window.requestAnimationFrame(() => emblaApi.reInit());
    return () => window.cancelAnimationFrame(id);
  }, [emblaApi, nearViewport, slideCount]);

  const scrollPrev = () => {
    if (!emblaApi || isFirst) return;
    emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (isCta) {
      onCycleComplete?.();
      return;
    }
    emblaApi?.scrollNext();
  };

  const tween = reduceMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] as const };

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute left-1/2 top-[46%] h-[52%] w-[min(420px,55%)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(196,82,42,0.2) 0%, rgba(232,130,26,0.06) 50%, transparent 72%)",
        }}
        aria-hidden
      />

      {/* Altura folgada: o card ativo NÃO usa scale>1 (evita corte topo/baixo) */}
      <div className="relative h-[min(640px,78vh)] min-h-[500px]">
        <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full items-center">
            {stories.map((story, index) => {
              const isActive = index === selected;
              const dist = Math.abs(index - selected);
              const isNeighbor = dist === 1;
              const shouldLoad = nearViewport && dist <= 1 && !isCta;

              // Destaque = laterais menores; ativo fica em escala 1 (sem clip)
              const scale = isActive ? 1 : dist === 1 ? 0.86 : 0.74;
              const opacity = isActive ? 1 : dist === 1 ? 0.55 : 0.32;

              return (
                <div
                  key={story.id}
                  className="flex min-w-0 shrink-0 grow-0 basis-[58%] items-center justify-center px-2 sm:basis-[46%] md:basis-[38%] lg:basis-[300px] xl:basis-[320px]"
                >
                  <motion.div
                    className="relative w-full max-w-[280px] lg:max-w-[300px]"
                    onClick={() => {
                      if (!isActive) emblaApi?.scrollTo(index);
                    }}
                    animate={{ scale, opacity }}
                    transition={tween}
                    style={{
                      zIndex: isActive ? 20 : Math.max(1, 8 - dist),
                      transformOrigin: "center center",
                      cursor: isActive ? "default" : "pointer",
                      willChange: "transform, opacity",
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
                  >
                    <div
                      className="relative aspect-[9/16] w-full overflow-hidden"
                      style={{
                        borderRadius: story.borderRadius,
                        boxShadow: isActive
                          ? "0 24px 56px rgba(196,82,42,0.32), 0 0 0 2px rgba(255,255,255,0.9)"
                          : "0 8px 24px rgba(61,43,31,0.12)",
                        transition: reduceMotion
                          ? undefined
                          : "box-shadow 0.4s ease",
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
                        fit={isActive ? "contain" : "cover"}
                      />
                      {!isActive ? (
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(61,43,31,0.12) 0%, rgba(61,43,31,0.38) 100%)",
                            borderRadius: story.borderRadius,
                          }}
                          aria-hidden
                        />
                      ) : null}
                    </div>

                    <p
                      className="mt-3 h-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C4522A]"
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        opacity: isActive && story.label ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {story.label ?? "\u00A0"}
                    </p>
                  </motion.div>
                </div>
              );
            })}

            {/* Slide CTA redes — um pouco maior que os vídeos */}
            <div
              key={CTA_SLIDE_ID}
              className="flex min-w-0 shrink-0 grow-0 basis-[62%] items-center justify-center px-2 sm:basis-[50%] md:basis-[40%] lg:basis-[320px] xl:basis-[340px]"
            >
              <motion.div
                className="relative w-full max-w-[300px] lg:max-w-[320px]"
                animate={{
                  scale: isCta ? 1 : Math.abs(selected - ctaIndex) === 1 ? 0.86 : 0.74,
                  opacity: isCta ? 1 : Math.abs(selected - ctaIndex) === 1 ? 0.55 : 0.32,
                }}
                transition={tween}
                style={{
                  zIndex: isCta ? 20 : 4,
                  transformOrigin: "center center",
                  willChange: "transform, opacity",
                }}
                onClick={() => {
                  if (!isCta) emblaApi?.scrollTo(ctaIndex);
                }}
              >
                <div
                  className="relative aspect-[9/16] w-full overflow-hidden"
                  style={{
                    borderRadius: CTA_BORDER,
                    boxShadow: isCta
                      ? "0 24px 56px rgba(196,82,42,0.32), 0 0 0 2px rgba(255,255,255,0.9)"
                      : "0 8px 24px rgba(61,43,31,0.12)",
                  }}
                >
                  <SocialCtaCard
                    active={isCta}
                    reduceMotion={reduceMotion}
                    onReturnToStory={onCycleComplete}
                  />
                </div>
                <p
                  className="mt-3 h-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C4522A]"
                  style={{
                    opacity: isCta ? 1 : 0,
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Redes
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollPrev}
          disabled={isFirst}
          className="absolute left-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8D5C4]/90 bg-white/95 text-[#3D2B1F] shadow-md backdrop-blur-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-20 sm:left-1 md:left-2"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8D5C4]/90 bg-white/95 text-[#3D2B1F] shadow-md backdrop-blur-sm transition hover:bg-white sm:right-1 md:right-2"
          aria-label={isCta ? "Voltar para Nossa História" : "Próximo"}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2" role="tablist" aria-label="Stories">
        {stories.map((story, index) => (
          <button
            key={story.id}
            type="button"
            role="tab"
            aria-selected={index === selected}
            aria-label={`Story ${index + 1}`}
            onClick={() => emblaApi?.scrollTo(index)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: index === selected ? 28 : 7,
              background:
                index === selected
                  ? "linear-gradient(90deg, #C4522A, #E8821A)"
                  : "#E8D5C4",
            }}
          />
        ))}
        <button
          type="button"
          role="tab"
          aria-selected={isCta}
          aria-label="Redes sociais"
          onClick={() => emblaApi?.scrollTo(ctaIndex)}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: isCta ? 28 : 7,
            background: isCta
              ? "linear-gradient(90deg, #2D6A4F, #1B7A8C)"
              : "#E8D5C4",
          }}
        />
      </div>

      {/* hint discreto só no CTA */}
      {isCta ? (
        <p
          className="mt-3 text-center text-[11px] text-[#8B6F5E]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Próximo volta à nossa história
        </p>
      ) : isLastVideo ? (
        <p
          className="mt-3 text-center text-[11px] text-[#8B6F5E]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Próximo: convite às redes
        </p>
      ) : (
        <p className="mt-3 h-[17px]" aria-hidden />
      )}
    </div>
  );
}
