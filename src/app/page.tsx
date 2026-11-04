"use client";

import React, { useState } from "react";
import { Header, TabType } from "@/components/Header";
import { FlammotectCableCalculator } from "@/components/FlammotectCableCalculator";
import { FlammotectPenetrationCalculator } from "@/components/FlammotectPenetrationCalculator";
import { ProjectSummary } from "@/components/ProjectSummary";
import { TechnicalReference } from "@/components/TechnicalReference";
import { FireBackground } from "@/components/FireBackground";
import {
  projectStore,
  useProjectItems,
  ProjectItem,
} from "@/lib/projectStore";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("cable");

  const projectItems = useProjectItems();

  const handleAddToProject = (item: ProjectItem) => {
    projectStore.add(item);
  };

  const handleRemoveItem = (id: string) => {
    projectStore.remove(id);
  };

  const handleClearAll = () => {
    if (confirm("Вы действительно хотите удалить все позиции из спецификации проекта?")) {
      projectStore.clear();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Animated Lightweight Fire Background */}
      <FireBackground />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summaryCount={projectItems.length}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === "cable" && (
          <FlammotectCableCalculator onAddToProject={handleAddToProject} />
        )}

        {activeTab === "penetration" && (
          <FlammotectPenetrationCalculator onAddToProject={handleAddToProject} />
        )}

        {activeTab === "summary" && (
          <ProjectSummary
            items={projectItems}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "reference" && <TechnicalReference />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-8 no-print mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400 font-mono">
              PYRO-SAFE FLAMMOTECT-A • EI 120 (Регламент 2022)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("reference")}
              className="hover:text-slate-300 transition-colors"
            >
              Технический регламент
            </button>
            <span>•</span>
            <span>Статический экспорт (GitHub Pages)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
