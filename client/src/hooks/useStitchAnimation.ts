/**
 * Animação de "bordado" reutilizável (MapaOrigens + Quiz).
 * stroke-dasharray/dashoffset + agulha via getPointAtLength.
 */

import { useLayoutEffect, useRef, type RefObject } from "react";

export const STITCH_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

/** Duração no mapa (mais longa — interação única). */
export const STITCH_DURATION_MAP_MS = 1800;

/** Duração no quiz (mais curta — várias respostas). */
export const STITCH_DURATION_QUIZ_MS = 750;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface UseStitchAnimationOptions {
  /** Quando true, inicia o bordado no path. */
  active: boolean;
  pathRef: RefObject<SVGPathElement | null>;
  needleRef: RefObject<SVGCircleElement | null>;
  durationMs: number;
  /** Muda para reiniciar a animação (ex: id da região no mapa). */
  token?: string | null;
  onComplete?: () => void;
}

/**
 * Anima o traço + agulha no path referenciado.
 * Chama onComplete ao terminar (ou imediatamente se reduced-motion).
 */
export function useStitchAnimation({
  active,
  pathRef,
  needleRef,
  durationMs,
  token = null,
  onComplete,
}: UseStitchAnimationOptions) {
  const onCompleteRef = useRef(onComplete);
  useLayoutEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  useLayoutEffect(() => {
    if (!active) return;

    if (prefersReducedMotion()) {
      onCompleteRef.current?.();
      return;
    }

    const pathEl = pathRef.current;
    const needle = needleRef.current;
    if (!pathEl) {
      onCompleteRef.current?.();
      return;
    }

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
      const progress = Math.min(elapsed / durationMs, 1);
      const point = pathEl!.getPointAtLength(progress * totalLength);
      if (needle) {
        needle.style.transform = `translate(${point.x}px, ${point.y}px)`;
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
        if (needle) needle.style.opacity = "0";
        onCompleteRef.current?.();
      }
    }

    rafIdRef.current = requestAnimationFrame(() => {
      pathEl.style.transition = `stroke-dashoffset ${durationMs}ms ${STITCH_EASING}`;
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
  }, [active, pathRef, needleRef, durationMs, token]);
}
