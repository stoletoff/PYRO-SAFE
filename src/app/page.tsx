"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { CableLineCalculator } from "@/components/CableLineCalculator";
import { PenetrationCalculator } from "@/components/PenetrationCalculator";
import { ProjectSummary } from "@/components/ProjectSummary";
import { TechnicalReference } from "@/components/TechnicalReference";
import { FireBackground } from "@/components/FireBackground";
import {
  projectStore,
  useProjectItems,
  ProjectItem,
} from "@/lib/projectStore";
function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

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
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
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
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-8 no-print mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="text-slate-400">Контакты:</span>
            <span className="font-medium text-slate-300 font-mono">Alexander Afanasiev</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a
              href="https://github.com/stoletoff"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-slate-300 hover:text-orange-400 transition-colors py-1 px-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 shadow-sm"
              title="GitHub профиль stoletoff"
            >
              <GithubIcon className="w-3.5 h-3.5 fill-current text-slate-200" />
              <span className="font-mono">https://github.com/stoletoff</span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("reference")}
              className="hover:text-slate-300 transition-colors"
            >
              Технический регламент
            </button>
            <span>•</span>
            <span>FRC CALCULATION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
