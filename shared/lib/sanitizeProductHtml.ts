/**
 * Sanitiza HTML de descrição de produto sem dependências externas
 * (sanitize-html quebra o bundle CJS da Vercel: ERR_REQUIRE_ESM / htmlparser2).
 */

const ALLOWED_TAGS = new Set([
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
]);

const VOID_TAGS = new Set(["br"]);

function isSafeUrl(raw: string): boolean {
  const value = raw.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!value || value.startsWith("#")) return true;
  const lower = value.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:")
  ) {
    return false;
  }
  return /^(https?:|mailto:|\/|\.\/|\.\.\/)/i.test(value);
}

function sanitizeAttributes(tag: string, attrsRaw: string): string {
  if (!attrsRaw.trim()) {
    return tag === "a" ? ' rel="noopener noreferrer"' : "";
  }

  const kept: string[] = [];
  const attrRe =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gi;
  let match: RegExpExecArray | null;

  while ((match = attrRe.exec(attrsRaw)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";

    if (name.startsWith("on")) continue;
    if (name === "style" || name.startsWith("data-")) continue;

    if (tag === "a" && (name === "href" || name === "title" || name === "target")) {
      if (name === "href" && !isSafeUrl(value)) continue;
      if (name === "target" && value !== "_blank" && value !== "_self") continue;
      kept.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
      continue;
    }

    if (
      (tag === "span" ||
        tag === "div" ||
        tag === "p" ||
        tag === "h2" ||
        tag === "h3" ||
        tag === "h4") &&
      name === "class"
    ) {
      const safeClass = value.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim();
      if (safeClass) kept.push(`class="${safeClass}"`);
    }
  }

  if (tag === "a") {
    const hasRel = kept.some((item) => item.startsWith("rel="));
    if (!hasRel) kept.push('rel="noopener noreferrer"');
  }

  return kept.length > 0 ? ` ${kept.join(" ")}` : "";
}

/** Remove scripts, handlers e tags perigosas do HTML de descrição de produto. */
export function sanitizeProductHtml(html: string): string {
  if (!html) return "";

  let out = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  out = out.replace(/<\/?([a-zA-Z][\w:-]*)\b([^>]*)>/g, (full, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase();
    const closing = full.startsWith("</");

    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }

    if (closing) {
      return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
    }

    if (VOID_TAGS.has(tag)) {
      return `<${tag}>`;
    }

    return `<${tag}${sanitizeAttributes(tag, attrs)}>`;
  });

  return out
    .replace(/<h3([^>]*)>\s*\?\s*/gi, "<h3$1>✦ ")
    .replace(/class="isSelectedEnd"/gi, "")
    .replace(/\sclass=""/gi, "");
}
