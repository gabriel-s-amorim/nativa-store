import {
  mapQuestionToRow,
  mapQuizQuestionRow,
  mapQuizResultRow,
  mapResultToRow,
  toPublicQuestion,
  type QuizQuestionRow,
  type QuizResultRow,
} from "@shared/lib/quizMapper";
import { mapProductRowToProduct, type ProductRow } from "@shared/lib/productMapper";
import { getCombinationText } from "@shared/const/quizCombinations";
import type { QuizQuestionInput, QuizResultInput } from "@shared/schemas/quiz";
import type {
  QuizComparePayload,
  QuizExportPayload,
  QuizImportError,
  QuizImportReport,
  QuizPublicQuestion,
  QuizPublicResultPayload,
  QuizQuestion,
  QuizResult,
  QuizUpsertCounts,
} from "@shared/types/quiz";
import { QUIZ_RARITY_MIN_COMPLETIONS } from "@shared/types/quiz";
import { randomUUID } from "node:crypto";
import { supabase } from "../lib/supabase";

async function listQuestionRows(): Promise<QuizQuestionRow[]> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as QuizQuestionRow[];
}

async function listResultRows(): Promise<QuizResultRow[]> {
  const { data, error } = await supabase.from("quiz_results").select("*").order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as QuizResultRow[];
}

export async function listQuizQuestions(): Promise<QuizQuestion[]> {
  return (await listQuestionRows()).map(mapQuizQuestionRow);
}

export async function updateQuizOptionImage(
  questionId: string,
  optionId: string,
  imageUrl: string,
): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("id", questionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Pergunta não encontrada");
  }

  const question = mapQuizQuestionRow(data as QuizQuestionRow);
  const optionIndex = question.options.findIndex((option) => option.id === optionId);

  if (optionIndex < 0) {
    throw new Error("Opção não encontrada");
  }

  const nextOptions = question.options.map((option, index) =>
    index === optionIndex ? { ...option, imageUrl } : option,
  );

  const row = mapQuestionToRow({
    id: question.id,
    order: question.order,
    text: question.text,
    options: nextOptions,
  });

  const { data: updated, error: updateError } = await supabase
    .from("quiz_questions")
    .update(row)
    .eq("id", questionId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return mapQuizQuestionRow(updated as QuizQuestionRow);
}

export async function listQuizResults(): Promise<QuizResult[]> {
  return (await listResultRows()).map(mapQuizResultRow);
}

export async function exportQuiz(): Promise<QuizExportPayload> {
  const [questions, results] = await Promise.all([listQuizQuestions(), listQuizResults()]);
  return { questions, results };
}

export async function getPublicQuizQuestions(): Promise<QuizPublicQuestion[]> {
  const questions = await listQuizQuestions();
  return questions.map(toPublicQuestion);
}

