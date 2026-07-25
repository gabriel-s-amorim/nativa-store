/**
 * Criptografa client_secret / access_token / refresh_token do Melhor Envio
 * que ainda estejam em texto puro no Supabase.
 *
 *   pnpm exec tsx --env-file=.env server/scripts/encrypt-melhor-envio-secrets.ts
 *
 * Requer MELHOR_ENVIO_ENCRYPTION_KEY (>= 32 caracteres) no .env e no Vercel.
 */
import {
  encryptSecret,
  isEncryptedSecret,
  type SecretEncryptionKey,
} from "../lib/secretCrypto";
import { supabase } from "../lib/supabase";

const ME_KEY: SecretEncryptionKey = "MELHOR_ENVIO_ENCRYPTION_KEY";

const SECRET_COLUMNS = [
  "production_client_secret",
  "production_access_token",
  "production_refresh_token",
  "sandbox_client_secret",
  "sandbox_access_token",
  "sandbox_refresh_token",
] as const;

async function main() {
  const { data, error } = await supabase
    .from("melhor_envio_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    console.log("Nenhuma linha em melhor_envio_settings — nada a fazer.");
    return;
  }

  const patch: Record<string, string> = {};
  let converted = 0;
  let skipped = 0;

  for (const column of SECRET_COLUMNS) {
    const raw = data[column];
    if (typeof raw !== "string" || !raw.trim()) {
      skipped += 1;
      continue;
    }
    if (isEncryptedSecret(raw)) {
      skipped += 1;
      continue;
    }
    patch[column] = encryptSecret(raw, ME_KEY);
    converted += 1;
    console.log(`✓ ${column} (${raw.length} chars → criptografado)`);
  }

  if (converted === 0) {
    console.log("Nada pendente — todos os segredos já estão criptografados ou vazios.");
    return;
  }

  const { error: updateError } = await supabase
    .from("melhor_envio_settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", "default");

  if (updateError) {
    throw new Error(updateError.message);
  }

  console.log(`\nPronto: ${converted} campo(s) criptografado(s), ${skipped} ignorado(s).`);
}

main().catch((error) => {
  console.error("Erro:", error instanceof Error ? error.message : error);
  process.exit(1);
});
