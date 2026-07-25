/**
 * Stories / making-of da seção "Nossa História".
 *
 * Hospede os arquivos no bucket público `story-videos` do Supabase Storage:
 *   story-videos/making-of-1.mp4
 *   story-videos/making-of-1-thumb.jpeg
 *   … (idem para 2, 3, …)
 *
 * As URLs são montadas a partir de VITE_SUPABASE_URL.
 * O vídeo toca inteiro — duração = arquivo original no Storage.
 *
 * ── Texto do painel (desktop) ──────────────────────────────────────────────
 * Edite `title`, `description` e `highlights` abaixo para cada vídeo.
 * O painel à esquerda acompanha o slide ativo do carrossel.
 */

export const STORY_VIDEOS_BUCKET = "story-videos";

export type StoryHighlight = {
  /** Rótulo à esquerda (ex.: "Feito à mão") */
  label: string;
  /** Valor à direita (ex.: "100%") */
  value: string;
};

export type StoryItem = {
  id: string;
  /** Path relativo dentro do bucket (ex.: making-of-1.mp4) */
  file: string;
  /** Thumbnail (primeiro frame — jpeg/webp/png) */
  thumb: string;
  /** border-radius assimétrico CSS — cada card com forma orgânica distinta */
  borderRadius: string;
  /** Rótulo curto opcional (dots / acessibilidade) */
  label?: string;
  /** Título do painel esquerdo — edite livremente */
  title: string;
  /** Parágrafo do painel esquerdo — edite livremente */
  description: string;
  /** Destaques/métricas opcionais sob o texto */
  highlights?: StoryHighlight[];
};

/** Texto do slide final (CTA redes) — edite aqui também. */
export const STORY_CTA_COPY = {
  title: "Continua nas redes",
  description:
    "Quer ver mais bastidores, lançamentos e o dia a dia do ateliê? Te esperamos no Instagram, Facebook e TikTok.",
  highlights: [
    { label: "Reels e novidades", value: "Semanal" },
    { label: "Bastidores reais", value: "Ao vivo" },
  ] satisfies StoryHighlight[],
};

const STORIES_META: StoryItem[] = [
  {
    id: "making-of-1",
    file: "making-of-1.mp4",
    thumb: "making-of-1-thumb.jpeg",
    borderRadius: "32px 12px 48px 16px",
    label: "Costura",
    title: "Costura à mão",
    description:
      "Cada bolsa nasce no ritmo do ateliê: a costura é feita com atenção ao caimento, à resistência e ao toque da peça. É o momento em que o tecido vira forma.",
    highlights: [
      { label: "Processo", value: "Artesanal" },
      { label: "Foco", value: "Durabilidade" },
    ],
  },
  {
    id: "making-of-2",
    file: "making-of-2.mp4",
    thumb: "making-of-2-thumb.jpeg",
    borderRadius: "16px 40px 14px 36px",
    label: "Acabamento",
    title: "Acabamento caprichado",
    description:
      "Depois da estrutura, vem o capricho: alinhamentos, reforços e o cuidado que deixa a bolsa pronta para o uso do dia a dia — sem abrir mão da beleza.",
    highlights: [
      { label: "Etapa", value: "Finalização" },
      { label: "Resultado", value: "Peça única" },
    ],
  },
  {
    id: "making-of-3",
    file: "making-of-3.mp4",
    thumb: "making-of-3-thumb.jpeg",
    borderRadius: "44px 18px 28px 40px",
    label: "Detalhes",
    title: "Detalhes que importam",
    description:
      "Zíperes, forros, alças e pequenos acabamentos fazem a diferença na experiência. Aqui o olhar se aproxima do que o cliente sente ao usar.",
    highlights: [
      { label: "Olhar", value: "Nos detalhes" },
      { label: "Qualidade", value: "No uso" },
    ],
  },
  {
    id: "making-of-4",
    file: "making-of-4.mp4",
    thumb: "making-of-4-thumb.jpeg",
    borderRadius: "16px 40px 14px 36px",
    label: "Materiais",
    title: "Escolha dos materiais",
    description:
      "Tecidos, cores e texturas são selecionados para combinar resistência e identidade Nativa. Cada escolha reforça o caráter artesanal da marca.",
    highlights: [
      { label: "Seleção", value: "Cuidadosa" },
      { label: "Estilo", value: "Autoral" },
    ],
  },
  {
    id: "making-of-5",
    file: "making-of-5.mp4",
    thumb: "making-of-5-thumb.jpeg",
    borderRadius: "16px 40px 14px 36px",
    label: "Montagem",
    title: "Montagem da peça",
    description:
      "É quando as partes se encontram: corpo, alças e acabamentos ganham unidade. Um passo a passo paciente até a bolsa tomar corpo.",
    highlights: [
      { label: "Ritmo", value: "Com calma" },
      { label: "Método", value: "Manual" },
    ],
  },
  {
    id: "making-of-6",
    file: "making-of-6.mp4",
    thumb: "making-of-6-thumb.jpeg",
    borderRadius: "16px 40px 14px 36px",
    label: "Pronta",
    title: "Peça pronta",
    description:
      "Do ateliê para você: a bolsa finalizada carrega o processo inteiro — costura, acabamento e detalhes — pronta para acompanhar o cotidiano.",
    highlights: [
      { label: "Origem", value: "Ateliê" },
      { label: "Destino", value: "Seu dia a dia" },
    ],
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
