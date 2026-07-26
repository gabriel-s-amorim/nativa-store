import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductSeoBody, type ProductSeoBodyProps } from "../components/ProductSeoBody";

/** Renderiza o body SEO da PDP como string HTML (sem marcadores de hydration). */
export function renderProductSeoBody(props: ProductSeoBodyProps): string {
  return renderToStaticMarkup(<ProductSeoBody {...props} />);
}
