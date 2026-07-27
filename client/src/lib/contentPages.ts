import type { ContentPage } from "@shared/types/contentPage";

export async function fetchContentPage(slug: string): Promise<ContentPage | null> {
  try {
    const response = await fetch(`/api/pages/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Falha ao carregar página");
    return (await response.json()) as ContentPage;
  } catch {
    return null;
  }
}
