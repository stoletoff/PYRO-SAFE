"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface FormulaTooltipProps {
  title: string;
  formula: string;
  calculation: string;
  notes?: string;
}

export function FormulaTooltip({
  title,
  formula,
  calculation,
  notes,
}: FormulaTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center ml-1.5 align-middle"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="text-slate-400 hover:text-rose-400 focus:text-rose-400 transition-colors p-0.5 rounded-full hover:bg-slate-800 focus:outline-none"
        aria-label={`Формула расчета: ${title}`}
        title="Показать формулу расчета"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs z-50 text-slate-200 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Arrow */}
          <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45" />

          <div className="font-semibold text-rose-300 mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1">
            <span>{title}</span>
            <span className="text-[10px] text-slate-400 font-mono">Регламент 2022</span>
          </div>

          <div className="space-y-2 my-1.5">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">
                Нормативная формула:
              </span>
              <div className="font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px]">
                {formula}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">
                Расчет по вашим параметрам:
              </span>
              <div className="font-mono text-white bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px] leading-relaxed whitespace-pre-line">
                {calculation}
              </div>
            </div>
          </div>

          {notes && (
            <p className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800 leading-normal">
              {notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

