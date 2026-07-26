/**
 * Markup semântico da PDP para crawlers (dynamic rendering).
 * Espelha o texto da ProductPage — sem interatividade, sem APIs de browser.
 * Conteúdo diferente do que o humano vê após o JS = risco de cloaking.
 */
import React from "react";
import { decodeHtmlEntities } from "@shared/lib/decodeHtmlEntities";
import { formatPrice } from "@shared/lib/formatPrice";
import { sanitizeProductHtml } from "@shared/lib/sanitizeProductHtml";
import type { Product } from "@shared/types/product";

export type ProductSeoBodyProps = {
  product: Product;
  /** Produtos relacionados (mesma regra da PDP: mesma categoria, até 3). */
  relatedProducts?: Product[];
};

export function ProductSeoBody({ product, relatedProducts = [] }: ProductSeoBodyProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
  const descriptionHtml = sanitizeProductHtml(product.description ?? "");
  const categoryHref = product.category === "Bolsas" ? "/categoria/bolsas" : "/#colecoes";

  return (
    <article className="min-h-screen" style={{ background: "#F5F0E8" }}>
      <main className="container relative pb-16 pt-20 md:pt-24">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[#8B6F5E]">
            <li>
              <a href="/">Início</a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/#colecoes">Coleções</a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href={categoryHref}>{product.category}</a>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-[#3D2B1F]">{product.name}</li>
          </ol>
        </nav>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <ul className="space-y-3">
              {(product.images?.length ? product.images : [product.image])
                .filter(Boolean)
                .map((src, index) => (
                  <li key={`${src}-${index}`}>
                    <img
                      src={src}
                      alt={`${product.name}${index > 0 ? ` — imagem ${index + 1}` : ""}`}
                      width={800}
                      height={800}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </li>
                ))}
            </ul>
            {product.badge ? <p className="mt-2 text-sm font-semibold text-[#C4522A]">{product.badge}</p> : null}
          </div>

          <div className="flex flex-col gap-5">
            <header>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#2D6A4F]">
                {product.category}
              </p>
              <h1 className="mb-3 text-3xl font-bold text-[#3D2B1F]">{product.name}</h1>
              <p className="mb-4 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-[#C4522A]">{formatPrice(product.price)}</span>
                {product.originalPrice ? (
                  <span className="text-lg text-[#B0A090] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                ) : null}
                {discount != null && discount > 0 ? (
                  <span className="text-xs font-bold text-[#E8821A]">Economize {discount}%</span>
                ) : null}
              </p>
              <p className="text-base leading-relaxed text-[#8B6F5E]">
                {decodeHtmlEntities(product.shortDescription)}
              </p>
            </header>

            {product.highlights.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {product.highlights.map((h) => (
                  <li key={h} className="rounded-full border border-[#E8D5C4] px-3 py-1.5 text-xs font-semibold text-[#3D2B1F]">
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}

            {product.colors.length > 0 ? (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-[#3D2B1F]">Cor</h2>
                <ul className="flex flex-wrap gap-2 text-sm text-[#8B6F5E]">
                  {product.colors.map((color) => (
                    <li key={color.name}>{color.name}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {product.sizes.length > 0 ? (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-[#3D2B1F]">Tamanho</h2>
                <ul className="flex flex-wrap gap-2 text-sm text-[#3D2B1F]">
                  {product.sizes.map((size) => (
                    <li key={size.label} className={!size.available ? "text-[#B0A090] line-through" : undefined}>
                      {size.label}
                      {!size.available ? " (indisponível)" : ""}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="text-xs text-[#8B6F5E]">
              {product.inStock
                ? `${product.stockCount} unidades disponíveis`
                : "Esgotado"}
            </p>
            <p className="text-xs text-[#8B6F5E]">SKU: {product.sku}</p>

            <ul className="grid gap-3 text-xs text-[#8B6F5E] sm:grid-cols-3">
              <li>
                <strong className="block text-[#3D2B1F]">Frete grátis</strong>
                Acima de R$ 299
              </li>
              <li>
                <strong className="block text-[#3D2B1F]">Compra segura</strong>
                Pagamento protegido
              </li>
              <li>
                <strong className="block text-[#3D2B1F]">Troca fácil</strong>
                Até 30 dias
              </li>
            </ul>

            {product.artisan?.name ? (
              <section className="rounded-[1.5rem] border border-[#E8D5C4]/60 p-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2D6A4F]">
                  Feito por mãos brasileiras
                </p>
                <h2 className="mb-1 text-xl font-bold text-[#3D2B1F]">{product.artisan.name}</h2>
                {product.artisan.region ? (
                  <p className="mb-3 text-sm text-[#8B6F5E]">{product.artisan.region}</p>
                ) : null}
                {product.artisan.story ? (
                  <p className="text-[15px] leading-relaxed text-[#8B6F5E] italic">
                    {product.artisan.story}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>

        <section className="py-8" style={{ background: "#FAF7F2" }}>
          <h2 className="mb-6 text-2xl font-bold text-[#3D2B1F]">Detalhes da Bolsa</h2>

          <section className="mb-6">
            <h3 className="mb-2 text-base font-semibold text-[#3D2B1F]">Descrição</h3>
            <div
              className="product-description text-[#8B6F5E]"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </section>

          {/* Títulos sempre presentes na PDP (accordion), mesmo com lista vazia */}
          <section className="mb-6">
            <h3 className="mb-2 text-base font-semibold text-[#3D2B1F]">Materiais e Composição</h3>
            <ul className="space-y-2 text-[#8B6F5E]">
              {product.materials.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-base font-semibold text-[#3D2B1F]">Cuidados</h3>
            <ul className="space-y-2 text-[#8B6F5E]">
              {product.careInstructions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>

          {product.faq.length > 0 ? (
            <section>
              <h3 className="mb-2 text-base font-semibold text-[#3D2B1F]">Perguntas Frequentes</h3>
              <div className="space-y-4">
                {product.faq.map((item) => (
                  <div key={item.question}>
                    <p className="mb-1 text-sm font-semibold text-[#3D2B1F]">{item.question}</p>
                    <p className="text-sm text-[#8B6F5E]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </section>

        {relatedProducts.length > 0 ? (
          <section className="py-12">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2D6A4F]">
              Você também pode gostar
            </p>
            <h2 className="mb-6 text-2xl font-bold text-[#3D2B1F]">Bolsas Relacionadas</h2>
            <ul className="grid gap-4 md:grid-cols-3">
              {relatedProducts.map((related) => (
                <li key={related.id}>
                  <a href={`/produto/${related.slug}`} className="block text-[#3D2B1F]">
                    <img
                      src={related.image}
                      alt={related.name}
                      width={400}
                      height={400}
                      style={{ width: "100%", height: "auto", marginBottom: "0.5rem" }}
                    />
                    <span className="font-semibold">{related.name}</span>
                    <span className="mt-1 block text-[#C4522A]">{formatPrice(related.price)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </article>
  );
}
