import { useSyncExternalStore } from "react";
import { CableLineResult, PenetrationResult } from "./calculations";

export type ProjectItemType = "cable_line" | "penetration";

export interface ProjectCableLineItem {
  id: string;
  type: "cable_line";
  title: string;
  timestamp: number;
  details: {
    installationTypeName: string;
    lengthM: number;
    dimensionMm: number;
    cableCount: number;
    humidityGt85: boolean;
  };
  result: CableLineResult;
}

export interface ProjectPenetrationItem {
  id: string;
  type: "penetration";
  title: string;
  timestamp: number;
  details: {
    shapeName: string;
    dimensionsText: string;
    cablesSummary: string;
    fireResistance: string;
    applicationMethodName: string;
    humidityGt85: boolean;
  };
  result: PenetrationResult;
}

export type ProjectItem = ProjectCableLineItem | ProjectPenetrationItem;

export interface ProjectConsolidatedTotals {
  totalKs1Kg: number;
  totalKs1Buckets: number;
  totalKs3Kg: number;
  totalSp2Kg: number;
  totalBoardM2: number;
  totalWoolKg: number;
  totalPositions: number;
}

export function calculateProjectTotals(items: ProjectItem[]): ProjectConsolidatedTotals {
  let totalKs1Kg = 0;
  let totalKs3Kg = 0;
  let totalSp2Kg = 0;
  let totalBoardM2 = 0;
  let totalWoolKg = 0;

  for (const item of items) {
    if (item.type === "cable_line") {
      totalKs1Kg += item.result.ks1MassKg;
      totalSp2Kg += item.result.sp2MassKg;
    } else if (item.type === "penetration" && !item.result.isBlocked) {
      totalKs1Kg += item.result.ks1MassKg;
      totalKs3Kg += item.result.ks3MassKg;
      totalSp2Kg += item.result.sp2MassKg;
      totalBoardM2 += item.result.boardAreaM2;
      totalWoolKg += item.result.mineralWoolMassKg;
    }
  }

  const totalKs1Buckets = Math.ceil(totalKs1Kg / 12.5);

  return {
    totalKs1Kg: Math.round(totalKs1Kg * 100) / 100,
    totalKs1Buckets,
    totalKs3Kg: Math.round(totalKs3Kg * 100) / 100,
    totalSp2Kg: Math.round(totalSp2Kg * 100) / 100,
    totalBoardM2: Math.round(totalBoardM2 * 100) / 100,
    totalWoolKg: Math.round(totalWoolKg * 100) / 100,
    totalPositions: items.length,
  };
}

// ==========================================
// STORE СИНХРОНИЗАЦИИ ДЛЯ REACT 19 (useSyncExternalStore)
// ==========================================

const STORAGE_KEY = "pyro_safe_project_items";
const emptyList: ProjectItem[] = [];

let memoryItems: ProjectItem[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function initStoreIfNeeded() {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          memoryItems = parsed;
        }
      }
    } catch {
      // ignore
    }
  }
}

function notify() {
  listeners.forEach((l) => l());
}

export const projectStore = {
  add(item: ProjectItem) {
    initStoreIfNeeded();
    memoryItems = [item, ...memoryItems];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryItems));
    } catch {
      // ignore
    }
    notify();
  },
  remove(id: string) {
    initStoreIfNeeded();
    memoryItems = memoryItems.filter((i) => i.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryItems));
    } catch {
      // ignore
    }
    notify();
  },
  clear() {
    initStoreIfNeeded();
    memoryItems = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    notify();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): ProjectItem[] {
    initStoreIfNeeded();
    return memoryItems;
  },
  getServerSnapshot(): ProjectItem[] {
    return emptyList;
  },
};

export function useProjectItems(): ProjectItem[] {
  return useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getSnapshot,
    projectStore.getServerSnapshot
  );
}
