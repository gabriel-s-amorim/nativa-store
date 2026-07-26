/**
 * Antes gerava dist/public/categoria/bolsas/index.html no build.
 *
 * Na Vercel, ficheiros estáticos têm precedência sobre rewrites — esse HTML
 * impedia /categoria/bolsas de chegar à rota SEO dinâmica (CategorySeoBody).
 *
 * Mantido como no-op no build para não partir scripts; pode remover a chamada
 * em package.json (build / build:vercel) quando quiser.
 */
async function main() {
  console.log(
    "generate-seo-pages: skipped (categoria/bolsas agora é só rota dinâmica /api/seo)",
  );
}

main().catch((error) => {
  console.error("generate-seo-pages:", error);
  process.exitCode = 1;
});
