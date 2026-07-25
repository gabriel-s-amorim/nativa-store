import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { STORIES, STORY_CTA_COPY, type StoryHighlight } from "@/content/stories";
import {
  StoriesCarousel,
  type StoriesCarouselHandle,
} from "./StoriesCarousel";

type StoriesDesktopPanelProps = {
  /** Já visível no swap — libera lazy load dos vídeos */
  active: boolean;
  /** Ao avançar além do último vídeo, volta ao texto/foto da história */
  onReturnToStory?: () => void;
};

type PanelCopy = {
  title: string;
  description: string;
  highlights?: StoryHighlight[];
  eyebrow: string;
};

function getPanelCopy(selected: number): PanelCopy {
  if (selected >= STORIES.length) {
    return {
      eyebrow: "Próximo passo",
      title: STORY_CTA_COPY.title,
      description: STORY_CTA_COPY.description,
      highlights: STORY_CTA_COPY.highlights,
    };
  }

  const story = STORIES[selected]!;
  return {
    eyebrow: story.label ?? "Bastidores",
    title: story.title,
    description: story.description,
    highlights: story.highlights,
  };
}

/**
 * Painel do making-of para o swap desktop dentro de #sobre.
 * Layout estilo TikTok: texto à esquerda sincronizado + vídeos grandes à direita.
 * (Mobile continua em StoriesSection.)
 */
export function StoriesDesktopPanel({
  active,
  onReturnToStory,
}: StoriesDesktopPanelProps) {
  const reduceMotion = useReducedMotion();
  const carouselRef = useRef<StoriesCarouselHandle>(null);
  const [selected, setSelected] = useState(0);

  const ctaIndex = STORIES.length;
  const isFirst = selected <= 0;
  const isCta = selected === ctaIndex;
  const copy = getPanelCopy(selected);

  const onSelectedChange = useCallback((index: number) => {
    setSelected(index);
  }, []);

  const tween = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="w-full" data-stories-desktop-panel>
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(260px,36%)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
        {/* Painel de texto — muda com o slide ativo */}
        <div className="relative z-10 flex flex-col lg:min-h-[420px] lg:justify-center">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#C4522A]"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Bastidores
          </p>

          <div
            className="relative overflow-hidden border border-[#C4522A]/35 bg-[#FFFDF9]/95 px-6 py-7 shadow-[0_12px_40px_rgba(61,43,31,0.08)] sm:px-7 sm:py-8"
            style={{ borderRadius: "28px 12px 32px 14px" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={tween}
                aria-live="polite"
              >
                <p
                  className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8821A]"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {copy.eyebrow}
                </p>
                <h3
                  className="mb-3 text-2xl font-bold leading-tight text-[#3D2B1F] xl:text-[1.75rem]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {copy.title}
                </h3>
                <p
                  className="text-[0.95rem] leading-relaxed text-[#5C4033]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {copy.description}
                </p>

                {copy.highlights && copy.highlights.length > 0 ? (
                  <ul className="mt-6 space-y-0">
                    {copy.highlights.map((item) => (
                      <li
                        key={`${item.label}-${item.value}`}
                        className="flex items-baseline justify-between gap-4 border-t border-[#E8D5C4]/90 py-3 first:border-t-0 first:pt-0"
                      >
                        <span
                          className="text-sm text-[#8B6F5E]"
                          style={{ fontFamily: "'Lora', serif" }}
                        >
                          {item.label}
                        </span>
                        <span
                          className="text-sm font-bold text-[#3D2B1F]"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Setas abaixo do texto (como no TikTok) */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => carouselRef.current?.scrollPrev()}
              disabled={isFirst}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E8D5C4] bg-white text-[#3D2B1F] shadow-sm transition hover:border-[#C4522A]/50 hover:bg-[#FFF8F0] disabled:pointer-events-none disabled:opacity-25"
              aria-label="Vídeo anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => carouselRef.current?.scrollNext()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E8D5C4] bg-white text-[#3D2B1F] shadow-sm transition hover:border-[#C4522A]/50 hover:bg-[#FFF8F0]"
              aria-label={isCta ? "Voltar para Nossa História" : "Próximo vídeo"}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <p
              className="ml-1 text-[11px] text-[#8B6F5E]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {isCta
                ? "Próximo volta à história"
                : `${selected + 1} / ${STORIES.length}`}
            </p>
          </div>
        </div>

        {/* Carrossel de vídeos — maior, à direita */}
        <div className="min-w-0 overflow-hidden">
          <StoriesCarousel
            ref={carouselRef}
            stories={STORIES}
            nearViewport={active}
            onCycleComplete={onReturnToStory}
            onSelectedChange={onSelectedChange}
            hideArrows
            hideFooter
          />
        </div>
      </div>
    </div>
  );
}
