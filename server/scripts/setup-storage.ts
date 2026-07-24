import {
  PRODUCT_IMAGES_BUCKET,
  STORY_VIDEOS_BUCKET,
  MAX_STORAGE_FILE_BYTES,
  MAX_STORY_VIDEO_BYTES,
} from "../services/uploads";
import { supabase } from "../lib/supabase";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const STORY_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const IMAGE_SIZE_LIMIT = `${Math.floor(MAX_STORAGE_FILE_BYTES / (1024 * 1024))}MB`;
const STORY_SIZE_LIMIT = `${Math.floor(MAX_STORY_VIDEO_BYTES / (1024 * 1024))}MB`;

async function ensureBucket(opts: {
  name: string;
  fileSizeLimit: string;
  allowedMimeTypes: string[];
  label: string;
}) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Não foi possível listar os buckets: ${listError.message}`);
  }

  const exists = buckets?.some((bucket) => bucket.name === opts.name);
  const payload = {
    public: true,
    fileSizeLimit: opts.fileSizeLimit,
    allowedMimeTypes: opts.allowedMimeTypes,
  };

  if (exists) {
    const { error: updateError } = await supabase.storage.updateBucket(opts.name, payload);
    if (updateError) {
      throw new Error(`Não foi possível atualizar o bucket "${opts.name}": ${updateError.message}`);
    }
    console.log(`Bucket "${opts.name}" atualizado (${opts.label}).`);
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(opts.name, payload);
  if (createError) {
    throw new Error(`Não foi possível criar o bucket "${opts.name}": ${createError.message}`);
  }
  console.log(`Bucket "${opts.name}" criado com sucesso (${opts.label}).`);
}

async function main() {
  await ensureBucket({
    name: PRODUCT_IMAGES_BUCKET,
    fileSizeLimit: IMAGE_SIZE_LIMIT,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    label: `JPG, PNG, WEBP, GIF até ${IMAGE_SIZE_LIMIT} — leitura pública`,
  });

  await ensureBucket({
    name: STORY_VIDEOS_BUCKET,
    fileSizeLimit: STORY_SIZE_LIMIT,
    allowedMimeTypes: STORY_MIME_TYPES,
    label: `MP4, WEBM + thumbs até ${STORY_SIZE_LIMIT} — leitura pública`,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
