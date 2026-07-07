export function decodeHtmlEntities(text: string): string {
  if (!text) return "";

  if (typeof document !== "undefined") {
    const el = document.createElement("textarea");
    el.innerHTML = text;
    return el.value;
  }

  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&eacute;/g, "é")
    .replace(/&Eacute;/g, "É")
    .replace(/&aacute;/g, "á")
    .replace(/&Aacute;/g, "Á")
    .replace(/&atilde;/g, "ã")
    .replace(/&Atilde;/g, "Ã")
    .replace(/&ccedil;/g, "ç")
    .replace(/&Ccedil;/g, "Ç")
    .replace(/&oacute;/g, "ó")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&iacute;/g, "í")
    .replace(/&Iacute;/g, "Í")
    .replace(/&uacute;/g, "ú")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&bull;/g, "•");
}

export function sanitizeProductHtml(html: string): string {
  if (!html) return "";

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\sdata-[\w-]+=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/<h3([^>]*)>\s*\?\s*/gi, "<h3$1>✦ ")
    .replace(/class="isSelectedEnd"/gi, "")
    .replace(/\sclass=""/gi, "");
}
