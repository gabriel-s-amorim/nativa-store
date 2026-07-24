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
  /** Se true, o elemento <video> recebe src e tenta play */
  active: boolean;
  /** Carrega o src (ativo ou vizinho mais próximo) */
  shouldLoad: boolean;
  /** Preload hint do navegador */
  preload?: "none" | "metadata" | "auto";
  className?: string;
  borderRadius: string;
  /** Loop no carrossel desktop; no imersivo costuma avançar no ended */
  loop?: boolean;
  onEnded?: () => void;
  /** Mute compartilhado entre slides (opcional) */
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
};

/**
 * Player de story: autoplay mudo, botão de som, lazy src.
 * Não monta o src até `shouldLoad` — evita baixar os 3 vídeos de uma vez.
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
}: StoryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [internalMuted, setInternalMuted] = useState(true);
  const muted = mutedProp ?? internalMuted;

  const setMuted = (next: boolean) => {
    if (onMutedChange) onMutedChange(next);
    else setInternalMuted(next);
  };

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad) return;

    if (active) {
      el.muted = muted;
      const playPromise = el.play();
      if (playPromise) {
        playPromise.catch(() => {
          /* autoplay bloqueado — thumbnail permanece */
        });
      }
    } else {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        /* ignore seek em src ainda não pronto */
      }
    }
  }, [active, shouldLoad, muted, story.videoUrl]);

  const toggleMute = (event: MouseEvent | PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setMuted(!muted);
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#3D2B1F] ${className}`}
      style={{ borderRadius }}
    >
      {/* Thumbnail sempre visível por baixo (fallback / laterais) */}
      <img
        src={story.thumbnailUrl || undefined}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
        aria-hidden
      />

      {shouldLoad && story.videoUrl ? (
        <video
          ref={videoRef}
          key={story.id}
          src={story.videoUrl}
          poster={story.thumbnailUrl || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted={muted}
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
