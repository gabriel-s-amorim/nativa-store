import { ContentIcon } from "@/components/help/ContentIcon";
import type { HowToContent } from "@shared/types/contentPage";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";

export default function HowToContentView({ content }: { content: HowToContent }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-14">
      {content.intro ? (
        <p
          className="mx-auto max-w-2xl text-center text-base leading-relaxed text-[#5C4A3A] md:text-lg"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {content.intro}
        </p>
      ) : null}

      <ol className="relative mx-auto max-w-2xl space-y-5">
        <div
          className="pointer-events-none absolute top-6 bottom-6 left-7 w-px md:left-8"
          style={{
            background:
              "linear-gradient(180deg, transparent, #C4522A55 10%, #C4522A55 90%, transparent)",
          }}
          aria-hidden
        />

        {content.steps.map((step, index) => (
          <motion.li
            key={`${step.title}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="relative grid grid-cols-[3.5rem_1fr] gap-4 md:grid-cols-[4rem_1fr] md:gap-5"
          >
            <div className="relative z-10 flex justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm md:h-16 md:w-16"
                style={{
                  background: "linear-gradient(145deg, #C4522A, #E8821A)",
                }}
                aria-hidden
              >
                <ContentIcon iconKey={step.iconKey} size={24} />
              </div>
            </div>

            <div
              className="rounded-2xl px-5 py-4 md:px-6 md:py-5"
              style={{
                background: "linear-gradient(160deg, #FFFFFFEE, #F7F0E4CC)",
                border: "1px solid #C4522A14",
              }}
            >
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4522A]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Passo {String(index + 1).padStart(2, "0")}
              </p>
              <h3
                className="mb-2 text-lg font-semibold text-[#3D2B1F] md:text-xl"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed text-[#5C4A3A] md:text-[15px]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {step.description}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      {content.tips.length > 0 ? (
        <div className="mx-auto max-w-3xl">
          <h2
            className="mb-5 text-center text-xl font-semibold text-[#3D2B1F]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Dicas rápidas
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {content.tips.map((tip) => (
              <li
                key={tip}
                className="rounded-2xl px-4 py-4 text-sm leading-relaxed text-[#5C4A3A]"
                style={{
                  background: "linear-gradient(160deg, #FFFFFFCC, #F8F1E6)",
                  border: "1px solid #C4522A18",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {content.cta?.label && content.cta?.href ? (
        <div className="flex justify-center pt-2">
          {content.cta.href.startsWith("http") || content.cta.href.includes("#") ? (
            <a
              href={content.cta.href}
              className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #C4522A, #E8821A)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {content.cta.label}
            </a>
          ) : (
            <Link
              href={content.cta.href}
              className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #C4522A, #E8821A)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {content.cta.label}
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
