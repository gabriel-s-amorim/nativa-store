import type {
  QuizComparePayload,
  QuizPublicQuestion,
  QuizPublicResultPayload,
} from "@shared/types/quiz";

async function parseJsonSafe(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchQuizQuestions(): Promise<QuizPublicQuestion[]> {
  const response = await fetch("/api/quiz");
  const body = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(body?.error ?? "Não foi possível carregar o quiz");
  }

  return Array.isArray(body?.questions) ? body.questions : [];
}

export async function submitQuizResult(
  selectedOptionIds: string[],
): Promise<QuizPublicResultPayload> {
  const response = await fetch("/api/quiz/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectedOptionIds }),
  });
  const body = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(body?.error ?? "Não foi possível calcular o resultado");
  }

  return body as QuizPublicResultPayload;
}

export async function fetchQuizResultById(resultId: string): Promise<QuizPublicResultPayload> {
  const response = await fetch(`/api/quiz/result/${encodeURIComponent(resultId)}`);
  const body = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(body?.error ?? "Não foi possível carregar o resultado");
  }

  return body as QuizPublicResultPayload;
}

export async function compareQuizResults(
  yoursResultId: string,
  friendResultId: string,
): Promise<QuizComparePayload> {
  const response = await fetch("/api/quiz/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ yoursResultId, friendResultId }),
  });
  const body = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(body?.error ?? "Não foi possível comparar os resultados");
  }

  return body as QuizComparePayload;
}
