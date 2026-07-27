/** Páginas de conteúdo institucional / ajuda (CMS). */

export type ContentPageType = "howto" | "sections" | "faq";

export type ContentIconKey =
  | "search"
  | "eye"
  | "heart"
  | "cart"
  | "creditCard"
  | "package"
  | "truck"
  | "calendar"
  | "shield"
  | "messageCircle"
  | "mapPin"
  | "sparkles"
  | "rotateCcw"
  | "check";

export type HowToStep = {
  iconKey: ContentIconKey;
  title: string;
  description: string;
};

export type HowToContent = {
  intro: string;
  steps: HowToStep[];
  tips: string[];
  cta: { label: string; href: string };
};

export type SectionBlock = {
  title: string;
  body: string;
};

export type SectionHighlight = {
  iconKey: ContentIconKey;
  title: string;
  text: string;
};

export type SectionsContent = {
  intro: string;
  sections: SectionBlock[];
  highlights: SectionHighlight[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqContent = {
  intro: string;
  items: FaqItem[];
};

export type ContentPageBody = HowToContent | SectionsContent | FaqContent;

export type ContentPage = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  pageType: ContentPageType;
  content: ContentPageBody;
  isPublished: boolean;
  updatedAt: string;
};

export type ContentPageSummary = {
  slug: string;
  title: string;
  pageType: ContentPageType;
  isPublished: boolean;
  updatedAt: string;
};

export type ContentPageInput = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  pageType: ContentPageType;
  content: ContentPageBody;
  isPublished: boolean;
};

export const HELP_PAGE_SLUGS = [
  "como-comprar",
  "trocas-e-devolucoes",
  "frete-e-entrega",
  "perguntas-frequentes",
] as const;

export type HelpPageSlug = (typeof HELP_PAGE_SLUGS)[number];

export const CONTENT_ICON_KEYS: ContentIconKey[] = [
  "search",
  "eye",
  "heart",
  "cart",
  "creditCard",
  "package",
  "truck",
  "calendar",
  "shield",
  "messageCircle",
  "mapPin",
  "sparkles",
  "rotateCcw",
  "check",
];
