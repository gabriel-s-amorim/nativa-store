import { supabase } from "./supabase";

/**
 * Rate limit compartilhado via Postgres (funciona entre instâncias serverless).
 * Conta eventos recentes no bucket e registra um novo hit se ainda houver cota.
 */
export async function consumeDbRateLimit(options: {
  bucket: string;
  max: number;
  windowMs: number;
}): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const since = new Date(Date.now() - options.windowMs).toISOString();

  const { count, error: countError } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("bucket", options.bucket)
    .gte("created_at", since);

  if (countError) {
    console.error("rate_limit count failed:", countError.message);
    // Fail-open leve: não derruba o endpoint se a tabela falhar, mas loga.
    return { allowed: true };
  }

  if ((count ?? 0) >= options.max) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil(options.windowMs / 1000),
    };
  }

  const { error: insertError } = await supabase
    .from("rate_limit_events")
    .insert({ bucket: options.bucket });

  if (insertError) {
    console.error("rate_limit insert failed:", insertError.message);
  }

  return { allowed: true };
}
