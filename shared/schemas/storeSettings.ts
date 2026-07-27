import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .transform((value) => value);

export const storeSettingsSchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(200, "E-mail muito longo"),
  whatsappNumber: z
    .string()
    .trim()
    .min(10, "Informe o WhatsApp com DDI")
    .max(20, "Número muito longo")
    .regex(/^\d+$/, "Use apenas dígitos (DDI + DDD + número)"),
  whatsappDisplay: z
    .string()
    .trim()
    .min(1, "Informe o WhatsApp para exibição")
    .max(40, "Texto muito longo"),
  addressLine: z
    .string()
    .trim()
    .min(1, "Informe o endereço / cidade")
    .max(200, "Endereço muito longo"),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  twitterUrl: optionalUrl,
});

export type StoreSettingsSchemaInput = z.infer<typeof storeSettingsSchema>;
