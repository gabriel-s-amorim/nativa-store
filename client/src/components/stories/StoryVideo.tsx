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
 * Player de story: tenta autoplay COM som; se o navegador bloquear,
 * cai para mudo e mantém o botão de som.
 * O vídeo toca na duração original do arquivo (sem corte).
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
  const [internalMuted, setInternalMuted] = useState(false);
  const muted = mutedProp ?? internalMuted;

  const setMuted = (next: boolean) => {
    if (onMutedChange) onMutedChange(next);
    else setInternalMuted(next);
  };

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad) return;

    if (!active) {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        /* ignore seek em src ainda não pronto */
      }
      return;
    }

    let cancelled = false;

    const play = async () => {
      // 1) Tenta com som (preferência)
      el.muted = false;
      try {
        await el.play();
        if (!cancelled) setMuted(false);
        return;
      } catch {
        /* política do browser — segue para mudo */
      }

      if (cancelled) return;

      // 2) Fallback: autoplay mudo (exigência comum em Chrome/Safari)
      el.muted = true;
      if (!cancelled) setMuted(true);
      try {
        await el.play();
      } catch {
        /* thumbnail permanece */
      }
    };

    void play();

    return () => {
      cancelled = true;
    };
    // Só reage a troca de slide / carga — mute manual é tratado no toggle
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setMuted estável o suficiente aqui
  }, [active, shouldLoad, story.videoUrl]);

  // Sincroniza atributo muted quando o usuário altera o botão
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

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#3D2B1F] ${className}`}
      style={{ borderRadius }}
    >
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
