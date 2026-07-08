import { z } from "zod";

export const customerProfileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo").max(120, "Nome muito longo"),
  phone: z
    .string()
    .trim()
    .max(30, "Telefone muito longo")
    .optional()
    .or(z.literal("")),
});

export type CustomerProfileUpdateInput = z.infer<typeof customerProfileUpdateSchema>;

