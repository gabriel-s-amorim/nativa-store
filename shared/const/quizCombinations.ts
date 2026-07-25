/**
 * Textos de combinação entre pares de perfis do quiz.
 * Chave: ids ordenados alfabeticamente unidos por "|".
 */
export const QUIZ_COMBINATION_TEXTS: Record<string, string> = {
  "r-classico|r-classico":
    "Duas elegâncias leves na mesma frequência — peças atemporais, looks limpos e presença sem esforço.",
  "r-classico|r-mistico":
    "A sofisticação encontra a arte: uma ancora no essencial, a outra traz estampa e personalidade. Juntas, viram conversa.",
  "r-classico|r-natureza":
    "Sofisticação com os pés no chão — uma cuida do acabamento, a outra da autenticidade. Combinação rara e equilibrada.",
  "r-classico|r-vibrante":
    "Linha limpa + espírito de aventura: uma afina o look, a outra puxa pra estrada. Duo de contraste elegante.",
  "r-mistico|r-mistico":
    "Duas almas criativas — estampas, cores e peças com história pra contar juntas.",
  "r-mistico|r-natureza":
    "Essência natural com alma criativa: textura, artesanal e um toque de cor. A combinação mais autêntica possível.",
  "r-mistico|r-vibrante":
    "Criatividade com liberdade — uma traz personalidade, a outra traz movimento. O rolê nunca é sem graça.",
  "r-natureza|r-natureza":
    "Duas essências naturais — o simples, o artesanal e bolsas que parecem feitas sob medida.",
  "r-natureza|r-vibrante":
    "Pé na terra e coração livre: uma puxa pra natureza, a outra pra próxima aventura. Energia que se completa.",
  "r-vibrante|r-vibrante":
    "Dois espíritos livres — experiências, viagens e só o essencial pra acompanhar cada nova história.",
};

export function combinationKey(profileIdA: string, profileIdB: string): string {
  return [profileIdA, profileIdB].sort((a, b) => a.localeCompare(b)).join("|");
}

export function getCombinationText(profileIdA: string, profileIdB: string): string {
  const key = combinationKey(profileIdA, profileIdB);
  return (
    QUIZ_COMBINATION_TEXTS[key] ??
    "Dois estilos diferentes, uma amizade em comum — e a Nativa no meio do caminho."
  );
}
