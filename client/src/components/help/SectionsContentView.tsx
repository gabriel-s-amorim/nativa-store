import { ContentIcon } from "@/components/help/ContentIcon";
import type { SectionsContent } from "@shared/types/contentPage";
import { motion, useReducedMotion } from "framer-motion";

export default function SectionsContentView({
  content,
}: {
  content: SectionsContent;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-12">
      {content.intro ? (
        <p
          className="mx-auto max-w-2xl text-center text-base leading-relaxed text-[#5C4A3A] md:text-lg"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {content.intro}
        </p>
      ) : null}

      {content.highlights.length > 0 ? (
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {content.highlights.map((item, index) => (
            <motion.div
              key={`${item.title}-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl px-5 py-6 text-center"
              style={{
                background: "linear-gradient(165deg, #FFFFFFD9, #F3E8D8AA)",
                border: "1px solid #1A3D2B14",
              }}
            >
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-[#C4522A]"
                style={{ background: "#C4522A14" }}
              >
                <ContentIcon iconKey={item.iconKey} size={22} />
              </div>
              <h3
                className="mb-1.5 text-base font-semibold text-[#3D2B1F]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm leading-relaxed text-[#5C4A3A]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl space-y-8">
        {content.sections.map((section, index) => (
          <motion.section
            key={`${section.title}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4 }}
            className="relative pl-5"
            style={{ borderLeft: "3px solid #C4522A55" }}
          >
            <h2
              className="mb-3 text-xl font-semibold text-[#3D2B1F]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {section.title}
            </h2>
            <div
              className="space-y-3 text-[15px] leading-relaxed text-[#5C4A3A]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {section.body.split(/\n+/).map((para) =>
                para.trim() ? <p key={para}>{para.trim()}</p> : null,
              )}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
