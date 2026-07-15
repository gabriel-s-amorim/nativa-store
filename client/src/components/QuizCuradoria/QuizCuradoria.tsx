import ProgressivePreview from "@/components/QuizCuradoria/ProgressivePreview";
import QuestionCard from "@/components/QuizCuradoria/QuestionCard";
import QuizCompareScreen from "@/components/QuizCuradoria/QuizCompareScreen";
import ResultScreen from "@/components/QuizCuradoria/ResultScreen";
import { Spinner } from "@/components/ui/spinner";
import { useQuiz } from "@/hooks/useQuiz";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const REVEAL_LINES = [
  "Lendo suas escolhas…",
  "Cruzando texturas e vibes…",
  "Quase lá — preparando sua revelação…",
];

export default function QuizCuradoria() {
  const {
    phase,
    questions,
    currentQuestion,
    currentIndex,
    selectedOptionId,
    stitchingOptionId,
    resultPayload,
    comparePayload,
    error,
    progress,
    previewChoices,
    selectOption,
    onStitchComplete,
    showResult,
    showCompare,
    restart,
  } = useQuiz();

  const [revealLine, setRevealLine] = useState(0);

  useEffect(() => {
    if (phase !== "calculating") {
      setRevealLine(0);
      return;
    }
    const id = window.setInterval(() => {
      setRevealLine((prev) => (prev + 1) % REVEAL_LINES.length);
    }, 900);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "result" || phase === "compare") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase]);

  const livePreviewChoices = useMemo(() => {
    if (!selectedOptionId || !currentQuestion) return previewChoices;
    if (previewChoices.some((c) => c.id === selectedOptionId)) return previewChoices;
    const opt = currentQuestion.options.find((o) => o.id === selectedOptionId);
    if (!opt) return previewChoices;
    return [
      ...previewChoices,
      { id: opt.id, imageUrl: opt.imageUrl, accentColor: opt.accentColor },
    ];
  }, [previewChoices, selectedOptionId, currentQuestion]);

  if (phase === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-8 text-[#C4522A]" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="mb-6 text-base" style={{ color: "#5C4A3D", fontFamily: "'Lora', serif" }}>
          {error ?? "Algo deu errado."}
        </p>
        <button
          type="button"
          onClick={restart}
          className="rounded-full px-7 py-3 text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #C4522A, #E8821A)" }}
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (phase === "compare" && comparePayload) {
    return (
      <QuizCompareScreen
        payload={comparePayload}
        onContinue={showResult}
        onRestart={restart}
      />
    );
  }

  if (phase === "result" && resultPayload) {
    return (
      <ResultScreen
        payload={resultPayload}
        onRestart={restart}
        onShowCompare={comparePayload ? showCompare : undefined}
      />
    );
  }

  if (phase === "calculating") {
    return (
      <div className="relative">
        <ProgressivePreview
          choices={livePreviewChoices}
          totalQuestions={questions.length}
        />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
          <motion.div
            className="relative flex size-20 items-center justify-center"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: "radial-gradient(circle, #C4522A 0%, transparent 70%)",
              }}
            />
            <Spinner className="size-9 text-[#C4522A]" />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.p
              key={revealLine}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="text-base sm:text-lg"
              style={{ color: "#5C4A3D", fontFamily: "'Lora', Georgia, serif" }}
            >
              {REVEAL_LINES[revealLine]}
            </motion.p>
          </AnimatePresence>
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#C4522A", fontFamily: "'Nunito', sans-serif" }}
          >
            Recompensa chegando
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const remaining = questions.length - currentIndex;
  const interactionLocked = !!stitchingOptionId || !!selectedOptionId;

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <ProgressivePreview
        choices={livePreviewChoices}
        totalQuestions={questions.length}
      />

      <header className="mb-10 text-center">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "#8B6F5E", fontFamily: "'Nunito', sans-serif" }}
        >
          Curadoria Nativa
        </p>
        <h1
          className="text-3xl sm:text-4xl"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: "#3D2B1F",
          }}
        >
          Descubra sua bolsa ideal
        </h1>
        <p
          className="mx-auto mt-3 max-w-md text-sm leading-relaxed sm:text-base"
          style={{ color: "#5C4A3D", fontFamily: "'Lora', Georgia, serif" }}
        >
          Responda com o coração — a gente recomenda peças com a sua vibe.
        </p>
      </header>

      <div className="mb-8">
        <div
          className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#8B6F5E", fontFamily: "'Nunito', sans-serif" }}
        >
          <span>
            Pergunta {currentIndex + 1} de {questions.length}
          </span>
          <span>{remaining === 1 ? "Última pergunta" : `${remaining} restantes`}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#EDE4D8]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #C4522A, #E8821A)" }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <h2
            className="mb-8 text-center text-2xl leading-snug sm:text-3xl"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#3D2B1F",
            }}
          >
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {currentQuestion.options.map((option) => (
              <QuestionCard
                key={option.id}
                option={option}
                selected={selectedOptionId === option.id}
                stitching={stitchingOptionId === option.id}
                disabled={interactionLocked}
                onSelect={selectOption}
                onStitchComplete={onStitchComplete}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
