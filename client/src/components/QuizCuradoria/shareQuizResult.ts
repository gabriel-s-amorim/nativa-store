import { SITE_NAME, SITE_TWITTER_HANDLE } from "@shared/const/site";
import { appPath } from "@/lib/appUrl";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function displayQuizUrl(fullUrl: string): string {
  try {
    const parsed = new URL(fullUrl);
    return `${parsed.host}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return fullUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
}

/** Legenda pronta para colar no Instagram. */
export function buildQuizShareCaption(profileName: string): string {
  const quizUrl = appPath("/quiz");
  const handle = SITE_TWITTER_HANDLE.replace(/^@/, "");
  return [
    `Meu resultado no Quiz Nativa: ${profileName}`,
    "",
    "Qual é o seu? Faz o quiz e marca a gente nos Stories ✨",
    quizUrl,
    "",
    `#NativaStore #QuizDeEstilo #${handle}`,
  ].join("\n");
}

/**
 * Card 1080×1080 pensado para Stories/Feed:
 * revelação do perfil + produto + CTA com link do site.
 * Sempre renderiza em resolução nativa 1080px (não depende do DPR da tela).
 */
export interface CaptureShareCardOptions {
  eyebrow?: string;
  subtitle?: string;
}

export async function captureShareCard(
  element: HTMLElement,
  options: CaptureShareCardOptions = {},
): Promise<Blob> {
  const profileName =
    element.querySelector("[data-share-profile]")?.textContent?.trim() ?? "Meu estilo";
  const productName =
    element.querySelector("[data-share-product-name]")?.textContent?.trim() ?? "";
  const logoSrc =
    element.querySelector<HTMLImageElement>("[data-share-logo]")?.currentSrc ||
    element.querySelector<HTMLImageElement>("[data-share-logo]")?.src;
  const productSrc =
    element.querySelector<HTMLImageElement>("[data-share-product-image]")?.currentSrc ||
    element.querySelector<HTMLImageElement>("[data-share-product-image]")?.src;
  const quizUrl =
    element.getAttribute("data-share-quiz-url")?.trim() || appPath("/quiz");
  const quizUrlDisplay = displayQuizUrl(quizUrl);
  const eyebrow = options.eyebrow?.trim() || "EU SOU";
  const subtitle = options.subtitle?.trim() || "";

  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("Canvas não disponível neste navegador");
  }

  // Qualidade máxima ao escalar fotos para o card 1080²
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Fundo editorial
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#FBF6EE");
  bg.addColorStop(0.55, "#F3E8D8");
  bg.addColorStop(1, "#E8D5C4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Manchas de cor
  const glow1 = ctx.createRadialGradient(180, 200, 0, 180, 200, 420);
  glow1.addColorStop(0, "rgba(196,82,42,0.18)");
  glow1.addColorStop(1, "rgba(196,82,42,0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, size, size);

  const glow2 = ctx.createRadialGradient(920, 880, 0, 920, 880, 480);
  glow2.addColorStop(0, "rgba(45,106,79,0.14)");
  glow2.addColorStop(1, "rgba(45,106,79,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, size, size);

  // Moldura interna
  ctx.strokeStyle = "rgba(196,82,42,0.35)";
  ctx.lineWidth = 3;
  roundRect(ctx, 36, 36, size - 72, size - 72, 28);
  ctx.stroke();

  ctx.strokeStyle = "rgba(61,43,31,0.08)";
  ctx.lineWidth = 1;
  roundRect(ctx, 48, 48, size - 96, size - 96, 22);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Logo
  if (logoSrc) {
    try {
      const logo = await loadImage(logoSrc);
      const logoW = 200;
      const logoH = Math.max(36, (logo.height / Math.max(logo.width, 1)) * logoW);
      ctx.drawImage(logo, (size - logoW) / 2, 78, logoW, logoH);
    } catch {
      // fallback tipográfico
      ctx.fillStyle = "#C4522A";
      ctx.font = "700 36px 'Playfair Display', Georgia, serif";
      ctx.fillText(SITE_NAME, size / 2, 120);
    }
  }

  // Chip "Quiz de Curadoria"
  const chipLabel = "QUIZ DE CURADORIA";
  ctx.font = "700 16px Nunito, sans-serif";
  const chipW = ctx.measureText(chipLabel).width + 40;
  const chipX = (size - chipW) / 2;
  const chipY = 188;
  roundRect(ctx, chipX, chipY, chipW, 36, 18);
  ctx.fillStyle = "rgba(196,82,42,0.12)";
  ctx.fill();
  ctx.fillStyle = "#C4522A";
  ctx.fillText(chipLabel, size / 2, chipY + 24);

  // Eyebrow
  ctx.fillStyle = "#8B6F5E";
  ctx.font = "600 20px Nunito, sans-serif";
  ctx.fillText(eyebrow.toUpperCase(), size / 2, 268);

  // Nome do perfil (destaque)
  ctx.fillStyle = "#3D2B1F";
  ctx.font = subtitle ? "700 52px 'Playfair Display', Georgia, serif" : "700 68px 'Playfair Display', Georgia, serif";
  const nameLines = wrapText(ctx, profileName, 860);
  let nameY = 340;
  for (const line of nameLines.slice(0, 2)) {
    ctx.fillText(line, size / 2, nameY);
    nameY += subtitle ? 60 : 78;
  }

  // Subtítulo da combinação (opcional)
  if (subtitle) {
    ctx.fillStyle = "#5C4A3D";
    ctx.font = "500 22px Lora, Georgia, serif";
    const subLines = wrapText(ctx, subtitle, 820);
    nameY += 8;
    for (const line of subLines.slice(0, 3)) {
      ctx.fillText(line, size / 2, nameY);
      nameY += 28;
    }
  }

  // Linha decorativa
  const lineY = nameY + 8;
  ctx.strokeStyle = "#C4522A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 48, lineY);
  ctx.lineTo(size / 2 + 48, lineY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size / 2, lineY, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#C4522A";
  ctx.fill();

  // Produto — caixa grande o bastante para ficar nítida em 1080
  const productBox = subtitle ? 340 : 390;
  const productX = (size - productBox) / 2;
  const productY = lineY + 28;

  // sombra + borda dourada
  ctx.save();
  ctx.shadowColor = "rgba(61,43,31,0.22)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = "#FFF8F0";
  roundRect(ctx, productX - 8, productY - 8, productBox + 16, productBox + 16, 32);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(201,146,42,0.55)";
  ctx.lineWidth = 3;
  roundRect(ctx, productX - 8, productY - 8, productBox + 16, productBox + 16, 32);
  ctx.stroke();

  ctx.fillStyle = "#EDE4D8";
  roundRect(ctx, productX, productY, productBox, productBox, 26);
  ctx.fill();

  if (productSrc) {
    try {
      const product = await loadImage(productSrc);
      ctx.save();
      roundRect(ctx, productX, productY, productBox, productBox, 26);
      ctx.clip();
      // Cover com suavização alta — mantém nitidez em 1080×1080
      const scale = Math.max(productBox / product.width, productBox / product.height);
      const w = product.width * scale;
      const h = product.height * scale;
      ctx.drawImage(
        product,
        productX + (productBox - w) / 2,
        productY + (productBox - h) / 2,
        w,
        h,
      );
      ctx.restore();
    } catch {
      // CORS / imagem indisponível
    }
  }

  // Nome do produto
  let afterProductY = productY + productBox + 40;
  if (productName) {
    ctx.fillStyle = "#5C4A3D";
    ctx.font = "600 24px Nunito, sans-serif";
    const productLines = wrapText(ctx, productName, 780);
    for (const line of productLines.slice(0, 2)) {
      ctx.fillText(line, size / 2, afterProductY);
      afterProductY += 30;
    }
  }

  // Faixa CTA inferior (Stories: link legível na imagem)
  const ctaTop = size - 168;
  const ctaGrad = ctx.createLinearGradient(0, ctaTop, 0, size);
  ctaGrad.addColorStop(0, "#C4522A");
  ctaGrad.addColorStop(1, "#A63E1C");
  ctx.fillStyle = ctaGrad;
  roundRect(ctx, 60, ctaTop, size - 120, 108, 24);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 20px Nunito, sans-serif";
  ctx.fillText("Descobre o seu também  ·  faz o quiz", size / 2, ctaTop + 38);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 28px Nunito, sans-serif";
  ctx.fillText(quizUrlDisplay, size / 2, ctaTop + 74);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Não foi possível gerar a imagem"));
          return;
        }
        // Garante dimensões exatas no blob PNG (canvas já é 1080×1080)
        if (canvas.width !== 1080 || canvas.height !== 1080) {
          reject(new Error("Resolução da imagem inválida"));
          return;
        }
        resolve(blob);
      },
      "image/png",
      1,
    );
  });
}

export async function downloadShareImage(blob: Blob, filename: string) {
  triggerDownload(blob, filename);
}

export function canNativeShareFiles(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (typeof navigator.canShare !== "function") {
    return true;
  }
  try {
    const file = new File(["x"], "test.png", { type: "image/png" });
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
  shareText: string,
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });

  if (canNativeShareFiles()) {
    try {
      await navigator.share({
        files: [file],
        title: shareText.split("\n")[0] || SITE_NAME,
        text: shareText,
      });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
    }
  }

  await downloadShareImage(blob, filename);
  return "downloaded";
}

export async function copyShareCaption(profileName: string): Promise<boolean> {
  const caption = buildQuizShareCaption(profileName);
  try {
    await navigator.clipboard.writeText(caption);
    return true;
  } catch {
    return false;
  }
}
