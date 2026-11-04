"use client";

import React from "react";
import { ProjectFlammotectPenetrationItem } from "@/lib/projectStore";
import { Flame } from "lucide-react";
import { usePenetrationCalculator } from "./penetration/usePenetrationCalculator";
import { PenetrationGeometrySection } from "./penetration/PenetrationGeometrySection";
import { PenetrationPenetrantsSection } from "./penetration/PenetrationPenetrantsSection";
import { PenetrationResultsSection } from "./penetration/PenetrationResultsSection";

export interface FlammotectPenetrationCalculatorProps {
  onAddToProject?: (item: ProjectFlammotectPenetrationItem) => void;
}

export function FlammotectPenetrationCalculator({
  onAddToProject,
}: FlammotectPenetrationCalculatorProps) {
  const calc = usePenetrationCalculator({ onAddToProject });

  return (
    <div className="space-y-8">
      {/* Header banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Регламент 2022 • Двухслойная проходка Double Layer EI 120</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center">
              <Flame className="w-6 h-6 mr-2.5 text-rose-500" />
              Проходки: PYRO-SAFE FLAMMOTECT (Double layer)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Огнестойкие кабельные и трубные проходки для стен (≥ 100 мм) и перекрытий (≥ 150 мм).
              Комбинация 2-х слоев жестких минераловатных плит по 60 мм, абляционной краски FLAMMOTECT-A coating, огнестойкой шпаклевки filler и бандажей DG-CR BS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800/40">
              Предел огнестойкости: EI 120
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Габариты до 1400×2000 мм
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-950 text-teal-300 border border-teal-800/40">
              АЭС гермозона
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Penetrants */}
        <div className="lg:col-span-7 space-y-6">
          <PenetrationGeometrySection calc={calc} />
          <PenetrationPenetrantsSection calc={calc} />
        </div>

        {/* Right Column: Output & Spec */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <PenetrationResultsSection calc={calc} />
        </div>
      </div>
    </div>
  );
}
