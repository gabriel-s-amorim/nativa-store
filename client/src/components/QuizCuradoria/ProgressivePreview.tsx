/**
 * Prévia progressiva do resultado: silhueta de bolsa que ganha
 * mosaico/cores das opções já escolhidas — sutil, canto da tela.
 */

import { motion, AnimatePresence } from "framer-motion";

export interface PreviewChoice {
  id: string;
  imageUrl: string;
  accentColor: string;
}

interface ProgressivePreviewProps {
  choices: PreviewChoice[];
  totalQuestions: number;
}

export default function ProgressivePreview({
  choices,
  totalQuestions,
}: ProgressivePreviewProps) {
  if (totalQuestions <= 0) return null;

  const filled = choices.length;
  const progress = Math.min(filled / totalQuestions, 1);

  return (
    <aside
      className="pointer-events-none fixed z-30"
      style={{
        top: "max(5.5rem, env(safe-area-inset-top, 0px) + 4.5rem)",
        right: "max(0.75rem, env(safe-area-inset-right, 0px))",
      }}
      aria-hidden
    >
      <div className="relative flex flex-col items-center gap-1.5">
        <div
          className="relative overflow-hidden"
          style={{
            width: 52,
            height: 64,
            opacity: 0.55 + progress * 0.35,
            filter: `drop-shadow(0 2px 8px rgba(61,43,31,${0.08 + progress * 0.12}))`,
          }}
        >
          {/* Silhueta de bolsa */}
          <svg
            viewBox="0 0 52 64"
            className="absolute inset-0 h-full w-full"
            style={{ zIndex: 2 }}
          >
            <defs>
              <clipPath id="bag-clip">
                <path d="M10 22 C10 18 14 15 18 15 L34 15 C38 15 42 18 42 22 L44 54 C44 58 40 60 36 60 L16 60 C12 60 8 58 8 54 Z" />
              </clipPath>
            </defs>
            {/* Alça */}
            <path
              d="M18 16 C18 8 34 8 34 16"
              fill="none"
              stroke="#3D2B1F"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity={0.35 + progress * 0.4}
            />
            {/* Contorno */}
            <path
              d="M10 22 C10 18 14 15 18 15 L34 15 C38 15 42 18 42 22 L44 54 C44 58 40 60 36 60 L16 60 C12 60 8 58 8 54 Z"
              fill="none"
              stroke="#3D2B1F"
              strokeWidth="1.75"
              opacity={0.4 + progress * 0.35}
            />
          </svg>

          {/* Mosaico / cores dentro da silhueta */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "path('M10 22 C10 18 14 15 18 15 L34 15 C38 15 42 18 42 22 L44 54 C44 58 40 60 36 60 L16 60 C12 60 8 58 8 54 Z')",
              WebkitClipPath:
                "path('M10 22 C10 18 14 15 18 15 L34 15 C38 15 42 18 42 22 L44 54 C44 58 40 60 36 60 L16 60 C12 60 8 58 8 54 Z')",
              background: "#EDE4D8",
              top: 0,
              left: 0,
              width: 52,
              height: 64,
            }}
          >
            <div
              className="grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${Math.max(filled, 1)}, 1fr)`,
              }}
            >
              <AnimatePresence initial={false}>
                {choices.map((choice) => (
                  <motion.div
                    key={choice.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="relative h-full min-h-0 overflow-hidden"
                    style={{ background: choice.accentColor }}
                  >
                    <img
                      src={choice.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ opacity: 0.72, mixBlendMode: "multiply" }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: choice.accentColor,
                        opacity: 0.28,
                        mixBlendMode: "color",
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Pontinhos de progresso */}
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <span
              key={i}
              className="block rounded-full transition-all duration-300"
              style={{
                width: i < filled ? 6 : 4,
                height: i < filled ? 6 : 4,
                background:
                  i < filled
                    ? choices[i]?.accentColor ?? "#C4522A"
                    : "rgba(61,43,31,0.18)",
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
