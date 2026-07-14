/**
 * Nativa Store — Passaporte de Regiões
 * Guarda, entre visitas (localStorage), quais regiões do Mapa Vivo das
 * Origens o visitante já explorou nesta loja, e se ele já resgatou a
 * recompensa oferecida ao completar as 5 regiões.
 */

import type { RegionId } from "@/components/MapaOrigens/RegionSvg";
import { useCallback, useState } from "react";

const STORAGE_KEY = "nativa:regions-passport:v1";

interface PassportState {
  visited: RegionId[];
  rewardClaimed: boolean;
}

const EMPTY_STATE: PassportState = { visited: [], rewardClaimed: false };

function readStoredState(): PassportState {
  if (typeof window === "undefined") return EMPTY_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;

    const parsed = JSON.parse(raw) as Partial<PassportState>;
    return {
      visited: Array.isArray(parsed.visited) ? (parsed.visited as RegionId[]) : [],
      rewardClaimed: Boolean(parsed.rewardClaimed),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function writeStoredState(state: PassportState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponível (modo privado, cota excedida etc.) — a
    // experiência continua funcionando só para a sessão atual.
  }
}

interface UseRegionsPassportResult {
  visitedSet: Set<RegionId>;
  visitedCount: number;
  totalCount: number;
  isComplete: boolean;
  rewardClaimed: boolean;
  markVisited: (id: RegionId) => void;
  claimReward: () => void;
}

/** Acompanha o progresso do visitante pelas regiões do mapa vivo. */
export function useRegionsPassport(allRegionIds: readonly RegionId[]): UseRegionsPassportResult {
  const [state, setState] = useState<PassportState>(readStoredState);

  const markVisited = useCallback((id: RegionId) => {
    setState((current) => {
      if (current.visited.includes(id)) return current;
      const next: PassportState = { ...current, visited: [...current.visited, id] };
      writeStoredState(next);
      return next;
    });
  }, []);

  const claimReward = useCallback(() => {
    setState((current) => {
      if (current.rewardClaimed) return current;
      const next: PassportState = { ...current, rewardClaimed: true };
      writeStoredState(next);
      return next;
    });
  }, []);

  const visitedSet = new Set(state.visited);
  const visitedCount = allRegionIds.filter((id) => visitedSet.has(id)).length;

  return {
    visitedSet,
    visitedCount,
    totalCount: allRegionIds.length,
    isComplete: visitedCount >= allRegionIds.length,
    rewardClaimed: state.rewardClaimed,
    markVisited,
    claimReward,
  };
}
