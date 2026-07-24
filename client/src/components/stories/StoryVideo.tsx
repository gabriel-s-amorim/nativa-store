import { Volume2, VolumeX } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type { StoryWithUrls } from "@/content/stories";

type StoryVideoProps = {
  story: StoryWithUrls;
  active: boolean;
  shouldLoad: boolean;
  preload?: "none" | "metadata" | "auto";
  className?: string;
  borderRadius: string;
  loop?: boolean;
  onEnded?: () => void;
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  /** contain = vídeo inteiro sem corte (ativo); cover = laterais */
  fit?: "cover" | "contain";
};

/**
 * Player de story: autoplay com som (fallback mudo se o browser bloquear).
 * Sem thumb no Storage, usa o próprio vídeo pausado como preview.
 */
export function StoryVideo({
  story,
  active,
  shouldLoad,
  preload = "none",
  className = "",
  borderRadius,
  loop = true,
  onEnded,
  muted: mutedProp,
  onMutedChange,
  fit = "cover",
}: StoryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [internalMuted, setInternalMuted] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const muted = mutedProp ?? internalMuted;
  const hasThumb = Boolean(story.thumbnailUrl) && !thumbFailed;

  const setMuted = (next: boolean) => {
    if (onMutedChange) onMutedChange(next);
    else setInternalMuted(next);
  };

  useEffect(() => {
    setThumbFailed(false);
  }, [story.id, story.thumbnailUrl]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad) return;

    if (!active) {
      el.pause();
      try {
        el.currentTime = 0.05;
      } catch {
        /* ignore */
      }
      return;
    }

    let cancelled = false;

    const play = async () => {
      el.muted = false;
      try {
        await el.play();
        if (!cancelled) setMuted(false);
        return;
      } catch {
        /* autoplay com som bloqueado */
      }

      if (cancelled) return;

      el.muted = true;
      if (!cancelled) setMuted(true);
      try {
        await el.play();
      } catch {
        /* thumbnail / frame permanece */
      }
    };

    void play();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, shouldLoad, story.videoUrl]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !active) return;
    el.muted = muted;
  }, [muted, active]);

  const toggleMute = (event: MouseEvent | PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const next = !muted;
    setMuted(next);
    const el = videoRef.current;
    if (!el) return;
    el.muted = next;
    if (!next) {
      void el.play().catch(() => {
        /* ignore */
      });
    }
  };

  // #t=0.1 ajuda o browser a mostrar o 1º frame quando não há thumb
  const videoSrc =
    story.videoUrl && !active
      ? `${story.videoUrl}#t=0.1`
      : story.videoUrl;

  const objectFit = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#3D2B1F] ${className}`}
      style={{ borderRadius }}
    >
      {hasThumb ? (
        <img
          src={story.thumbnailUrl}
          alt=""
          className={`absolute inset-0 h-full w-full ${objectFit}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          aria-hidden
          onError={() => setThumbFailed(true)}
        />
      ) : null}

      {shouldLoad && story.videoUrl ? (
        <video
          ref={videoRef}
          key={story.id}
          src={videoSrc}
          poster={hasThumb ? story.thumbnailUrl : undefined}
          className={`absolute inset-0 h-full w-full ${objectFit}`}
          playsInline
          muted={muted || !active}
          loop={loop}
          preload={preload}
          onEnded={onEnded}
          aria-label={story.label ?? "Vídeo do making of"}
        />
      ) : null}

      {active ? (
        <button
          type="button"
          onClick={toggleMute}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
          aria-label={muted ? "Ativar som" : "Desativar som"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      ) : null}
    </div>
  );
}
