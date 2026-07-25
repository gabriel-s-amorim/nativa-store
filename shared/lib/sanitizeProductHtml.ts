import sanitizeHtml from "sanitize-html";

const PRODUCT_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "a",
    "span",
    "div",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    span: ["class"],
    div: ["class"],
    p: ["class"],
    h2: ["class"],
    h3: ["class"],
    h4: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

/** Remove scripts, handlers e tags perigosas do HTML de descrição de produto. */
export function sanitizeProductHtml(html: string): string {
  if (!html) return "";

  return sanitizeHtml(html, PRODUCT_HTML_OPTIONS)
    .replace(/<h3([^>]*)>\s*\?\s*/gi, "<h3$1>✦ ")
    .replace(/class="isSelectedEnd"/gi, "")
    .replace(/\sclass=""/gi, "");
}
