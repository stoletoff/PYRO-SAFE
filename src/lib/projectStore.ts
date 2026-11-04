import { useSyncExternalStore } from "react";
import {
  FlammotectCableResult,
  FlammotectPenetrationResult,
} from "./calculations";

export type ProjectItemType =
  | "cable_flammotect"
  | "penetration_flammotect";

export interface ProjectFlammotectCableItem {
  id: string;
  type: "cable_flammotect";
  title: string;
  timestamp: number;
  details: {
    installationTypeName: string;
    lengthM: number;
    dimensionMm: number;
    cableCount: number;
    shelvesCount: number;
    dryFilmThicknessMm: number;
    applicationMethodName: string;
    bundleSummary?: string;
    bundleCablesCount?: number;
  };
  result: FlammotectCableResult;
}

export interface ProjectFlammotectPenetrationItem {
  id: string;
  type: "penetration_flammotect";
  title: string;
  timestamp: number;
  details: {
    shapeName: string;
    dimensionsText: string;
    penetrantsSummary: string;
    applicationMethodName: string;
    locationTypeName: string;
    sleeveTag?: string;
    sleeveSpec?: string;
    wallThicknessMm?: number;
    count?: number;
  };
  result: FlammotectPenetrationResult;
}

export type ProjectItem =
  | ProjectFlammotectCableItem
  | ProjectFlammotectPenetrationItem;

export interface ProjectConsolidatedTotals {
  totalFlammotectCoatingKg: number;
  totalFlammotectCoatingBuckets: number;
  totalFlammotectFillerKg: number;
  totalFlammotectFillerBuckets: number;
  totalBoardM2: number;
  totalWoolKg: number;
  totalDgCrBsMeters: number;
  totalPositions: number;
}

export function calculateProjectTotals(items: ProjectItem[]): ProjectConsolidatedTotals {
  let totalFlammotectCoatingKg = 0;
  let totalFlammotectFillerKg = 0;
  let totalBoardM2 = 0;
  let totalWoolKg = 0;
  let totalDgCrBsMeters = 0;

  for (const item of items) {
    if (item.type === "cable_flammotect") {
      totalFlammotectCoatingKg += item.result.flammotectMassKg;
    } else if (item.type === "penetration_flammotect" && !item.result.isBlocked) {
      totalFlammotectCoatingKg += item.result.coatingMassKg;
      totalFlammotectFillerKg += item.result.fillerMassKg;
      totalBoardM2 += item.result.boardAreaM2;
      totalWoolKg += item.result.looseWoolMassKg;
      totalDgCrBsMeters += item.result.dgCrBsMeters;
    }
  }

  const totalFlammotectCoatingBuckets = Math.ceil(totalFlammotectCoatingKg / 12.5);
  const totalFlammotectFillerBuckets = Math.ceil(totalFlammotectFillerKg / 12.5);

  return {
    totalFlammotectCoatingKg: Math.round(totalFlammotectCoatingKg * 100) / 100,
    totalFlammotectCoatingBuckets,
    totalFlammotectFillerKg: Math.round(totalFlammotectFillerKg * 100) / 100,
    totalFlammotectFillerBuckets,
    totalBoardM2: Math.round(totalBoardM2 * 1000) / 1000,
    totalWoolKg: Math.round(totalWoolKg * 1000) / 1000,
    totalDgCrBsMeters: Math.round(totalDgCrBsMeters * 100) / 100,
    totalPositions: items.length,
  };
}

// ==========================================
// STORE СИНХРОНИЗАЦИИ ДЛЯ REACT 19 (useSyncExternalStore)
// ==========================================

const STORAGE_KEY = "pyro_safe_flammotect_project_items";
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
    memoryItems = [...memoryItems, item];
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
  moveUp(id: string) {
    initStoreIfNeeded();
    const idx = memoryItems.findIndex((i) => i.id === id);
    if (idx > 0) {
      const copy = [...memoryItems];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      memoryItems = copy;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryItems));
      } catch {
        // ignore
      }
      notify();
    }
  },
  moveDown(id: string) {
    initStoreIfNeeded();
    const idx = memoryItems.findIndex((i) => i.id === id);
    if (idx >= 0 && idx < memoryItems.length - 1) {
      const copy = [...memoryItems];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      memoryItems = copy;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryItems));
      } catch {
        // ignore
      }
      notify();
    }
  },
  reverseOrder() {
    initStoreIfNeeded();
    memoryItems = [...memoryItems].reverse();
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
  getItems(): ProjectItem[] {
    initStoreIfNeeded();
    return memoryItems;
  },
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
};

export function useProjectItems(): ProjectItem[] {
  return useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getItems,
    () => emptyList
  );
}
