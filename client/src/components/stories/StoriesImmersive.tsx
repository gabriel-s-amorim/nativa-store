import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { StoryWithUrls } from "@/content/stories";
import { StoryVideo } from "./StoryVideo";

type StoriesImmersiveProps = {
  stories: StoryWithUrls[];
  open: boolean;
  initialIndex?: number;
  onClose: (opts?: { continueScroll?: boolean }) => void;
};

const SWIPE_OFFSET = 72;
const SWIPE_VELOCITY = 480;

/**
 * Modo imersivo mobile: tela cheia com borda orgânica,
 * swipe vertical (cima = próximo), saída suave após o último.
 */
export function StoriesImmersive({
  stories,
  open,
  initialIndex = 0,
  onClose,
}: StoriesImmersiveProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setExiting(false);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goNext = () => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // Último: transição suave de volta ao scroll da página
    exitToPage();
  };

  const goPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const exitToPage = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(
      () => onClose({ continueScroll: true }),
      reduceMotion ? 0 : 420,
    );
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (reduceMotion) return;
    const { offset, velocity } = info;
    if (offset.y < -SWIPE_OFFSET || velocity.y < -SWIPE_VELOCITY) {
      goNext();
    } else if (offset.y > SWIPE_OFFSET || velocity.y > SWIPE_VELOCITY) {
      goPrev();
    }
  };

  if (typeof document === "undefined") return null;

  const story = stories[index];
  if (!story) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="stories-immersive"
          className="fixed inset-0 z-[80] flex flex-col bg-[#1a120e]/92 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: exiting ? 0 : 1, y: exiting ? "-12%" : 0 }}
          exit={{ opacity: 0, y: "-8%" }}
          transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Making of — stories"
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <p
              className="text-xs font-semibold uppercase tracking-widest text-white/70"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Making of · {index + 1}/{stories.length}
            </p>
            <button
              type="button"
              onClick={() => onClose()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Fechar stories"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Barras de progresso */}
          <div className="mb-3 flex gap-1.5 px-4">
            {stories.map((s, i) => (
              <div
                key={s.id}
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25"
              >
                <motion.div
                  className="h-full origin-left rounded-full bg-white"
                  initial={false}
                  animate={{
                    scaleX: i < index ? 1 : i === index ? 1 : 0,
                    opacity: i <= index ? 1 : 0.35,
                  }}
                  style={{ transformOrigin: "left" }}
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                />
              </div>
            ))}
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <motion.div
              key={story.id}
              className="relative aspect-[9/16] w-full max-w-[min(100%,420px)]"
              style={{
                borderRadius: story.borderRadius,
                boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 0 40px rgba(196,82,42,0.18)",
              }}
              drag={reduceMotion ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.18}
              onDragEnd={handleDragEnd}
              initial={reduceMotion ? false : { opacity: 0.6, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0.4, y: -48, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <StoryVideo
                story={story}
                active={!exiting}
                shouldLoad
                preload="auto"
                borderRadius={story.borderRadius}
                loop={false}
                muted={muted}
                onMutedChange={setMuted}
                onEnded={goNext}
              />
            </motion.div>

            {/* Navegação por tap (reduced motion / fallback) */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2">
              <button
                type="button"
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white"
                aria-label="Story anterior"
                onClick={goPrev}
              >
                <ChevronDown className="h-5 w-5 rotate-180" />
              </button>
              <button
                type="button"
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white"
                aria-label="Próximo story"
                onClick={goNext}
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!reduceMotion ? (
            <p
              className="pb-4 text-center text-[11px] text-white/50"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Deslize para cima para o próximo
            </p>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
