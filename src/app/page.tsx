"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { CableLineCalculator } from "@/components/CableLineCalculator";
import { PenetrationCalculator } from "@/components/PenetrationCalculator";
import { ProjectSummary } from "@/components/ProjectSummary";
import { TechnicalReference } from "@/components/TechnicalReference";
import {
  projectStore,
  useProjectItems,
  ProjectItem,
} from "@/lib/projectStore";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "cable" | "penetration" | "summary" | "reference"
  >("cable");

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summaryCount={projectItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === "cable" && (
          <CableLineCalculator onAddToProject={handleAddToProject} />
        )}

        {activeTab === "penetration" && (
          <PenetrationCalculator onAddToProject={handleAddToProject} />
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
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 no-print mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400 font-mono">Alexander Afanasiev @</span>
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
