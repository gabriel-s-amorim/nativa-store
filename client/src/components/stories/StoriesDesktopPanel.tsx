import { STORIES } from "@/content/stories";
import { StoriesCarousel } from "./StoriesCarousel";

type StoriesDesktopPanelProps = {
  /** Já visível no swap — libera lazy load dos vídeos */
  active: boolean;
};

/**
 * Painel do making-of para o swap desktop dentro de #sobre.
 * (Mobile continua em StoriesSection.)
 */
export function StoriesDesktopPanel({ active }: StoriesDesktopPanelProps) {
  return (
    <div className="w-full" data-stories-desktop-panel>
      <div className="mb-6 text-center md:mb-8 md:pr-36">
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

      <StoriesCarousel stories={STORIES} nearViewport={active} />
    </div>
  );
}
