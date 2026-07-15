import type { QuizTagWeight } from "../types/quiz";

/** Cor de destaque por tag de estilo (bordado / prévia progressiva). */
export const QUIZ_TAG_ACCENT_COLORS: Record<string, string> = {
  natureza: "#2D6A4F",
  boho: "#C9922A",
  mistico: "#7A5C9E",
  floral: "#C4522A",
  urbano: "#1B7A8C",
  classico: "#3D2B1F",
  terroso: "#8B6F5E",
  vibrante: "#E8821A",
};

/** Cor primária da marca — fallback quando a tag não tem cor. */
export const QUIZ_BRAND_ACCENT = "#C4522A";

/** Cor da tag de maior peso; fallback na cor da marca. */
export function accentColorForTags(tags: QuizTagWeight[]): string {
  if (tags.length === 0) return QUIZ_BRAND_ACCENT;
  const primary = [...tags].sort((a, b) => b.weight - a.weight || a.tag.localeCompare(b.tag))[0];
  return QUIZ_TAG_ACCENT_COLORS[primary.tag] ?? QUIZ_BRAND_ACCENT;
}
