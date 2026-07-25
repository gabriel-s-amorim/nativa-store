export type UploadFolder = "products" | "banners" | "quiz";

/** Lado maior máximo — alinhado com server/services/uploads.ts */
const MAX_DIMENSION_BY_FOLDER: Record<UploadFolder, number> = {
  products: 1600,
  banners: 2400,
  quiz: 1400,
};

/** Qualidade WebP no canvas (0–1). */
const WEBP_QUALITY = 0.82;

/**
 * Redimensiona e converte JPG/PNG/WEBP para WebP no browser antes do upload.
 * Evita o caminho de signed upload com arquivos enormes (que pulava a conversão no servidor).
 * GIFs são devolvidos intactos para preservar animação.
 */
export async function optimizeImageForUpload(
  file: File,
  folder: UploadFolder = "products",
): Promise<File> {
  if (file.type === "image/gif") {
    return file;
  }

  if (!file.type.startsWith("image/")) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const maxSide = MAX_DIMENSION_BY_FOLDER[folder];
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
  });

  if (!blob || blob.size === 0) {
    return file;
  }

  // Se o WebP ficou maior que o original (raro em PNG já comprimido), mantém o arquivo.
  if (blob.size >= file.size && file.type === "image/webp") {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
