import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqContent } from "@shared/types/contentPage";

export default function FaqContentView({ content }: { content: FaqContent }) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {content.intro ? (
        <p
          className="text-center text-base leading-relaxed text-[#5C4A3A] md:text-lg"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {content.intro}
        </p>
      ) : null}

      <Accordion type="single" collapsible className="w-full">
        {content.items.map((item, index) => (
          <AccordionItem
            key={`${item.question}-${index}`}
            value={`item-${index}`}
            className="border-[#C4522A22]"
          >
            <AccordionTrigger
              className="py-5 text-left text-base font-semibold text-[#3D2B1F] hover:no-underline hover:text-[#C4522A]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <div
                className="space-y-2 pb-2 text-[15px] leading-relaxed text-[#5C4A3A]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {item.answer.split(/\n+/).map((para) =>
                  para.trim() ? <p key={para}>{para.trim()}</p> : null,
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
