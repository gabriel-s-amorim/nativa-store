import StitchBorder from "@/components/ui/StitchBorder";
import { STITCH_DURATION_QUIZ_MS } from "@/hooks/useStitchAnimation";
import { QUIZ_BRAND_ACCENT } from "@shared/const/quizTagColors";
import type { QuizPublicOption } from "@shared/types/quiz";
import { motion } from "framer-motion";

interface QuestionCardProps {
  option: QuizPublicOption;
  selected: boolean;
  stitching: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
  onStitchComplete: (optionId: string) => void;
}

export default function QuestionCard({
  option,
  selected,
  stitching,
  disabled,
  onSelect,
  onStitchComplete,
}: QuestionCardProps) {
  const accent = option.accentColor || QUIZ_BRAND_ACCENT;

  return (
    <motion.button
      type="button"
      layout
      disabled={disabled}
      onClick={() => onSelect(option.id)}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      animate={{
        scale: selected ? 1.02 : 1,
        boxShadow: selected
          ? `0 12px 32px ${accent}40`
          : "0 4px 16px rgba(61, 43, 31, 0.08)",
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="group relative w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4522A]/60 disabled:cursor-default"
      style={{
        background: "#FFFaf5",
        border: selected ? `2px solid ${accent}` : "2px solid transparent",
        opacity: disabled && !selected ? 0.72 : 1,
      }}
    >
      <StitchBorder
        active={stitching}
        color={accent}
        durationMs={STITCH_DURATION_QUIZ_MS}
        onComplete={() => onStitchComplete(option.id)}
      />

      <div className="aspect-[4/5] w-full overflow-hidden rounded-t-[0.9rem] bg-[#EDE4D8]">
        <img
          src={option.imageUrl}
          alt={option.label}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="px-4 py-3.5">
        <p
          className="text-sm font-semibold leading-snug sm:text-base"
          style={{ color: "#3D2B1F", fontFamily: "'Nunito', sans-serif" }}
        >
          {option.label}
        </p>
      </div>
    </motion.button>
  );
}
