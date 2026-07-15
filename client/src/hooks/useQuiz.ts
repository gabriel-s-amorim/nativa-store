import {
  compareQuizResults,
  fetchQuizQuestions,
  submitQuizResult,
} from "@/lib/quizApi";
import type {
  QuizComparePayload,
  QuizPublicOption,
  QuizPublicQuestion,
  QuizPublicResultPayload,
} from "@shared/types/quiz";
import { useCallback, useEffect, useMemo, useState } from "react";

type QuizPhase =
  | "loading"
  | "questions"
  | "calculating"
  | "result"
  | "compare"
  | "error";

const INVITE_STORAGE_KEY = "nativa:quiz-invite-result-id";

export function readInviteResultId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("convite");
    if (fromQuery?.trim()) {
      sessionStorage.setItem(INVITE_STORAGE_KEY, fromQuery.trim());
      return fromQuery.trim();
    }
    return sessionStorage.getItem(INVITE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearInviteResultId() {
  try {
    sessionStorage.removeItem(INVITE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useQuiz() {
  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [questions, setQuestions] = useState<QuizPublicQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [stitchingOptionId, setStitchingOptionId] = useState<string | null>(null);
  const [resultPayload, setResultPayload] = useState<QuizPublicResultPayload | null>(null);
  const [comparePayload, setComparePayload] = useState<QuizComparePayload | null>(null);
  const [inviteResultId, setInviteResultId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPhase("loading");
    setError(null);
    setCurrentIndex(0);
    setSelectedOptionIds([]);
    setSelectedOptionId(null);
    setStitchingOptionId(null);
    setResultPayload(null);
    setComparePayload(null);
    setInviteResultId(readInviteResultId());

    try {
      const data = await fetchQuizQuestions();
      if (data.length === 0) {
        setError("O quiz ainda não está disponível. Volte em breve.");
        setPhase("error");
        return;
      }
      setQuestions(data);
      setPhase("questions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar o quiz");
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const finish = useCallback(async (answers: string[]) => {
    setPhase("calculating");
    try {
      const payload = await submitQuizResult(answers);
      setResultPayload(payload);

      const friendId = readInviteResultId();
      if (friendId && friendId !== payload.resultId) {
        try {
          const compared = await compareQuizResults(payload.resultId, friendId);
          setComparePayload(compared);
          setPhase("compare");
          return;
        } catch {
          // Se a comparação falhar, segue para o resultado normal
        }
      }

      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao calcular o resultado");
      setPhase("error");
    }
  }, []);

  const selectOption = useCallback(
    (optionId: string) => {
      if (phase !== "questions" || stitchingOptionId || selectedOptionId) return;
      setSelectedOptionId(optionId);
      setStitchingOptionId(optionId);
    },
    [phase, stitchingOptionId, selectedOptionId],
  );

  const onStitchComplete = useCallback(
    (optionId: string) => {
      if (stitchingOptionId !== optionId) return;

      const nextAnswers = [...selectedOptionIds, optionId];
      setSelectedOptionIds(nextAnswers);
      setStitchingOptionId(null);

      const isLast = currentIndex >= questions.length - 1;
      if (isLast) {
        void finish(nextAnswers);
        return;
      }
      setCurrentIndex((index) => index + 1);
      setSelectedOptionId(null);
    },
    [stitchingOptionId, selectedOptionIds, currentIndex, questions.length, finish],
  );

  const showResult = useCallback(() => {
    setPhase("result");
  }, []);

  const showCompare = useCallback(() => {
    if (comparePayload) setPhase("compare");
  }, [comparePayload]);

  const restart = useCallback(() => {
    clearInviteResultId();
    setInviteResultId(null);
    void load();
  }, [load]);

  const currentQuestion = questions[currentIndex] ?? null;
  const progress =
    questions.length === 0
      ? 0
      : phase === "result" || phase === "compare"
        ? 100
        : ((currentIndex + (selectedOptionId ? 1 : 0)) / questions.length) * 100;

  const previewChoices = useMemo(() => {
    const byId = new Map<string, QuizPublicOption>();
    for (const q of questions) {
      for (const opt of q.options) byId.set(opt.id, opt);
    }
    return selectedOptionIds
      .map((id) => byId.get(id))
      .filter((opt): opt is QuizPublicOption => !!opt)
      .map((opt) => ({
        id: opt.id,
        imageUrl: opt.imageUrl,
        accentColor: opt.accentColor,
      }));
  }, [questions, selectedOptionIds]);

  return {
    phase,
    questions,
    currentQuestion,
    currentIndex,
    selectedOptionId,
    stitchingOptionId,
    resultPayload,
    comparePayload,
    inviteResultId,
    error,
    progress,
    previewChoices,
    selectOption,
    onStitchComplete,
    showResult,
    showCompare,
    restart,
  };
}
