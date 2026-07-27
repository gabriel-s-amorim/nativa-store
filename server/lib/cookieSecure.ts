/** Cookies Secure em produção (Vercel ou NODE_ENV). */
export function shouldUseSecureCookies(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}
