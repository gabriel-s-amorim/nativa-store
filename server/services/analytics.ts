import { supabase } from "../lib/supabase";

export async function recordPageView(sessionId: string, path: string): Promise<void> {
  const normalizedPath = path.split("?")[0].slice(0, 500) || "/";

  const { error } = await supabase.from("store_page_views").insert({
    session_id: sessionId,
    path: normalizedPath,
  });

  if (error) throw new Error(error.message);
}
