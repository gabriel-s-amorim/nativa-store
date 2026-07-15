/**
 * Contorno SVG "bordado" sobreposto a um card retangular arredondado.
 * Usado no quiz ao selecionar uma opção de resposta.
 */

import {
  STITCH_DURATION_QUIZ_MS,
  useStitchAnimation,
} from "@/hooks/useStitchAnimation";
import { useRef } from "react";

interface StitchBorderProps {
  active: boolean;
  color: string;
  /** Raio das bordas em viewBox 0–100 (default ~16% visual ≈ rounded-2xl). */
  rx?: number;
  strokeWidth?: number;
  durationMs?: number;
  onComplete?: () => void;
  className?: string;
}

export default function StitchBorder({
  active,
  color,
  rx = 10,
  strokeWidth = 2.5,
  durationMs = STITCH_DURATION_QUIZ_MS,
  onComplete,
  className,
}: StitchBorderProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const needleRef = useRef<SVGCircleElement | null>(null);

  useStitchAnimation({
    active,
    pathRef,
    needleRef,
    durationMs,
    onComplete,
  });

  if (!active) return null;

  // Retângulo arredondado em viewBox 100×100, inset para o stroke não cortar
  const inset = strokeWidth;
  const w = 100 - inset * 2;
  const h = 100 - inset * 2;
  const r = Math.min(rx, w / 2, h / 2);
  const x = inset;
  const y = inset;
  // Path no sentido horário a partir do topo-centro (agulha começa no topo)
  const d = [
    `M ${x + w / 2} ${y}`,
    `H ${x + w - r}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `V ${y + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    `H ${x + w / 2}`,
  ].join(" ");

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
        overflow: "visible",
      }}
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: "drop-shadow(0 1px 1px rgba(61,43,31,0.35))" }}
      />
      <circle
        ref={needleRef}
        cx={0}
        cy={0}
        r={3.5}
        fill={color}
        stroke="#FDF9F2"
        strokeWidth={1.25}
        style={{
          opacity: 0,
          willChange: "transform",
          transition: "opacity 160ms ease-out",
          filter: "drop-shadow(0 1px 2px rgba(61,43,31,0.45))",
        }}
      />
    </svg>
  );
}
