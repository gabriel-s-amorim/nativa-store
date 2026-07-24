import { FeatherGreen, FeatherOrange, FeatherRed } from "@/components/NativaDecorations";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

/** Costura à mão — fundo do CTA do quiz (parallax). */
const QUIZ_CTA_BG = "/images/quiz-cta-bg.webp";

/** Convite ao Quiz de Curadoria — parallax forte no desktop e no mobile. */
export default function QuizCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  /** Desktop com mouse: janela fixed (efeito mais perceptível). Touch: scroll parallax. */
  const [useFixedWindow, setUseFixedWindow] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setUseFixedWindow(media.matches && !reduceMotion);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [reduceMotion]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || useFixedWindow ? ["0%", "0%"] : ["-32%", "32%"],
  );

  return (
    <section
      ref={sectionRef}
      className="quiz-cta-parallax relative isolate flex min-h-[520px] items-center py-28 sm:min-h-[580px] sm:py-32 md:min-h-[640px] md:py-36"
      aria-labelledby="quiz-cta-heading"
    >
      {/* Fora de overflow-hidden: fixed + clip-path da seção = janela de parallax */}
      {useFixedWindow ? (
        <div
          aria-hidden
          className="quiz-cta-parallax__bg pointer-events-none fixed inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${QUIZ_CTA_BG})`,
            backgroundPosition: "center 48%",
          }}
        />
      ) : null}

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {!useFixedWindow ? (
          <motion.div
            className="absolute inset-x-0 -top-[32%] h-[164%] w-full will-change-transform"
            style={{ y: bgY }}
          >
            <div
              className="h-full w-full bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${QUIZ_CTA_BG})`,
                backgroundPosition: "center 48%",
              }}
            />
          </motion.div>
        ) : null}

        {/* Overlay mais leve para a costura e as mãos aparecerem */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(42,28,20,0.55) 0%, rgba(61,43,31,0.48) 50%, rgba(42,28,20,0.62) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(196,82,42,0.22) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <FeatherOrange className="absolute left-[6%] top-[18%] h-14 w-6 rotate-[-22deg] opacity-30 feather-float sm:h-16 sm:w-7" />
        <FeatherGreen className="absolute right-[8%] top-[22%] h-12 w-5 rotate-[18deg] opacity-25 feather-float-delay sm:h-14 sm:w-6" />
        <FeatherRed className="absolute bottom-[16%] left-[12%] h-12 w-5 rotate-[28deg] opacity-20 feather-float-delay2 sm:h-14 sm:w-6" />
        <FeatherOrange className="absolute bottom-[20%] right-[10%] h-10 w-4 rotate-[-14deg] opacity-18 feather-float sm:h-12 sm:w-5" />
      </div>

      <motion.div
        className="relative mx-auto max-w-3xl px-6 text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.28em]"
          style={{
            color: "#F0D5C0",
            fontFamily: "'Nunito', sans-serif",
            textShadow: "0 1px 12px rgba(42,28,20,0.45)",
          }}
        >
          Quiz de Curadoria
        </p>
        <h2
          id="quiz-cta-heading"
          className="mb-4 text-3xl leading-tight text-[#FFF8F0] sm:text-4xl md:text-[2.75rem]"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            textShadow: "0 2px 24px rgba(42,28,20,0.5)",
          }}
        >
          Descubra sua bolsa ideal
        </h2>
        <p
          className="mx-auto mb-9 max-w-lg text-base leading-relaxed text-[#F5E6D8] sm:text-lg"
          style={{
            fontFamily: "'Lora', Georgia, serif",
            textShadow: "0 1px 14px rgba(42,28,20,0.45)",
          }}
        >
          Um quiz rápido de estilo para encontrar a peça que combina com a sua essência.
        </p>
        <Link
          href="/quiz"
          className="inline-flex items-center justify-center rounded-full px-9 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(42,28,20,0.4)] transition-[transform,box-shadow] duration-200 hover:scale-[1.03] hover:shadow-[0_14px_34px_rgba(196,82,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D5C0] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{
            background: "linear-gradient(135deg, #C4522A, #E8821A)",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Começar o quiz
        </Link>
      </motion.div>
    </section>
  );
}
