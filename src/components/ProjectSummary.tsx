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
  Package,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";

interface ProjectSummaryProps {
  items: ProjectItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onNavigateToTab: (tab: "cable" | "penetration") => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onReverse?: () => void;
}

export function ProjectSummary({
  items,
  onRemoveItem,
  onClearAll,
  onNavigateToTab,
  onMoveUp,
  onMoveDown,
  onReverse,
}: ProjectSummaryProps) {
  const [copied, setCopied] = useState(false);
  const totals = calculateProjectTotals(items);

  const handleCopySpec = () => {
    if (items.length === 0) return;

    let text = `=== СВОДНАЯ СПЕЦИФИКАЦИЯ МАТЕРИАЛОВ PYRO-SAFE FLAMMOTECT ===\n`;
    text += `Регламенты ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH (2022)\n`;
    text += `Дата формирования: ${new Date().toLocaleDateString("ru-RU")}\n`;
    text += `Всего позиций в проекте: ${items.length}\n\n`;

    text += `ПОЗИЦИИ ПРОЕКТА:\n`;
    items.forEach((item, idx) => {
      if (item.type === "cable_flammotect") {
        text += `${idx + 1}. [Кабельная линия FLAMMOTECT-A] ${item.title}\n`;
        if (item.details.bundleSummary) {
          text += `   - Состав пучка: ${item.details.bundleSummary} (D = ${item.details.dimensionMm} мм)\n`;
        }
        text += `   - Длина: ${item.details.lengthM} м, S = ${item.result.areaM2} м², сухой слой: ${item.details.dryFilmThicknessMm} мм\n`;
        text += `   - FLAMMOTECT-A: ${item.result.flammotectMassKg} кг (${item.result.flammotectBucketsCount} вёдер по 12.5 кг)\n`;
      } else if (item.type === "penetration_flammotect") {
        const countStr = item.details.count && item.details.count > 1 ? ` (${item.details.count} шт.)` : "";
        const spec = item.details.sleeveTag
          ? `[${item.details.sleeveTag}] ${item.details.sleeveSpec || item.details.dimensionsText}${countStr}`
          : `${item.details.dimensionsText}${countStr}`;
        text += `${idx + 1}. [Проходка / Гильза Double Layer EI 120] ${item.title}\n`;
        text += `   - Параметры: ${spec}\n`;
        text += `   - FLAMMOTECT-A coating: ${item.result.coatingMassKg} кг (${item.result.coatingBucketsCount} вёдер)\n`;
        text += `   - FLAMMOTECT-A filler: ${item.result.fillerMassKg} кг (${item.result.fillerBucketsCount} вёдер)\n`;
        text += `   - Минплита 150 кг/м³ (2×60 мм): ${item.result.boardAreaM2} м²\n`;
        text += `   - Базальтовая минвата: ${item.result.looseWoolMassKg} кг\n`;
        if (item.result.dgCrBsMeters > 0) {
          text += `   - Бандаж DG-CR BS: ${item.result.dgCrBsMeters} пог. м\n`;
        }
      }
      text += `\n`;
    });

    text += `ИТОГОВАЯ ВЕДОМОСТЬ МАТЕРИАЛОВ ДЛЯ ЗАКУПКИ (РАЗДЕЛ ЭОМ):\n`;
    if (totals.totalFlammotectCoatingKg > 0) {
      text += `• PYRO-SAFE FLAMMOTECT-A coating (краска): ${totals.totalFlammotectCoatingKg} кг (${totals.totalFlammotectCoatingBuckets} вёдер по 12.5 кг)\n`;
    }
    if (totals.totalFlammotectFillerKg > 0) {
      text += `• PYRO-SAFE FLAMMOTECT-A filler (шпаклевка): ${totals.totalFlammotectFillerKg} кг (${totals.totalFlammotectFillerBuckets} вёдер по 12.5 кг)\n`;
    }
    if (totals.totalBoardM2 > 0) {
      text += `• Минераловатная жесткая плита 150 кг/м³ (толщина 60 мм): ${totals.totalBoardM2} м²\n`;
    }
    if (totals.totalWoolKg > 0) {
      text += `• Базальтовая минеральная вата (150 кг/м³): ${totals.totalWoolKg} кг\n`;
    }
    if (totals.totalDgCrBsMeters > 0) {
      text += `• Огнезащитная обмотка PYRO-SAFE DG-CR BS: ${totals.totalDgCrBsMeters} пог. м\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;

    let csv = "\uFEFF"; // UTF-8 BOM for Excel
    csv += "№,Позиция,Тип системы,Параметры,Площадь (м2),FLAMMOTECT-A coating (кг),FLAMMOTECT-A filler (кг),Минплита 150 кг/м3 (м2),Минвата (кг),Бандаж DG-CR BS (м)\n";

    items.forEach((item, idx) => {
      if (item.type === "cable_flammotect") {
        const desc = item.details.bundleSummary
          ? `Пучок [${item.details.bundleSummary}] D=${item.details.dimensionMm}мм, L=${item.details.lengthM}м`
          : `L=${item.details.lengthM}м, DFT=${item.details.dryFilmThicknessMm}мм`;
        csv += `${idx + 1},"${item.title.replace(/"/g, '""')}","Кабели FLAMMOTECT-A","${desc.replace(/"/g, '""')}",${item.result.areaM2},${item.result.flammotectMassKg},0,0,0,0\n`;
      } else if (item.type === "penetration_flammotect") {
        const countStr = item.details.count && item.details.count > 1 ? ` (${item.details.count} шт.)` : "";
        const spec = item.details.sleeveTag
          ? `[${item.details.sleeveTag}] ${item.details.sleeveSpec || item.details.dimensionsText}${countStr}`
          : `${item.details.dimensionsText}${countStr}`;
        csv += `${idx + 1},"${item.title.replace(/"/g, '""')}","Double Layer EI 120","${spec.replace(/"/g, '""')}",${item.result.openingAreaM2},${item.result.coatingMassKg},${item.result.fillerMassKg},${item.result.boardAreaM2},${item.result.looseWoolMassKg},${item.result.dgCrBsMeters}\n`;
      }
    });

    csv += `ИТОГО,,,,,"${totals.totalFlammotectCoatingKg}","${totals.totalFlammotectFillerKg}","${totals.totalBoardM2}","${totals.totalWoolKg}","${totals.totalDgCrBsMeters}"\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PYRO-SAFE_FLAMMOTECT_Спецификация_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Спецификация материалов раздела ЭОМ
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Сводная ведомость материалов PYRO-SAFE FLAMMOTECT
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Объединенный расчет огнезащитных материалов по кабельным трассам и проходкам/гильзам (система FLAMMOTECT-A и Double Layer EI 120) по нормативам Регламента 2022 года с расчетом количества стандартной тары.
            </p>
          </div>

          <div className="flex items-center space-x-2 no-print">
            <button
              type="button"
              disabled={items.length === 0}
              onClick={handleExportCSV}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1.5 text-rose-400" />
              Экспорт в CSV
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
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white shadow-md shadow-rose-950/40 transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Печать спецификации
            </button>
          </div>
        </div>
      </div>

      {/* CONSOLIDATED MATERIAL TOTALS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FLAMMOTECT-A coating */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-teal-950/40 to-slate-900 border border-teal-800/50 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-teal-300 font-semibold uppercase tracking-wider">
              FLAMMOTECT-A (краска)
            </span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalFlammotectCoatingKg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs font-mono text-teal-300 font-bold bg-teal-950/80 border border-teal-800/40 px-2 py-1 rounded inline-block">
              {totals.totalFlammotectCoatingBuckets} вёдер по 12.5 кг
            </div>
          </div>
        </div>

        {/* FLAMMOTECT-A filler */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-900/50 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-semibold uppercase tracking-wider">
              FLAMMOTECT-A filler
            </span>
            <Sparkles className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalFlammotectFillerKg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs font-mono text-rose-300 font-bold bg-rose-950/80 border border-rose-800/40 px-2 py-1 rounded inline-block">
              {totals.totalFlammotectFillerBuckets} вёдер по 12.5 кг
            </div>
          </div>
        </div>

        {/* Mineral Wool Boards */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
              Минплита 150 кг/м³
            </span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalBoardM2} <span className="text-sm font-normal text-slate-400">м²</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Double Layer EI 120 (2×60 мм)
            </div>
          </div>
        </div>

        {/* Loose Mineral Wool */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              Базальтовая минвата
            </span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalWoolKg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              заделка зазоров и гильз (1,52 кг/м²)
            </div>
          </div>
        </div>

        {/* DG-CR BS wrap (if plastic pipes present) */}
        {totals.totalDgCrBsMeters > 0 && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-300 font-semibold uppercase tracking-wider">
                Бандаж DG-CR BS
              </span>
              <ShieldCheck className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-white font-mono">
                {totals.totalDgCrBsMeters} <span className="text-sm font-normal text-slate-400">м</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                для пластиковых горючих труб
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED POSITIONS TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 card-print">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center">
            <Layers className="w-4 h-4 text-rose-400 mr-2" />
            Состав спецификации объекта ({items.length} поз.)
          </h3>

          {items.length > 0 && (
            <div className="flex items-center space-x-3 no-print">
              {onReverse && (
                <button
                  type="button"
                  onClick={onReverse}
                  className="text-xs text-slate-400 hover:text-white flex items-center transition-colors"
                  title="Инвертировать порядок строк (сверху-вниз / снизу-вверх)"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Инвертировать порядок
                </button>
              )}
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 flex items-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Очистить все
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-7 h-7 text-slate-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-white">В спецификации пока нет позиций</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Рассчитайте огнезащиту кабельных линий или проходки / закладные гильзы и нажмите кнопку «В спецификацию».
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={() => onNavigateToTab("cable")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
              >
                Кабели (FLAMMOTECT-A)
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab("penetration")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Проходки & Гильзы (Double Layer)
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">№</th>
                  <th className="py-3 px-3">Позиция</th>
                  <th className="py-3 px-3">Система</th>
                  <th className="py-3 px-3">Параметры</th>
                  <th className="py-3 px-3">Площадь</th>
                  <th className="py-3 px-3 text-teal-400 font-bold">FLAMMOTECT (кг)</th>
                  <th className="py-3 px-3 text-rose-300">Шпаклевка (кг)</th>
                  <th className="py-3 px-3">Минплита</th>
                  <th className="py-3 px-3">Минвата</th>
                  <th className="py-3 px-3 no-print">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {items.map((item, index) => {
                  let systemLabel = "Кабели FLAMMOTECT-A";
                  let systemColor = "bg-teal-950/80 text-teal-300 border-teal-800/40";
                  let area = 0;
                  let flammotectKg = "—";
                  let fillerKg = "—";
                  let boardM2 = "—";
                  let woolKg = "—";
                  let paramsText = "";

                  if (item.type === "cable_flammotect") {
                    systemLabel = "FLAMMOTECT-A Кабели";
                    systemColor = "bg-teal-950/80 text-teal-300 border-teal-800/40";
                    area = item.result.areaM2;
                    flammotectKg = `${item.result.flammotectMassKg} (${item.result.flammotectBucketsCount}в)`;
                    paramsText = item.details.bundleSummary
                      ? `Пучок: ${item.details.bundleSummary}, D=${item.details.dimensionMm}мм, L=${item.details.lengthM}м`
                      : `L=${item.details.lengthM}м, DFT=${item.details.dryFilmThicknessMm}мм`;
                  } else if (item.type === "penetration_flammotect") {
                    systemLabel = "Double Layer EI 120";
                    systemColor = "bg-rose-950/80 text-rose-300 border-rose-800/40";
                    area = item.result.openingAreaM2;
                    flammotectKg = `${item.result.coatingMassKg} (${item.result.coatingBucketsCount}в)`;
                    fillerKg = `${item.result.fillerMassKg} (${item.result.fillerBucketsCount}в)`;
                    boardM2 = `${item.result.boardAreaM2} м²`;
                    woolKg = `${item.result.looseWoolMassKg} кг`;
                    const countTag =
                      item.details.count && item.details.count > 1 ? ` [${item.details.count} шт.]` : "";
                    paramsText = item.details.sleeveTag
                      ? `${item.details.sleeveTag}: ${item.details.sleeveSpec || item.details.dimensionsText}${countTag}`
                      : `${item.details.dimensionsText} (EI 120)${countTag}`;
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                      <td className="py-3 px-3 font-sans font-medium text-white max-w-[200px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${systemColor}`}>
                          {systemLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-sans">{paramsText}</td>
                      <td className="py-3 px-3">{area} м²</td>
                      <td className="py-3 px-3 text-teal-300 font-bold">{flammotectKg}</td>
                      <td className="py-3 px-3 text-rose-300">{fillerKg}</td>
                      <td className="py-3 px-3 text-amber-300">{boardM2}</td>
                      <td className="py-3 px-3 text-slate-300">{woolKg}</td>
                      <td className="py-3 px-3 no-print">
                        <div className="flex items-center space-x-1">
                          {onMoveUp && (
                            <button
                              type="button"
                              onClick={() => onMoveUp(item.id)}
                              disabled={index === 0}
                              className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 transition-colors"
                              title="Переместить вверх"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onMoveDown && (
                            <button
                              type="button"
                              onClick={() => onMoveDown(item.id)}
                              disabled={index === items.length - 1}
                              className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 transition-colors"
                              title="Переместить вниз"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Удалить позицию"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
