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
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-lg shadow-orange-950/50">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white font-mono">
                  FRC CALCULATION
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Инженерный калькулятор расхода огнезащитных материалов
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 no-print">
            <button
              onClick={() => setActiveTab("reference")}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "reference"
                ? "bg-slate-800 text-orange-400 border border-orange-500/30"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              <span className="hidden md:inline">Техрегламент & Нормативы</span>
              <span className="md:hidden">Справка</span>
            </button>

            <button
              onClick={() => setActiveTab("summary")}
              className={`relative inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "summary"
                ? "bg-orange-600 text-white shadow-md shadow-orange-900/40"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
            >
              <Layers className="w-4 h-4 mr-1.5" />
              <span>Спецификация</span>
              {summaryCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold leading-none text-white bg-orange-500 rounded-full">
                  {summaryCount}
                </span>
              )}
            </button>

            <button
              onClick={handlePrint}
              title="Печать или экспорт в PDF"
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Печать / PDF</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-4 border-t border-slate-800/80 py-2 no-print overflow-x-auto">
          <button
            onClick={() => setActiveTab("cable")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === "cable"
              ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
          >
            <ShieldCheck className="w-4 h-4 mr-2 text-orange-500" />
            Огнезащита кабельных линий (FLAMMOPLAST KS 1)
          </button>

          <button
            onClick={() => setActiveTab("penetration")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === "penetration"
              ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
          >
            <Flame className="w-4 h-4 mr-2 text-red-500" />
            Кабельные проходки (UNIVERSALSCHOTT)
          </button>

          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === "summary"
              ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
          >
            <Layers className="w-4 h-4 mr-2 text-amber-500" />
            Сводная ведомость проекта
            {summaryCount > 0 && (
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-orange-300 font-mono">
                {summaryCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
