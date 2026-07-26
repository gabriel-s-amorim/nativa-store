import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CategorySeoBody, type CategorySeoBodyProps } from "../components/CategorySeoBody";

/** Renderiza o body SEO da categoria como string HTML (sem hydration). */
export function renderCategorySeoBody(props: CategorySeoBodyProps): string {
  return renderToStaticMarkup(<CategorySeoBody {...props} />);
}
