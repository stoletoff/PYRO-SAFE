"use client";

import React, { useState } from "react";
import {
  ProjectItem,
  calculateProjectTotals,
} from "@/lib/projectStore";
import {
  Layers,
  Trash2,
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  Package,
  Droplets,
} from "lucide-react";

interface ProjectSummaryProps {
  items: ProjectItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onNavigateToTab: (tab: "cable" | "penetration") => void;
}

export function ProjectSummary({
  items,
  onRemoveItem,
  onClearAll,
  onNavigateToTab,
}: ProjectSummaryProps) {
  const [copied, setCopied] = useState(false);
  const totals = calculateProjectTotals(items);

  const handleCopySpec = () => {
    if (items.length === 0) return;

    let text = `=== СВОДНАЯ СПЕЦИФИКАЦИЯ МАТЕРИАЛОВ PYRO-SAFE (svt Brandschutz) ===\n`;
    text += `Дата формирования: ${new Date().toLocaleDateString("ru-RU")}\n`;
    text += `Всего позиций в проекте: ${items.length}\n\n`;

    text += `ПОЗИЦИИ ПРОЕКТА:\n`;
    items.forEach((item, idx) => {
      if (item.type === "cable_line") {
        text += `${idx + 1}. [Кабельная линия] ${item.title}\n`;
        text += `   - Длина: ${item.details.lengthM} м, S = ${item.result.areaM2} м²\n`;
        text += `   - KS 1: ${item.result.ks1MassKg} кг (${item.result.ks1BucketsCount} вёдер)\n`;
        if (item.result.sp2MassKg > 0) {
          text += `   - SP-2: ${item.result.sp2MassKg} кг\n`;
        }
      } else {
        text += `${idx + 1}. [Проходка UNIVERSALSCHOTT] ${item.title}\n`;
        text += `   - Размеры: ${item.details.dimensionsText}, Предел: ${item.details.fireResistance}\n`;
        text += `   - Минплита: ${item.result.boardAreaM2} м² (${item.result.boardLayers} сл.), Минвата: ${item.result.mineralWoolMassKg} кг\n`;
        text += `   - KS 1: ${item.result.ks1MassKg} кг (${item.result.ks1BucketsCount} вёдер), KS 3: ${item.result.ks3MassKg} кг\n`;
        if (item.result.sp2MassKg > 0) {
          text += `   - SP-2: ${item.result.sp2MassKg} кг\n`;
        }
      }
      text += `\n`;
    });

    text += `ИТОГОВАЯ ВЕДОМОСТЬ МАТЕРИАЛОВ ДЛЯ ЗАКУПКИ:\n`;
    text += `1. FLAMMOPLAST KS 1: ${totals.totalKs1Kg} кг (${totals.totalKs1Buckets} вёдер по 12.5 кг)\n`;
    text += `2. PYRO-SAFE KS 3 (мастика): ${totals.totalKs3Kg} кг\n`;
    text += `3. Защитный лак PYRO-SAFE SP-2: ${totals.totalSp2Kg} кг\n`;
    text += `4. Жесткая минплита (150 кг/м³): ${totals.totalBoardM2} м²\n`;
    text += `5. Рассыпная базальтовая минвата: ${totals.totalWoolKg} кг\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;

    let csv = "\uFEFF"; // UTF-8 BOM for Excel
    csv += "№,Наименование позиции,Тип,Параметры,Площадь (м2),FLAMMOPLAST KS 1 (кг),Ведра KS 1 (12.5кг),PYRO-SAFE KS 3 (кг),Лак SP-2 (кг),Минплита (м2),Минвата (кг)\n";

    items.forEach((item, idx) => {
      if (item.type === "cable_line") {
        csv += `${idx + 1},"${item.title.replace(/"/g, '""')}","Кабельная линия","L=${item.details.lengthM}м, d/b=${item.details.dimensionMm}мм",${item.result.areaM2},${item.result.ks1MassKg},${item.result.ks1BucketsCount},0,${item.result.sp2MassKg},0,0\n`;
      } else {
        csv += `${idx + 1},"${item.title.replace(/"/g, '""')}","Проходка UNIVERSALSCHOTT","${item.details.dimensionsText}, ${item.details.fireResistance}",${item.result.openingAreaM2},${item.result.ks1MassKg},${item.result.ks1BucketsCount},${item.result.ks3MassKg},${item.result.sp2MassKg},${item.result.boardAreaM2},${item.result.mineralWoolMassKg}\n`;
      }
    });

    csv += `ИТОГО,,,,,"${totals.totalKs1Kg}","${totals.totalKs1Buckets}","${totals.totalKs3Kg}","${totals.totalSp2Kg}","${totals.totalBoardM2}","${totals.totalWoolKg}"\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PYRO-SAFE_Спецификация_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Intro banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Сводная ведомость объекта
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Спецификация и ведомость материалов для закупки
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Объединенный расчет огнезащитных материалов по всем кабельным трассам и проходкам здания с расчетом количества стандартной тары.
            </p>
          </div>

          <div className="flex items-center space-x-2 no-print">
            <button
              type="button"
              disabled={items.length === 0}
              onClick={handleExportCSV}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1.5 text-orange-400" />
              Экспорт в Excel (CSV)
            </button>

            <button
              type="button"
              disabled={items.length === 0}
              onClick={handleCopySpec}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-400" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5 text-slate-300" />
                  Копировать
                </>
              )}
            </button>

            <button
              type="button"
              disabled={items.length === 0}
              onClick={() => window.print()}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white shadow-md shadow-orange-950/40 transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Печать спецификации
            </button>
          </div>
        </div>
      </div>

      {/* CONSOLIDATED MATERIAL TOTALS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* FLAMMOPLAST KS 1 */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-orange-950/40 to-slate-900 border border-orange-900/50 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-orange-300 font-semibold uppercase tracking-wider">
              FLAMMOPLAST KS 1
            </span>
            <Package className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalKs1Kg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs font-mono text-orange-400 font-bold bg-orange-950/80 border border-orange-800/40 px-2 py-1 rounded inline-block">
              {totals.totalKs1Buckets} вёдер по 12.5 кг
            </div>
          </div>
        </div>

        {/* PYRO-SAFE KS 3 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              PYRO-SAFE KS 3 (мастика)
            </span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalKs3Kg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              для герметизации швов
            </div>
          </div>
        </div>

        {/* PYRO-SAFE SP-2 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider">
              Защитный лак SP-2
            </span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalSp2Kg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              влагозащита &gt; 85%
            </div>
          </div>
        </div>

        {/* Mineral Wool Boards */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              Минплита (150 кг/м³)
            </span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalBoardM2} <span className="text-sm font-normal text-slate-400">м²</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              плиты толщиной 50 мм
            </div>
          </div>
        </div>

        {/* Loose Mineral Wool */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              Рассыпная минвата
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalWoolKg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              уплотнение пустот
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED POSITIONS TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 card-print">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center">
            <Layers className="w-4 h-4 text-orange-400 mr-2" />
            Состав спецификации объекта ({items.length} поз.)
          </h3>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300 flex items-center no-print transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Очистить все
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">
                Спецификация пока пуста
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Перейдите во вкладку «Огнезащита кабельных линий» или «Кабельные проходки», выполните расчет и нажмите кнопку «В спецификацию».
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={() => onNavigateToTab("cable")}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-colors"
              >
                К расчету кабельных линий
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab("penetration")}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                К расчету проходок
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">№</th>
                  <th className="py-3 px-3">Позиция / Назначение</th>
                  <th className="py-3 px-3">Тип системы</th>
                  <th className="py-3 px-3">Параметры</th>
                  <th className="py-3 px-3">Площадь</th>
                  <th className="py-3 px-3 text-orange-400 font-bold">KS 1 (кг)</th>
                  <th className="py-3 px-3">Вёдра (шт)</th>
                  <th className="py-3 px-3">KS 3 (кг)</th>
                  <th className="py-3 px-3">SP-2 (кг)</th>
                  <th className="py-3 px-3">Минплита</th>
                  <th className="py-3 px-3 no-print">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {items.map((item, index) => {
                  const isCable = item.type === "cable_line";
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                      <td className="py-3 px-3 font-sans font-medium text-white max-w-[200px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${
                            isCable
                              ? "bg-orange-950/80 text-orange-300 border border-orange-800/40"
                              : "bg-red-950/80 text-red-300 border border-red-800/40"
                          }`}
                        >
                          {isCable ? "Кабельная линия" : "UNIVERSALSCHOTT"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {isCable
                          ? `L=${item.details.lengthM}м, d/b=${item.details.dimensionMm}мм`
                          : `${item.details.dimensionsText} (${item.details.fireResistance})`}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {isCable ? item.result.areaM2 : item.result.openingAreaM2} м²
                      </td>
                      <td className="py-3 px-3 text-orange-400 font-bold">
                        {item.result.ks1MassKg}
                      </td>
                      <td className="py-3 px-3 text-white">
                        {item.result.ks1BucketsCount}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {!isCable ? item.result.ks3MassKg : "—"}
                      </td>
                      <td className="py-3 px-3 text-sky-300">
                        {item.result.sp2MassKg > 0 ? item.result.sp2MassKg : "—"}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {!isCable ? `${item.result.boardAreaM2} м²` : "—"}
                      </td>
                      <td className="py-3 px-3 no-print">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Удалить позицию"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
