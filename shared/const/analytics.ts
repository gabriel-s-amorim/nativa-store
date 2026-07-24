export const VISITOR_SESSION_COOKIE = "nativa_visitor_session";
export const VISITOR_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Cookie de exclusão de analytics (manutenção / rede interna).
 * Não é httpOnly — o cliente também precisa ler para não disparar o POST.
 */
export const ANALYTICS_EXCLUDE_COOKIE = "nativa_analytics_exclude";
export const ANALYTICS_EXCLUDE_COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 ano
export const ANALYTICS_EXCLUDE_COOKIE_VALUE = "1";

/** Query string: /?nativa_internal=1 ativa exclusão; =0 remove. */
export const ANALYTICS_INTERNAL_QUERY = "nativa_internal";

/** Carrinhos sem atividade por este período são considerados abandonados. */
export const ABANDONED_CART_HOURS = 24;
