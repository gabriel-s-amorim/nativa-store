import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { STORIES } from "@/content/stories";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { StoriesCarousel } from "./StoriesCarousel";
import { StoriesImmersive } from "./StoriesImmersive";

/**
 * Bloco de Stories / making-of dentro de #sobre.
 * Desktop/tablet: carrossel inline (Embla + Motion).
 * Mobile: hint no centro da viewport → toque/swipe horizontal abre imersivo
 * (sem sequestrar o scroll vertical da página).
 */
export function StoriesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [nearViewport, setNearViewport] = useState(false);
  const [centered, setCentered] = useState(false);
  const [immersive, setImmersive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNearViewport(true);
      },
      { rootMargin: "280px 0px", threshold: 0.01 },
    );

    const centerObserver = new IntersectionObserver(
      ([entry]) => {
        setCentered(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "-32% 0px -32% 0px", threshold: 0 },
    );

    nearObserver.observe(el);
    centerObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      centerObserver.disconnect();
    };
  }, []);

  const showMobileHint = isMobile && centered && !immersive && !reduceMotion;

  const openImmersive = () => {
    if (!isMobile) return;
    setImmersive(true);
  };

  const closeImmersive = (opts?: { continueScroll?: boolean }) => {
    setImmersive(false);
    if (!opts?.continueScroll) return;

    const sobre = document.getElementById("sobre");
    if (!sobre) return;
    const top = sobre.getBoundingClientRect().bottom + window.scrollY + 8;
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  };

  /** Swipe horizontal leve abre o imersivo sem sequestrar o scroll vertical. */
  const onTouchStart = (event: TouchEvent) => {
    const t = event.touches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || reduceMotion || immersive) return;
    const t = event.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      openImmersive();
    }
  };

  return (
    <div ref={sectionRef} className="mt-14 md:mt-16" data-stories-section>
      <div className="mb-6 text-center md:mb-8">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#C4522A]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Bastidores
        </p>
        <h3
          className="text-2xl font-bold text-[#3D2B1F] md:text-3xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          O making of das bolsas
        </h3>
        <p
          className="mx-auto mt-2 max-w-md text-sm text-[#8B6F5E]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Do ateliê à peça pronta — um olhar rápido sobre o processo artesanal.
        </p>
      </div>

      <div className="hidden md:block">
        <StoriesCarousel stories={STORIES} nearViewport={nearViewport} />
      </div>

      <div className="md:hidden">
        <motion.div
          className="relative mx-auto max-w-[320px]"
          animate={
            showMobileHint
              ? {
                  boxShadow: [
                    "0 0 0 0 rgba(196,82,42,0)",
                    "0 0 28px 4px rgba(196,82,42,0.28)",
                    "0 0 0 0 rgba(196,82,42,0)",
                  ],
                }
              : { boxShadow: "0 0 0 0 rgba(196,82,42,0)" }
          }
          transition={
            showMobileHint
              ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          style={{ borderRadius: "28px" }}
        >
          <button
            type="button"
            className="relative flex w-full touch-manipulation flex-col items-center gap-3"
            onClick={openImmersive}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            aria-label="Abrir making of em tela cheia"
          >
            <div className="flex w-full justify-center -space-x-10">
              {STORIES.map((story, i) => (
                <motion.div
                  key={story.id}
                  className="relative aspect-[9/16] w-[42%] overflow-hidden bg-[#3D2B1F] shadow-lg"
                  style={{
                    borderRadius: story.borderRadius,
                    zIndex: STORIES.length - i,
                    rotate: reduceMotion ? 0 : (i - 1) * 4,
                  }}
                  animate={
                    showMobileHint
                      ? { scale: [1, 1.03, 1], y: [0, -3, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={
                    showMobileHint
                      ? {
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }
                      : { duration: 0.2 }
                  }
                >
                  {story.thumbnailUrl ? (
                    <img
                      src={story.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[10px] text-white/50"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      Story {i + 1}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {(showMobileHint || reduceMotion || centered) && (
              <motion.span
                className="rounded-full bg-[#C4522A]/12 px-3 py-1.5 text-xs font-semibold text-[#C4522A]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {reduceMotion
                  ? "Toque para ver o making of"
                  : "Arraste pra ver o making of"}
              </motion.span>
            )}
          </button>
        </motion.div>

        {reduceMotion ? (
          <p
            className="mt-3 text-center text-xs text-[#8B6F5E]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Toque no preview para abrir. Use as setas na tela cheia.
          </p>
        ) : null}
      </div>

      <StoriesImmersive
        stories={STORIES}
        open={immersive}
        onClose={closeImmersive}
      />
    </div>
  );
}
