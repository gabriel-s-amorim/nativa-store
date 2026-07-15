import type { Product } from "./product";

export interface QuizTagWeight {
  tag: string;
  weight: number;
}

export interface QuizOption {
  id: string;
  label: string;
  imageUrl: string;
  tags: QuizTagWeight[];
}

/** Opção pública (sem tags/pesos; accentColor derivado da tag principal). */
export interface QuizPublicOption {
  id: string;
  label: string;
  imageUrl: string;
  accentColor: string;
}

export interface QuizQuestion {
  id: string;
  order: number;
  text: string;
  options: QuizOption[];
}

export interface QuizPublicQuestion {
  id: string;
  order: number;
  text: string;
  options: QuizPublicOption[];
}

export interface QuizResult {
  id: string;
  name: string;
  description: string;
  tags: string[];
  recommendedProductIds: number[];
}

/** Mínimo de conclusões antes de exibir raridade. */
export const QUIZ_RARITY_MIN_COMPLETIONS = 20;

export interface QuizPublicResultPayload {
  result: Omit<QuizResult, "recommendedProductIds">;
  products: Product[];
  /** Id único desta sessão de resultado (para convite / comparação). */
  resultId: string;
  /**
   * % do total de quizzes que cairam neste perfil.
   * null quando ainda há poucos dados (< QUIZ_RARITY_MIN_COMPLETIONS).
   */
  rarityPercent: number | null;
}

export interface QuizComparePayload {
  yours: QuizPublicResultPayload;
  friend: QuizPublicResultPayload;
  combinationText: string;
}

export interface QuizImportError {
  section: "questions" | "results";
  index: number;
  issues: unknown;
}

export interface QuizUpsertCounts {
  created: number;
  updated: number;
}

export interface QuizImportReport {
  questions: QuizUpsertCounts;
  results: QuizUpsertCounts;
  errors: QuizImportError[];
}

export interface QuizExportPayload {
  questions: QuizQuestion[];
  results: QuizResult[];
}
