/**
 * Textos de combinação entre pares de perfis do quiz.
 * Chave: ids ordenados alfabeticamente unidos por "|".
 */
export const QUIZ_COMBINATION_TEXTS: Record<string, string> = {
  "r-classico|r-classico":
    "Duas elegâncias na mesma frequência — looks limpos, presença sem esforço e zero exagero.",
  "r-classico|r-mistico":
    "O clássico encontra o mistério: uma ancora no essencial, a outra traz significado. Juntas, viram conversa.",
  "r-classico|r-natureza":
    "Sofisticação com os pés no chão — uma cuida do acabamento, a outra da liberdade. Combinação rara e equilibrada.",
  "r-classico|r-vibrante":
    "Linha limpa + cor que aparece: uma afina o look, a outra acende o feed. Duo de impacto.",
  "r-mistico|r-mistico":
    "Duas almas místicas — peças com história, amuletos e histórias pra contar juntas.",
  "r-mistico|r-natureza":
    "Espírito livre com alma: trilha, textura e um toque de significado. A combinação mais boho possível.",
  "r-mistico|r-vibrante":
    "Mistério com movimento — uma traz profundidade, a outra traz brilho. O rolê nunca é sem graça.",
  "r-natureza|r-natureza":
    "Duas livres na estrada — textura de verdade, zero frescura e bolsa que já nasceu pra acompanhar.",
  "r-natureza|r-vibrante":
    "Pé na terra e cor no peito: uma puxa pra natureza, a outra pro movimento. Energia que se completa.",
  "r-vibrante|r-vibrante":
    "Duas energias que chegam antes — estampa viva, cor na foto e vibe de quem não tem medo de brilhar.",
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
