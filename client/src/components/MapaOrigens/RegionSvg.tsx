/**
 * Nativa Store — Mapa Vivo das Origens
 * Contorno real (e simplificado) do Brasil por macrorregião, baseado na
 * malha territorial oficial do IBGE — ver server/scripts/generate-brazil-map.ts.
 * As 5 regiões se tocam exatamente nas bordas reais (mesma fonte geográfica).
 *
 * Ao selecionar uma região, o contorno dela é "bordado" em tempo real
 * (stroke-dasharray/dashoffset + uma agulha animada via getPointAtLength)
 * antes do painel de história ser revelado pelo componente pai.
 */

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { BRAZIL_MAP_VIEWBOX, BRAZIL_REGION_PATHS } from "./brazilRegionsPaths";

export type RegionId = "norte" | "nordeste" | "centro-oeste" | "sudeste" | "sul";

interface RegionShape {
  id: RegionId;
  shortLabel: string;
  color: string;
}

const REGION_SHAPES: RegionShape[] = [
  { id: "norte", shortLabel: "Norte", color: "#2D6A4F" },
  { id: "nordeste", shortLabel: "Nordeste", color: "#C4522A" },
  { id: "centro-oeste", shortLabel: "Centro-Oeste", color: "#C9922A" },
  { id: "sudeste", shortLabel: "Sudeste", color: "#1B7A8C" },
  { id: "sul", shortLabel: "Sul", color: "#52A87A" },
];

/** Ordem fixa das 5 regiões — usada pelo Passaporte de Regiões. */
export const REGION_IDS: RegionId[] = REGION_SHAPES.map((shape) => shape.id);

/** Cor de destaque de cada região, reaproveitada fora do mapa (ex: passaporte). */
export const REGION_COLORS: Record<RegionId, string> = REGION_SHAPES.reduce(
  (colors, shape) => {
    colors[shape.id] = shape.color;
    return colors;
  },
  {} as Record<RegionId, string>,
);

const BORDER_COLOR = "#3D2B1F";

/** Duração do "bordado" do contorno — dentro da faixa 1.5-2s pedida. */
const EMBROIDERY_DURATION_MS = 1800;
const EMBROIDERY_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface RegionSvgProps {
  selectedId: RegionId | null;
  onSelect: (id: RegionId) => void;
  getRegionName: (id: RegionId) => string;
}

export default function RegionSvg({ selectedId, onSelect, getRegionName }: RegionSvgProps) {
  const [focusedId, setFocusedId] = useState<RegionId | null>(null);
  const [drawingId, setDrawingId] = useState<RegionId | null>(null);

  const overlayPathRef = useRef<SVGPathElement | null>(null);
  const needleRef = useRef<SVGCircleElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const onSelectRef = useRef(onSelect);
  useLayoutEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Anima o "bordado" do contorno da região em `drawingId`. Ao terminar,
  // revela a seleção real (onSelect) — é isso que atrasa o painel de história.
  useLayoutEffect(() => {
    if (!drawingId) return;
    const activeId: RegionId = drawingId;

    const path = overlayPathRef.current;
    const needle = needleRef.current;
    if (!path) return;
    const pathEl: SVGPathElement = path;

    const totalLength = pathEl.getTotalLength();

    pathEl.style.transition = "none";
    pathEl.style.strokeDasharray = `${totalLength}`;
    pathEl.style.strokeDashoffset = `${totalLength}`;

    if (needle) {
      const startPoint = pathEl.getPointAtLength(0);
      needle.style.transition = "none";
      needle.style.transform = `translate(${startPoint.x}px, ${startPoint.y}px)`;
      needle.style.opacity = "1";
    }

    function tick(now: number) {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / EMBROIDERY_DURATION_MS, 1);
      const point = pathEl.getPointAtLength(progress * totalLength);
      if (needle) {
        needle.style.transform = `translate(${point.x}px, ${point.y}px)`;
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
        if (needle) needle.style.opacity = "0";
        setDrawingId(null);
        onSelectRef.current(activeId);
      }
    }

    // Um frame de intervalo para o navegador registrar o estado "traço
    // cheio invisível" antes de ligar a transição — só assim o CSS anima
    // do total até zero em vez de simplesmente "pular" para o final.
    rafIdRef.current = requestAnimationFrame(() => {
      pathEl.style.transition = `stroke-dashoffset ${EMBROIDERY_DURATION_MS}ms ${EMBROIDERY_EASING}`;
      pathEl.style.strokeDashoffset = "0";
      startTimeRef.current = performance.now();
      rafIdRef.current = requestAnimationFrame(tick);
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [drawingId]);

  function handleActivate(id: RegionId) {
    if (id === drawingId) return;
    if (id === selectedId && drawingId === null) return;

    if (prefersReducedMotion()) {
      setDrawingId(null);
      onSelect(id);
      return;
    }

    setDrawingId(id);
  }

  function handleKeyDown(event: KeyboardEvent<SVGPathElement>, id: RegionId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate(id);
    }
  }

  // Região em foco visual: a que está sendo bordada agora tem prioridade
  // sobre a já revelada, para que o destaque apareça desde o clique.
  const focusId = drawingId ?? selectedId;

  return (
    <svg
      viewBox={BRAZIL_MAP_VIEWBOX}
      className="h-auto w-full max-w-xl mx-auto"
      role="group"
      aria-label="Mapa do Brasil dividido em cinco regiões"
    >
      {REGION_SHAPES.map((shape) => {
        const isSelected = focusId === shape.id;
        const isDimmed = focusId !== null && !isSelected;
        const isFocused = focusedId === shape.id;
        const isDrawing = drawingId === shape.id;
        const { path, labelX, labelY } = BRAZIL_REGION_PATHS[shape.id];

        return (
          <g key={shape.id}>
            <path
              d={path}
              role="button"
              tabIndex={0}
              aria-label={`Ver origem: ${getRegionName(shape.id)}`}
              aria-pressed={isSelected}
              onClick={() => handleActivate(shape.id)}
              onKeyDown={(event) => handleKeyDown(event, shape.id)}
              onFocus={() => setFocusedId(shape.id)}
              onBlur={() => setFocusedId((current) => (current === shape.id ? null : current))}
              fill={shape.color}
              stroke={BORDER_COLOR}
              strokeWidth={isSelected || isFocused ? 3.5 : 2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={isDimmed ? 0.65 : 1}
              className="cursor-pointer outline-none transition-all duration-300 ease-out hover:opacity-90"
              style={{ transformOrigin: "center" }}
            />

            {isDrawing && (
              <>
                <path
                  ref={overlayPathRef}
                  d={path}
                  fill="none"
                  stroke={shape.color}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                  style={{ filter: "drop-shadow(0 1px 1px rgba(61,43,31,0.35))" }}
                />
                <circle
                  ref={needleRef}
                  cx={0}
                  cy={0}
                  r={5}
                  fill={shape.color}
                  stroke="#FDF9F2"
                  strokeWidth={1.75}
                  pointerEvents="none"
                  style={{
                    opacity: 0,
                    willChange: "transform",
                    transition: "opacity 200ms ease-out",
                    filter: "drop-shadow(0 1px 2px rgba(61,43,31,0.45))",
                  }}
                />
              </>
            )}

            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              pointerEvents="none"
              opacity={isDimmed ? 0.65 : 1}
              className="select-none transition-opacity duration-300"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                fill: "#FDF9F2",
                letterSpacing: "0.02em",
                paintOrder: "stroke",
                stroke: "#3D2B1F",
                strokeWidth: 2.5,
                strokeLinejoin: "round",
              }}
            >
              {shape.shortLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
