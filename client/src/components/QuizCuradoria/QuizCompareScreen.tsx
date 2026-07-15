import ShareResultCard from "@/components/QuizCuradoria/ShareResultCard";
import {
  captureShareCard,
  downloadShareImage,
  shareOrDownloadImage,
} from "@/components/QuizCuradoria/shareQuizResult";
import type { QuizComparePayload } from "@shared/types/quiz";
import { motion } from "framer-motion";
import { ArrowRight, Download, RefreshCw, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface QuizCompareScreenProps {
  payload: QuizComparePayload;
  onContinue: () => void;
  onRestart: () => void;
}

function ProfileColumn({
  label,
  name,
  description,
}: {
  label: string;
  name: string;
  description: string;
}) {
  return (
    <div
      className="rounded-[1.5rem] px-5 py-8 text-center sm:px-6"
      style={{
        background:
          "linear-gradient(165deg, #FFF8F0 0%, #F5E6D6 100%)",
        boxShadow: "0 12px 32px rgba(61,43,31,0.06)",
      }}
    >
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: "#8B6F5E", fontFamily: "'Nunito', sans-serif" }}
      >
        {label}
      </p>
      <h2
        className="mb-4 text-2xl leading-tight sm:text-3xl"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: "#3D2B1F",
        }}
      >
        {name}
      </h2>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "#5C4A3D", fontFamily: "'Lora', Georgia, serif" }}
      >
        {description}
      </p>
    </div>
  );
}

export default function QuizCompareScreen({
  payload,
  onContinue,
  onRestart,
}: QuizCompareScreenProps) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const yoursProduct = payload.yours.products[0] ?? null;
  const friendProduct = payload.friend.products[0] ?? null;
  const shareProduct = yoursProduct ?? friendProduct;
  const filename = `nativa-quiz-duo-${payload.yours.result.id}-${payload.friend.result.id}.png`;
  const duoTitle = `${payload.yours.result.name} + ${payload.friend.result.name}`;

  async function ensureImage(): Promise<Blob | null> {
    if (shareBlob) return shareBlob;
    if (!shareRef.current || !shareProduct) {
      toast.error("Não há produto para montar a imagem");
      return null;
    }

    setIsGenerating(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 120));
      const blob = await captureShareCard(shareRef.current, {
        eyebrow: "VOCÊS SÃO",
        subtitle: payload.combinationText,
      });
      setShareBlob(blob);
      return blob;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar imagem");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownload() {
    const blob = await ensureImage();
    if (!blob) return;
    await downloadShareImage(blob, filename);
    toast.success("Imagem da combinação baixada!");
  }

  async function handleShare() {
    const blob = await ensureImage();
    if (!blob) return;
    try {
      const mode = await shareOrDownloadImage(
        blob,
        filename,
        `Vocês são ${duoTitle} — ${payload.combinationText}`,
      );
      if (mode === "shared") {
        toast.success("Compartilhado!");
      } else {
        toast.success("Imagem baixada!");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Não foi possível compartilhar");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto w-full max-w-4xl px-4 pb-20 pt-2 sm:px-6"
    >
      <header className="mb-10 text-center">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "#8B6F5E", fontFamily: "'Nunito', sans-serif" }}
        >
          Combinação de estilos
        </p>
        <h1
          className="mb-4 text-3xl sm:text-5xl"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: "#3D2B1F",
          }}
        >
          Vocês são {payload.yours.result.name} + {payload.friend.result.name}
        </h1>
        <p
          className="mx-auto max-w-xl text-base leading-relaxed sm:text-lg"
          style={{ color: "#5C4A3D", fontFamily: "'Lora', Georgia, serif" }}
        >
          {payload.combinationText}
        </p>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        <ProfileColumn
          label="Você"
          name={payload.yours.result.name}
          description={payload.yours.result.description}
        />
        <ProfileColumn
          label="Sua amiga"
          name={payload.friend.result.name}
          description={payload.friend.result.description}
        />
      </div>

      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #C4522A, #E8821A)",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Ver meu resultado completo
          <ArrowRight className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={isGenerating || !shareProduct}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 px-7 py-3.5 text-sm font-bold disabled:opacity-50"
          style={{
            borderColor: "#2D6A4F",
            color: "#2D6A4F",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          <Share2 className="size-4" />
          {isGenerating ? "Gerando…" : "Compartilhar combinação"}
        </button>

        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={isGenerating || !shareProduct}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold disabled:opacity-50"
          style={{
            background: "#EDE4D8",
            color: "#3D2B1F",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          <Download className="size-4" />
          Baixar imagem
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
          style={{
            color: "#8B6F5E",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          <RefreshCw className="size-4" />
          Refazer
        </button>
      </div>

      {shareProduct && (
        <ShareResultCard
          ref={shareRef}
          profileName={duoTitle}
          productName={shareProduct.name}
          productImage={shareProduct.image}
        />
      )}
    </motion.div>
  );
}
