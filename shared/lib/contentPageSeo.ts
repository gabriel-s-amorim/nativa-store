import { absoluteUrl } from "@shared/lib/seo";
import { SITE_NAME } from "@shared/const/site";
import type {
  ContentPage,
  FaqContent,
  HowToContent,
  SectionsContent,
} from "@shared/types/contentPage";

export function buildContentPageJsonLd(input: {
  baseUrl: string;
  page: ContentPage;
}): Record<string, unknown> {
  const { baseUrl, page } = input;
  const url = absoluteUrl(baseUrl, `/${page.slug}`);
  const description = page.seoDescription || page.title;

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: absoluteUrl(baseUrl, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.title,
        item: url,
      },
    ],
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name: page.seoTitle || page.title,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl(baseUrl, "/"),
    },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };

  const graph: Record<string, unknown>[] = [webPage, breadcrumb];

  if (page.pageType === "howto") {
    const content = page.content as HowToContent;
    graph.push({
      "@type": "HowTo",
      "@id": `${url}#howto`,
      name: page.title,
      description: content.intro || description,
      step: content.steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
      })),
    });
  }

  if (page.pageType === "faq") {
    const content = page.content as FaqContent;
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: content.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  if (page.pageType === "sections") {
    const content = page.content as SectionsContent;
    graph.push({
      "@type": "AboutPage",
      "@id": `${url}#about`,
      name: page.title,
      description: content.intro || description,
      url,
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function renderContentPageSeoBody(page: ContentPage): string {
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const paragraphs = (text: string) =>
    text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${escape(line)}</p>`)
      .join("");

  let inner = "";

  if (page.pageType === "howto") {
    const content = page.content as HowToContent;
    inner = `
      <p>${escape(content.intro)}</p>
      <ol>
        ${content.steps
          .map(
            (step) =>
              `<li><strong>${escape(step.title)}</strong> — ${escape(step.description)}</li>`,
          )
          .join("")}
      </ol>
    `;
  } else if (page.pageType === "faq") {
    const content = page.content as FaqContent;
    inner = `
      <p>${escape(content.intro)}</p>
      ${content.items
        .map(
          (item) => `
        <section>
          <h2>${escape(item.question)}</h2>
          ${paragraphs(item.answer)}
        </section>`,
        )
        .join("")}
    `;
  } else {
    const content = page.content as SectionsContent;
    inner = `
      <p>${escape(content.intro)}</p>
      ${content.sections
        .map(
          (section) => `
        <section>
          <h2>${escape(section.title)}</h2>
          ${paragraphs(section.body)}
        </section>`,
        )
        .join("")}
    `;
  }

  return `
    <main style="font-family:Georgia,serif;max-width:720px;margin:0 auto;padding:2rem 1.25rem;color:#3D2B1F;background:#F5F0E8;">
      <nav aria-label="Breadcrumb"><a href="/">Início</a> / ${escape(page.title)}</nav>
      <h1>${escape(page.title)}</h1>
      ${inner}
    </main>
  `;
}
