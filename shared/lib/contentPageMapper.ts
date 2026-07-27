import type {
  ContentPage,
  ContentPageBody,
  ContentPageInput,
  ContentPageSummary,
  ContentPageType,
} from "@shared/types/contentPage";

export type ContentPageRow = {
  slug: string;
  title: string;
  seo_title: string;
  seo_description: string;
  page_type: string;
  content: unknown;
  is_published: boolean;
  updated_at: string;
};

function asPageType(value: string): ContentPageType {
  if (value === "howto" || value === "faq" || value === "sections") return value;
  return "sections";
}

export function mapContentPageRow(row: ContentPageRow): ContentPage {
  return {
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    pageType: asPageType(row.page_type),
    content: (row.content ?? {}) as ContentPageBody,
    isPublished: Boolean(row.is_published),
    updatedAt: row.updated_at,
  };
}

export function mapContentPageSummary(row: ContentPageRow): ContentPageSummary {
  return {
    slug: row.slug,
    title: row.title,
    pageType: asPageType(row.page_type),
    isPublished: Boolean(row.is_published),
    updatedAt: row.updated_at,
  };
}

export function mapContentPageInputToRow(
  input: ContentPageInput,
): Omit<ContentPageRow, "slug" | "updated_at"> & { updated_at: string } {
  return {
    title: input.title.trim(),
    seo_title: input.seoTitle.trim(),
    seo_description: input.seoDescription.trim(),
    page_type: input.pageType,
    content: input.content,
    is_published: input.isPublished,
    updated_at: new Date().toISOString(),
  };
}
