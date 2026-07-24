/**
 * Stories / making-of da seção "Nossa História".
 *
 * Hospede os arquivos no bucket público `story-videos` do Supabase Storage:
 *   story-videos/making-of-1.mp4
 *   story-videos/making-of-1-thumb.webp
 *   … (idem para 2 e 3)
 *
 * As URLs são montadas a partir de VITE_SUPABASE_URL.
 * Após o upload, confira no dashboard se o path bate com `file` / `thumb` abaixo.
 */

export const STORY_VIDEOS_BUCKET = "story-videos";

export type StoryItem = {
  id: string;
  /** Path relativo dentro do bucket (ex.: making-of-1.mp4) */
  file: string;
  /** Thumbnail (primeiro frame ou WebP estático) */
  thumb: string;
  /** Duração aproximada em segundos (indicadores / acessibilidade) */
  durationSec: number;
  /** border-radius assimétrico CSS — cada card com forma orgânica distinta */
  borderRadius: string;
  /** Rótulo curto opcional */
  label?: string;
};

const STORIES_META: StoryItem[] = [
  {
    id: "making-of-1",
    file: "making-of-1.mp4",
    thumb: "making-of-1-thumb.webp",
    durationSec: 18,
    borderRadius: "32px 12px 48px 16px",
    label: "Costura",
  },
  {
    id: "making-of-2",
    file: "making-of-2.mp4",
    thumb: "making-of-2-thumb.webp",
    durationSec: 22,
    borderRadius: "16px 40px 14px 36px",
    label: "Acabamento",
  },
  {
    id: "making-of-3",
    file: "making-of-3.mp4",
    thumb: "making-of-3-thumb.webp",
    durationSec: 15,
    borderRadius: "44px 18px 28px 40px",
    label: "Detalhes",
  },
];

export type StoryWithUrls = StoryItem & {
  videoUrl: string;
  thumbnailUrl: string;
};

function supabasePublicUrl(path: string): string {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  );
  if (!base) return "";
  return `${base}/storage/v1/object/public/${STORY_VIDEOS_BUCKET}/${path}`;
}

/** Stories prontas para o player (URLs públicas do Storage). */
export function getStories(): StoryWithUrls[] {
  return STORIES_META.map((story) => ({
    ...story,
    videoUrl: supabasePublicUrl(story.file),
    thumbnailUrl: supabasePublicUrl(story.thumb),
  }));
}

export const STORIES = getStories();
