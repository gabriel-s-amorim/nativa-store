import { CONTENT_ICON_KEYS, type ContentIconKey } from "@shared/types/contentPage";
import { z } from "zod";

const iconKeySchema = z.custom<ContentIconKey>(
  (value): value is ContentIconKey =>
    typeof value === "string" &&
    (CONTENT_ICON_KEYS as readonly string[]).includes(value),
  { message: "Ícone inválido" },
);

const howToContentSchema = z.object({
  intro: z.string().trim().max(800).default(""),
  steps: z
    .array(
      z.object({
        iconKey: iconKeySchema.default("check"),
        title: z.string().trim().min(1, "Informe o título do passo").max(120),
        description: z.string().trim().min(1, "Informe a descrição").max(600),
      }),
    )
    .min(1, "Adicione ao menos um passo")
    .max(12),
  tips: z.array(z.string().trim().max(400)).max(12).default([]),
  cta: z.object({
    label: z.string().trim().min(1).max(80),
    href: z.string().trim().min(1).max(300),
  }),
});

const sectionsContentSchema = z.object({
  intro: z.string().trim().max(800).default(""),
  sections: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Informe o título da seção").max(160),
        body: z.string().trim().min(1, "Informe o texto").max(4000),
      }),
    )
    .min(1, "Adicione ao menos uma seção")
    .max(20),
  highlights: z
    .array(
      z.object({
        iconKey: iconKeySchema.default("check"),
        title: z.string().trim().min(1).max(80),
        text: z.string().trim().min(1).max(240),
      }),
    )
    .max(6)
    .default([]),
});

const faqContentSchema = z.object({
  intro: z.string().trim().max(800).default(""),
  items: z
    .array(
      z.object({
        question: z.string().trim().min(1, "Informe a pergunta").max(240),
        answer: z.string().trim().min(1, "Informe a resposta").max(2000),
      }),
    )
    .min(1, "Adicione ao menos uma pergunta")
    .max(40),
});

export const contentPageSchema = z
  .object({
    title: z.string().trim().min(1, "Informe o título").max(120),
    seoTitle: z.string().trim().min(1, "Informe o título SEO").max(70),
    seoDescription: z
      .string()
      .trim()
      .min(1, "Informe a meta description")
      .max(180),
    pageType: z.enum(["howto", "sections", "faq"]),
    content: z.unknown(),
    isPublished: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const schema =
      data.pageType === "howto"
        ? howToContentSchema
        : data.pageType === "faq"
          ? faqContentSchema
          : sectionsContentSchema;
    const parsed = schema.safeParse(data.content);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({
          ...issue,
          path: ["content", ...issue.path],
        });
      }
    }
  })
  .transform((data) => {
    const schema =
      data.pageType === "howto"
        ? howToContentSchema
        : data.pageType === "faq"
          ? faqContentSchema
          : sectionsContentSchema;
    return {
      ...data,
      content: schema.parse(data.content),
    };
  });

export type ContentPageSchemaInput = z.infer<typeof contentPageSchema>;
