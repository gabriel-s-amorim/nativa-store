/**
 * Textos de combinação entre pares de perfis do quiz.
 * Chave: ids ordenados alfabeticamente unidos por "|".
 */
export const QUIZ_COMBINATION_TEXTS: Record<string, string> = {
  "r-criativa|r-criativa":
    "Duas almas criativas — estampas, cores e peças com história pra contar juntas.",
  "r-criativa|r-elegancia":
    "A sofisticação encontra a arte: uma ancora no essencial, a outra traz estampa e personalidade. Juntas, viram conversa.",
  "r-criativa|r-livre":
    "Criatividade com liberdade — uma traz personalidade, a outra traz movimento. O rolê nunca é sem graça.",
  "r-criativa|r-natural":
    "Essência natural com alma criativa: textura, artesanal e um toque de cor. A combinação mais autêntica possível.",
  "r-elegancia|r-elegancia":
    "Duas elegâncias leves na mesma frequência — peças atemporais, looks limpos e presença sem esforço.",
  "r-elegancia|r-livre":
    "Linha limpa + espírito de aventura: uma afina o look, a outra puxa pra estrada. Duo de contraste elegante.",
  "r-elegancia|r-natural":
    "Sofisticação com os pés no chão — uma cuida do acabamento, a outra da autenticidade. Combinação rara e equilibrada.",
  "r-livre|r-livre":
    "Dois espíritos livres — experiências, viagens e só o essencial pra acompanhar cada nova história.",
  "r-livre|r-natural":
    "Pé na terra e coração livre: uma puxa pra natureza, a outra pra próxima aventura. Energia que se completa.",
  "r-natural|r-natural":
    "Duas essências naturais — o simples, o artesanal e bolsas que parecem feitas sob medida.",
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