async function upsertQuestions(inputs: QuizQuestionInput[]): Promise<QuizUpsertCounts> {
  if (inputs.length === 0) {
    return { created: 0, updated: 0 };
  }

  const ids = inputs.map((item) => item.id);
  const { data: existingRows, error: existingError } = await supabase
    .from("quiz_questions")
    .select("id")
    .in("id", ids);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingIds = new Set((existingRows ?? []).map((row) => row.id as string));
  const rows = inputs.map(mapQuestionToRow);

  const { error } = await supabase.from("quiz_questions").upsert(rows, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  const updated = ids.filter((id) => existingIds.has(id)).length;
  return { created: ids.length - updated, updated };
}

async function upsertResults(inputs: QuizResultInput[]): Promise<QuizUpsertCounts> {
  if (inputs.length === 0) {
    return { created: 0, updated: 0 };
  }

  const ids = inputs.map((item) => item.id);
  const { data: existingRows, error: existingError } = await supabase
    .from("quiz_results")
    .select("id")
    .in("id", ids);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingIds = new Set((existingRows ?? []).map((row) => row.id as string));
  const rows = inputs.map(mapResultToRow);

  const { error } = await supabase.from("quiz_results").upsert(rows, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  const updated = ids.filter((id) => existingIds.has(id)).length;
  return { created: ids.length - updated, updated };
}

export async function importQuiz(
  questions: QuizQuestionInput[],
  results: QuizResultInput[],
  errors: QuizImportError[],
): Promise<QuizImportReport> {
  const [questionCounts, resultCounts] = await Promise.all([
    upsertQuestions(questions),
    upsertResults(results),
  ]);

  return {
    questions: questionCounts,
    results: resultCounts,
    errors,
  };
}

async function loadProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from("products").select("*").in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  const products = ((data ?? []) as ProductRow[]).map(mapProductRowToProduct);
  const byId = new Map(products.map((product) => [product.id, product]));

  // Preserva a ordem do array recommendedProductIds
  return ids.map((id) => byId.get(id)).filter((product): product is NonNullable<typeof product> => !!product);
}

async function buildPublicPayload(winner: QuizResult): Promise<Omit<QuizPublicResultPayload, "resultId" | "rarityPercent">> {
  const products = await loadProductsByIds(winner.recommendedProductIds);
  return {
    result: {
      id: winner.id,
      name: winner.name,
      description: winner.description,
      tags: winner.tags,
    },
    products,
  };
}

// --- Raridade (cache em memória ~3 min) ---

const RARITY_CACHE_TTL_MS = 3 * 60 * 1000;

interface RaritySnapshot {
  total: number;
  counts: Record<string, number>;
  fetchedAt: number;
}

let rarityCache: RaritySnapshot | null = null;

async function fetchRaritySnapshot(): Promise<RaritySnapshot> {
  const now = Date.now();
  if (rarityCache && now - rarityCache.fetchedAt < RARITY_CACHE_TTL_MS) {
    return rarityCache;
  }

  const { data, error } = await supabase
    .from("quiz_completions")
    .select("result_profile_id");

  if (error) {
    throw new Error(error.message);
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = row.result_profile_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }

  rarityCache = {
    total: (data ?? []).length,
    counts,
    fetchedAt: now,
  };
  return rarityCache;
}

function rarityPercentFor(profileId: string, snapshot: RaritySnapshot): number | null {
  if (snapshot.total < QUIZ_RARITY_MIN_COMPLETIONS) return null;
  const count = snapshot.counts[profileId] ?? 0;
  return Math.round((count / snapshot.total) * 1000) / 10; // 1 casa decimal
}

function bumpRarityCache(profileId: string) {
  if (!rarityCache) return;
  rarityCache.total += 1;
  rarityCache.counts[profileId] = (rarityCache.counts[profileId] ?? 0) + 1;
}

async function recordCompletion(profileId: string): Promise<{ resultId: string; rarityPercent: number | null }> {
  const resultId = randomUUID();

  const { error } = await supabase.from("quiz_completions").insert({
    id: resultId,
    result_profile_id: profileId,
  });

  if (error) {
    throw new Error(error.message);
  }

  bumpRarityCache(profileId);

  let snapshot: RaritySnapshot;
  try {
    snapshot = await fetchRaritySnapshot();
  } catch {
    snapshot = rarityCache ?? { total: 1, counts: { [profileId]: 1 }, fetchedAt: Date.now() };
  }

  return {
    resultId,
    rarityPercent: rarityPercentFor(profileId, snapshot),
  };
}

function pickWinner(questions: QuizQuestion[], results: QuizResult[], selectedOptionIds: string[]): QuizResult {
  const optionById = new Map(
    questions.flatMap((question) => question.options.map((option) => [option.id, option] as const)),
  );

  const accumulated = new Map<string, number>();

  for (const optionId of selectedOptionIds) {
    const option = optionById.get(optionId);
    if (!option) continue;

    for (const { tag, weight } of option.tags) {
      accumulated.set(tag, (accumulated.get(tag) ?? 0) + weight);
    }
  }

  let best: QuizResult | null = null;
  let bestScore = -1;

  for (const result of results) {
    const score = result.tags.reduce((sum, tag) => sum + (accumulated.get(tag) ?? 0), 0);

    if (
      score > bestScore ||
      (score === bestScore && best !== null && result.id.localeCompare(best.id) < 0) ||
      (score === bestScore && best === null)
    ) {
      best = result;
      bestScore = score;
    }
  }

  return best ?? [...results].sort((a, b) => a.id.localeCompare(b.id))[0];
}

export async function computeQuizResult(selectedOptionIds: string[]): Promise<QuizPublicResultPayload> {
  const [questions, results] = await Promise.all([listQuizQuestions(), listQuizResults()]);

  if (results.length === 0) {
    throw new Error("Nenhum perfil de resultado cadastrado");
  }

  const winner = pickWinner(questions, results, selectedOptionIds);
  const base = await buildPublicPayload(winner);
  const { resultId, rarityPercent } = await recordCompletion(winner.id);

  return {
    ...base,
    resultId,
    rarityPercent,
  };
}

export async function getQuizResultBySessionId(resultId: string): Promise<QuizPublicResultPayload> {
  const { data, error } = await supabase
    .from("quiz_completions")
    .select("id, result_profile_id")
    .eq("id", resultId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Resultado não encontrado");
  }

  const profileId = data.result_profile_id as string;
  const results = await listQuizResults();
  const winner = results.find((r) => r.id === profileId);

  if (!winner) {
    throw new Error("Perfil de resultado não encontrado");
  }

  const base = await buildPublicPayload(winner);
  let rarityPercent: number | null = null;
  try {
    const snapshot = await fetchRaritySnapshot();
    rarityPercent = rarityPercentFor(profileId, snapshot);
  } catch {
    rarityPercent = null;
  }

  return {
    ...base,
    resultId: data.id as string,
    rarityPercent,
  };
}

export async function compareQuizResults(
  yoursResultId: string,
  friendResultId: string,
): Promise<QuizComparePayload> {
  if (yoursResultId === friendResultId) {
    throw new Error("Os dois resultados precisam ser de pessoas diferentes");
  }

  const [yours, friend] = await Promise.all([
    getQuizResultBySessionId(yoursResultId),
    getQuizResultBySessionId(friendResultId),
  ]);

  return {
    yours,
    friend,
    combinationText: getCombinationText(yours.result.id, friend.result.id),
  };
}
