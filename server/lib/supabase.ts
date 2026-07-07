import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL?.trim();
const secretKey = (
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim();

if (!url || !secretKey) {
  throw new Error(
    "Configure SUPABASE_URL e SUPABASE_SECRET_KEY no arquivo .env",
  );
}

if (
  secretKey.includes("COLE_") ||
  secretKey.includes("sua_chave") ||
  !secretKey.startsWith("sb_secret_") && !secretKey.startsWith("eyJ")
) {
  throw new Error(
    "SUPABASE_SECRET_KEY inválida. Use a Secret key (sb_secret_...) ou service_role (eyJ...) do Supabase.",
  );
}

export const supabase = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
