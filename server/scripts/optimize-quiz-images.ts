/**
 * Converte imagens do quiz (PNG/JPG no Storage) para WebP otimizado e atualiza as URLs no banco.
 *
 *   pnpm exec tsx --env-file=.env server/scripts/optimize-quiz-images.ts
 */
import { nanoid } from "nanoid";
import { supabase } from "../lib/supabase";
import {
  PRODUCT_IMAGES_BUCKET,
  toOptimizedWebp,
  type UploadFolder,
} from "../services/uploads";
import type { QuizQuestionRow } from "@shared/lib/quizMapper";
import type { QuizOption } from "@shared/types/quiz";

const FOLDER: UploadFolder = "quiz";

function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0] ?? "");
}

function isAlreadyWebp(url: string): boolean {
  return url.split("?")[0]?.toLowerCase().endsWith(".webp") ?? false;
}

async function convertUrl(imageUrl: string): Promise<{ newUrl: string; oldPath: string | null }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ao baixar ${imageUrl}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const webpBuffer = await toOptimizedWebp(buffer, FOLDER);
  const path = `${FOLDER}/${Date.now()}-${nanoid(8)}.webp`;

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, webpBuffer, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return {
    newUrl: data.publicUrl,
    oldPath: storagePathFromPublicUrl(imageUrl),
  };
}

async function main() {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const questions = (data ?? []) as QuizQuestionRow[];
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const question of questions) {
    const options = (question.options ?? []) as QuizOption[];
    let changed = false;
    const nextOptions: QuizOption[] = [];
    const oldPathsToDelete: string[] = [];

    for (const option of options) {
      const imageUrl = option.imageUrl?.trim() ?? "";

      if (!imageUrl) {
        nextOptions.push(option);
        continue;
      }

      if (isAlreadyWebp(imageUrl)) {
        skipped += 1;
        nextOptions.push(option);
        continue;
      }

      try {
        const beforeKb = await fetch(imageUrl, { method: "HEAD" })
          .then((r) => Number(r.headers.get("content-length") ?? 0))
          .catch(() => 0);

        const { newUrl, oldPath } = await convertUrl(imageUrl);
        const afterKb = await fetch(newUrl, { method: "HEAD" })
          .then((r) => Number(r.headers.get("content-length") ?? 0))
          .catch(() => 0);

        console.log(
          `✓ ${question.id}/${option.id}: ${(beforeKb / 1024).toFixed(0)} KB → ${(afterKb / 1024).toFixed(0)} KB`,
        );

        nextOptions.push({ ...option, imageUrl: newUrl });
        if (oldPath) oldPathsToDelete.push(oldPath);
        changed = true;
        converted += 1;
      } catch (err) {
        failed += 1;
        console.error(
          `✗ ${question.id}/${option.id}:`,
          err instanceof Error ? err.message : err,
        );
        nextOptions.push(option);
      }
    }

    if (!changed) continue;

    const { error: updateError } = await supabase
      .from("quiz_questions")
      .update({ options: nextOptions, updated_at: new Date().toISOString() })
      .eq("id", question.id);

    if (updateError) {
      console.error(`✗ Falha ao atualizar ${question.id}: ${updateError.message}`);
      continue;
    }

    if (oldPathsToDelete.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .remove(oldPathsToDelete);

      if (removeError) {
        console.warn(
          `⚠ ${question.id}: WebP ok, mas não removeu PNG antigo: ${removeError.message}`,
        );
      }
    }
  }

  console.log(`\nPronto: ${converted} convertida(s), ${skipped} já WebP, ${failed} falha(s).`);
}

main().catch((error) => {
  console.error("Erro:", error instanceof Error ? error.message : error);
  process.exit(1);
});
