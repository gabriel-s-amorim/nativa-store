import type { CustomerProfileUpdateInput } from "@shared/schemas/customer";
import { customerProfileUpdateSchema } from "@shared/schemas/customer";
import type { CustomerProfile } from "@shared/types/customer";
import { Router } from "express";
import { supabase } from "../lib/supabase";
import type { CustomerAuthRequest } from "../middleware/requireCustomer";
import { requireCustomer } from "../middleware/requireCustomer";

const router = Router();

function mapCustomerProfileRowToCustomerProfile(row: any): CustomerProfile {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? ""),
    phone: row.phone == null ? null : String(row.phone),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

router.get("/me", requireCustomer, async (req: CustomerAuthRequest, res) => {
  try {
    const userId = req.customerUserId!;

    const { data, error } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (!data) {
      // O trigger deveria ter criado, mas garantimos um fallback seguro.
      const { data: created, error: insertError } = await supabase
        .from("customer_profiles")
        .insert({ id: userId })
        .select("*")
        .single();

      if (insertError) {
        res.status(500).json({ error: insertError.message });
        return;
      }

      res.json(mapCustomerProfileRowToCustomerProfile(created));
      return;
    }

    res.json(mapCustomerProfileRowToCustomerProfile(data));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erro ao carregar perfil" });
  }
});

router.put("/me", requireCustomer, async (req: CustomerAuthRequest, res) => {
  try {
    const userId = req.customerUserId!;
    const parsed = customerProfileUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const input: CustomerProfileUpdateInput = parsed.data;

    const { data, error } = await supabase
      .from("customer_profiles")
      .update({
        full_name: input.fullName,
        phone: input.phone ? input.phone : null,
      })
      .eq("id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (!data) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    res.json(mapCustomerProfileRowToCustomerProfile(data));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Erro ao atualizar perfil" });
  }
});

export default router;

