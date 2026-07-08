import { useEffect } from "react";

/**
 * O Supabase devolve tokens/erros no hash (#). Se a Redirect URL não estiver
 * cadastrada, ele cai na Site URL (/) com #error=... — este componente
 * redireciona para a página correta preservando o hash.
 */
export default function AuthHashRouter() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) return;

    const params = new URLSearchParams(hash.slice(1));
    const isAuthCallback =
      params.has("error") ||
      params.has("error_code") ||
      params.has("access_token") ||
      params.has("refresh_token") ||
      params.get("type") === "recovery" ||
      params.get("type") === "signup" ||
      params.get("type") === "email";

    if (!isAuthCallback) return;

    const path = window.location.pathname;
    const type = params.get("type");
    const target = type === "signup" || type === "email" ? "/conta" : "/redefinir-senha";

    if (path === target) return;

    window.location.replace(`${target}${hash}`);
  }, []);

  return null;
}
