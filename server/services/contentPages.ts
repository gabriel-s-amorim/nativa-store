import {
  mapContentPageInputToRow,
  mapContentPageRow,
  mapContentPageSummary,
  type ContentPageRow,
} from "@shared/lib/contentPageMapper";
import type {
  ContentPage,
  ContentPageInput,
  ContentPageSummary,
} from "@shared/types/contentPage";
import { supabase } from "../lib/supabase";

const SELECT =
  "slug, title, seo_title, seo_description, page_type, content, is_published, updated_at";

export async function listPublishedPages(): Promise<ContentPageSummary[]> {
  const { data, error } = await supabase
    .from("content_pages")
    .select(SELECT)
    .eq("is_published", true)
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar páginas: ${error.message}`);
  }

  return ((data ?? []) as ContentPageRow[]).map(mapContentPageSummary);
}

export async function listAllPages(): Promise<ContentPageSummary[]> {
  const { data, error } = await supabase
    .from("content_pages")
    .select(SELECT)
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar páginas: ${error.message}`);
  }

  return ((data ?? []) as ContentPageRow[]).map(mapContentPageSummary);
}

export async function getPublishedPageBySlug(slug: string): Promise<ContentPage | null> {
  const { data, error } = await supabase
    .from("content_pages")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar página: ${error.message}`);
  }

  if (!data) return null;
  return mapContentPageRow(data as ContentPageRow);
}

export async function getPageBySlug(slug: string): Promise<ContentPage> {
  const { data, error } = await supabase
    .from("content_pages")
    .select(SELECT)
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error(
      error.code === "PGRST116" ? "Página não encontrada" : error.message,
    );
  }

  return mapContentPageRow(data as ContentPageRow);
}

export async function updatePage(
  slug: string,
  input: ContentPageInput,
): Promise<ContentPage> {
  const row = mapContentPageInputToRow(input);

  const { data, error } = await supabase
    .from("content_pages")
    .update(row)
    .eq("slug", slug)
    .select(SELECT)
    .single();

  if (error) {
    throw new Error(
      error.code === "PGRST116"
        ? "Página não encontrada"
        : `Erro ao salvar página: ${error.message}`,
    );
  }

  return mapContentPageRow(data as ContentPageRow);
}
