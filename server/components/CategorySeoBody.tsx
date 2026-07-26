/**
 * Markup semântico da página de categoria para crawlers (dynamic rendering).
 * Espelha o texto da grade em ProductsSection (filtro Bolsas) — sem filtros UI.
 * Conteúdo diferente do que o humano vê após o JS = risco de cloaking.
 */
import React from "react";
import { formatPrice } from "@shared/lib/formatPrice";
import type { Product } from "@shared/types/product";

export type CategorySeoBodyProps = {
  categoryName: string;
  categorySlug: string;
  /** Título visível da secção (ex.: "Nossa Coleção"). */
  heading: string;
  description: string;
  products: Product[];
};

export function CategorySeoBody({
  categoryName,
  categorySlug,
  heading,
  description,
  products,
}: CategorySeoBodyProps) {
  const categoryHref = `/categoria/${categorySlug}`;

  return (
    <article className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <main className="container relative pb-16 pt-20 md:pt-24">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[#8B6F5E]">
            <li>
              <a href="/">Início</a>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[#3D2B1F]">{categoryName}</li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C4522A]">
            ✦ {categoryName}
          </p>
          <h1 className="mb-3 text-3xl font-bold text-[#3D2B1F] md:text-5xl">{heading}</h1>
          <p className="max-w-xl text-base text-[#8B6F5E] italic">{description}</p>
        </header>

        {products.length > 0 ? (
          <section aria-label={`${categoryName} — listagem`}>
            <ul className="grid gap-4 md:grid-cols-3">
              {products.map((product) => (
                <li key={product.id}>
                  <a href={`/produto/${product.slug}`} className="block text-[#3D2B1F]">
                    <img
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      style={{ width: "100%", height: "auto", marginBottom: "0.5rem" }}
                    />
                    <span className="font-semibold">{product.name}</span>
                    <span className="mt-1 block text-[#C4522A]">{formatPrice(product.price)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="py-16 text-center text-[#8B6F5E]">Nenhum produto cadastrado ainda.</p>
        )}

        <p className="mt-10 text-center text-sm text-[#8B6F5E]">
          <a href={categoryHref}>Ver coleção de {categoryName}</a>
        </p>
      </main>
    </article>
  );
}
