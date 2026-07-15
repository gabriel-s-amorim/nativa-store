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

/**
 * Gera o card 1080×1080 via Canvas 2D (sem html2canvas).
 * Evita o erro de oklch do Tailwind CSS v4.
 */
export async function captureShareCard(element: HTMLElement): Promise<Blob> {
  const profileName =
    element.querySelector("[data-share-profile]")?.textContent?.trim() ?? "Meu estilo";
  const productName =
    element.querySelector("[data-share-product-name]")?.textContent?.trim() ?? "";
  const logoSrc = element.querySelector<HTMLImageElement>("[data-share-logo]")?.currentSrc
    || element.querySelector<HTMLImageElement>("[data-share-logo]")?.src;
  const productSrc =
    element.querySelector<HTMLImageElement>("[data-share-product-image]")?.currentSrc
    || element.querySelector<HTMLImageElement>("[data-share-product-image]")?.src;

  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas não disponível neste navegador");
  }

  const gradient = ctx.createLinearGradient(0, 0, size * 0.2, size);
  gradient.addColorStop(0, "#F5F0E8");
  gradient.addColorStop(0.45, "#EDE4D8");
  gradient.addColorStop(1, "#F8E8DC");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const blobA = ctx.createRadialGradient(216, 324, 0, 216, 324, 360);
  blobA.addColorStop(0, "rgba(196,82,42,0.12)");
  blobA.addColorStop(1, "rgba(196,82,42,0)");
  ctx.fillStyle = blobA;
  ctx.fillRect(0, 0, size, size);

  const blobB = ctx.createRadialGradient(864, 756, 0, 864, 756, 400);
  blobB.addColorStop(0, "rgba(45,106,79,0.10)");
  blobB.addColorStop(1, "rgba(45,106,79,0)");
  ctx.fillStyle = blobB;
  ctx.fillRect(0, 0, size, size);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  if (logoSrc) {
    try {
      const logo = await loadImage(logoSrc);
      const logoW = 220;
      const logoH = Math.max(40, (logo.height / Math.max(logo.width, 1)) * logoW);
      ctx.drawImage(logo, (size - logoW) / 2, 72, logoW, logoH);
    } catch {
      // logo opcional
    }
  }

  ctx.fillStyle = "#8B6F5E";
  ctx.font = "600 22px Nunito, sans-serif";
  ctx.fillText("MEU ESTILO", size / 2, 220);

  ctx.fillStyle = "#3D2B1F";
  ctx.font = "700 64px 'Playfair Display', Georgia, serif";
  const nameLines = wrapText(ctx, profileName, 900);
  let nameY = 300;
  for (const line of nameLines.slice(0, 3)) {
    ctx.fillText(line, size / 2, nameY);
    nameY += 74;
  }

  const productBox = 420;
  const productX = (size - productBox) / 2;
  const productY = Math.min(Math.max(nameY + 24, 380), 520);

  ctx.save();
  ctx.shadowColor = "rgba(61,43,31,0.18)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#EDE4D8";
  roundRect(ctx, productX, productY, productBox, productBox, 28);
  ctx.fill();
  ctx.restore();

  if (productSrc) {
    try {
      const product = await loadImage(productSrc);
      ctx.save();
      roundRect(ctx, productX, productY, productBox, productBox, 28);
      ctx.clip();
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
      // produto sem imagem (CORS ou URL inválida)
    }
  }

  if (productName) {
    ctx.fillStyle = "#3D2B1F";
    ctx.font = "600 26px Nunito, sans-serif";
    const productLines = wrapText(ctx, productName, 720);
    let py = productY + productBox + 48;
    for (const line of productLines.slice(0, 2)) {
      ctx.fillText(line, size / 2, py);
      py += 34;
    }
  }

  ctx.fillStyle = "#8B6F5E";
  ctx.font = "400 22px Nunito, sans-serif";
  ctx.fillText("Descubra o seu em Nativa Store", size / 2, size - 64);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Não foi possível gerar a imagem"));
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
        title: shareText,
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
