import { describe, expect, it } from "vitest";
import { accentColorForTags, QUIZ_BRAND_ACCENT } from "./quizTagColors";
import { combinationKey, getCombinationText } from "./quizCombinations";

describe("quizTagColors", () => {
  it("usa a tag de maior peso", () => {
    expect(
      accentColorForTags([
        { tag: "boho", weight: 1 },
        { tag: "natureza", weight: 2 },
      ]),
    ).toBe("#2D6A4F");
  });

  it("faz fallback na cor da marca", () => {
    expect(accentColorForTags([])).toBe(QUIZ_BRAND_ACCENT);
    expect(accentColorForTags([{ tag: "desconhecida", weight: 1 }])).toBe(QUIZ_BRAND_ACCENT);
  });
});

describe("quizCombinations", () => {
  it("normaliza a chave independente da ordem", () => {
    expect(combinationKey("r-livre", "r-natural")).toBe("r-livre|r-natural");
    expect(combinationKey("r-natural", "r-livre")).toBe("r-livre|r-natural");
  });

  it("retorna texto pré-definido para pares conhecidos", () => {
    const text = getCombinationText("r-natural", "r-elegancia");
    expect(text).toMatch(/Sofisticação|acabamento|autenticidade/i);
  });

  it("tem fallback para pares desconhecidos", () => {
    expect(getCombinationText("x", "y")).toMatch(/Dois estilos/i);
  });
});
