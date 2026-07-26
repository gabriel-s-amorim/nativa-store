import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env do frontend",
  );
}

let client: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Carrega @supabase/supabase-js sob demanda (após o first paint).
 * Evita puxar ~55KB gzip no caminho crítico da PDP / loja pública.
 * Sessão continua persistida em localStorage — getSession() após o load
 * restaura o utilizador sem race no render inicial (auth fica isLoading).
 */
export function getSupabaseClient(): Promise<SupabaseClient> {
  if (client) return Promise.resolve(client);

  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      client = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return client;
    });
  }

  return clientPromise;
}
