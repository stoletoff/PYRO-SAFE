"use client";

import React from "react";
import { Flame, ShieldCheck, Printer, BookOpen, Layers } from "lucide-react";

interface HeaderProps {
  activeTab: "cable" | "penetration" | "summary" | "reference";
  setActiveTab: (tab: "cable" | "penetration" | "summary" | "reference") => void;
  summaryCount: number;
}

export function Header({ activeTab, setActiveTab, summaryCount }: HeaderProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Brand & Actions Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-lg shadow-orange-950/50 shrink-0">
              <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0 truncate">
              <span className="text-base sm:text-2xl font-black tracking-tight text-white font-mono truncate block">
                FRC CALCULATION
              </span>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Инженерный калькулятор расхода огнезащитных материалов
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0 no-print">
            <button
              onClick={() => setActiveTab("reference")}
              title="Техрегламент & Нормативы"
              className={`inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "reference"
                  ? "bg-slate-800 text-orange-400 border border-orange-500/30"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden md:inline">Техрегламент & Нормативы</span>
              <span className="hidden sm:inline md:hidden">Справка</span>
            </button>

            <button
              onClick={() => setActiveTab("summary")}
              title="Спецификация проекта"
              className={`relative inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "summary"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-900/40"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              <Layers className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Спецификация</span>
              {summaryCount > 0 && (
                <span className="sm:ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold leading-none text-white bg-orange-500 rounded-full">
                  {summaryCount}
                </span>
              )}
            </button>

            <button
              onClick={handlePrint}
              title="Печать или экспорт в PDF"
              className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Печать / PDF</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="w-full max-w-full overflow-x-auto no-scrollbar border-t border-slate-800/80 py-2 no-print">
          <div className="flex space-x-1 sm:space-x-3 w-max min-w-full">
            <button
              onClick={() => setActiveTab("cable")}
              className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeTab === "cable"
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5 sm:mr-2 text-orange-500 shrink-0" />
              <span className="hidden sm:inline">Огнезащита кабельных линий (FLAMMOPLAST KS 1)</span>
              <span className="sm:hidden">Кабельные линии</span>
            </button>

            <button
              onClick={() => setActiveTab("penetration")}
              className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeTab === "penetration"
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Flame className="w-4 h-4 mr-1.5 sm:mr-2 text-red-500 shrink-0" />
              <span className="hidden sm:inline">Кабельные проходки (UNIVERSALSCHOTT)</span>
              <span className="sm:hidden">Кабельные проходки</span>
            </button>

            <button
              onClick={() => setActiveTab("summary")}
              className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeTab === "summary"
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Layers className="w-4 h-4 mr-1.5 sm:mr-2 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Сводная ведомость проекта</span>
              <span className="sm:hidden">Сводная ведомость</span>
              {summaryCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] bg-slate-800 text-orange-300 font-mono">
                  {summaryCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
