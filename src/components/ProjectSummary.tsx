"use client";

import React, { useState } from "react";
import {
  ProjectItem,
  calculateProjectTotals,
} from "@/lib/projectStore";
import { TabType } from "@/components/Header";
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
  Sparkles,
} from "lucide-react";

interface ProjectSummaryProps {
  items: ProjectItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onNavigateToTab: (tab: TabType) => void;
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
        text += `${idx + 1}. [Кабельная линия KS 1] ${item.title}\n`;
        text += `   - Длина: ${item.details.lengthM} м, S = ${item.result.areaM2} м²\n`;
        text += `   - KS 1: ${item.result.ks1MassKg} кг (${item.result.ks1BucketsCount} вёдер)\n`;
        if (item.result.sp2MassKg > 0) {
          text += `   - SP-2: ${item.result.sp2MassKg} кг\n`;
        }
      } else if (item.type === "penetration") {
        text += `${idx + 1}. [Проходка UNIVERSALSCHOTT] ${item.title}\n`;
        text += `   - Размеры: ${item.details.dimensionsText}, Предел: ${item.details.fireResistance}\n`;
        text += `   - Минплита: ${item.result.boardAreaM2} м², Минвата: ${item.result.mineralWoolMassKg} кг\n`;
        text += `   - KS 1: ${item.result.ks1MassKg} кг, KS 3: ${item.result.ks3MassKg} кг\n`;
      } else if (item.type === "cable_flammotect") {
        text += `${idx + 1}. [Кабельная линия FLAMMOTECT-A] ${item.title}\n`;
        text += `   - Длина: ${item.details.lengthM} м, S = ${item.result.areaM2} м², сухой слой: ${item.details.dryFilmThicknessMm} мм\n`;
        text += `   - FLAMMOTECT-A: ${item.result.flammotectMassKg} кг (${item.result.flammotectBucketsCount} вёдер по 12.5 кг)\n`;
      } else if (item.type === "penetration_flammotect") {
        text += `${idx + 1}. [Проходка FLAMMOTECT Double Layer] ${item.title}\n`;
        text += `   - Размеры: ${item.details.dimensionsText}, Предел: EI 120 (2 слоя плит 60 мм)\n`;
        text += `   - FLAMMOTECT-A coating: ${item.result.coatingMassKg} кг (${item.result.coatingBucketsCount} вёдер)\n`;
        text += `   - FLAMMOTECT-A filler: ${item.result.fillerMassKg} кг (${item.result.fillerBucketsCount} вёдер)\n`;
        text += `   - Минплита 150 кг/м³: ${item.result.boardAreaM2} м², Минвата: ${item.result.looseWoolMassKg} кг\n`;
        if (item.result.dgCrBsMeters > 0) {
          text += `   - Бандаж DG-CR BS: ${item.result.dgCrBsMeters} м\n`;
        }
      }
      text += `\n`;
    });

    text += `ИТОГОВАЯ ВЕДОМОСТЬ МАТЕРИАЛОВ ДЛЯ ЗАКУПКИ:\n`;
    if (totals.totalKs1Kg > 0) {
      text += `• FLAMMOPLAST KS 1: ${totals.totalKs1Kg} кг (${totals.totalKs1Buckets} вёдер по 12.5 кг)\n`;
    }
    if (totals.totalFlammotectCoatingKg > 0) {
      text += `• PYRO-SAFE FLAMMOTECT-A coating: ${totals.totalFlammotectCoatingKg} кг (${totals.totalFlammotectCoatingBuckets} вёдер по 12.5 кг)\n`;
    }
    if (totals.totalFlammotectFillerKg > 0) {
      text += `• PYRO-SAFE FLAMMOTECT-A filler (шпаклевка): ${totals.totalFlammotectFillerKg} кг (${totals.totalFlammotectFillerBuckets} вёдер по 12.5 кг)\n`;
    }
    if (totals.totalKs3Kg > 0) {
      text += `• PYRO-SAFE KS 3 (мастика): ${totals.totalKs3Kg} кг\n`;
    }
    if (totals.totalSp2Kg > 0) {
      text += `• Защитный лак PYRO-SAFE SP-2: ${totals.totalSp2Kg} кг\n`;
    }
    if (totals.totalBoardM2 > 0) {
      text += `• Жесткая минплита (150 кг/м³): ${totals.totalBoardM2} м²\n`;
    }
    if (totals.totalWoolKg > 0) {
      text += `• Базальтовая вата (россыпь): ${totals.totalWoolKg} кг\n`;
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
    csv += "№,Позиция,Тип системы,Параметры,Площадь (м2),FLAMMOPLAST KS 1 (кг),FLAMMOTECT-A (кг),Шпаклевка filler (кг),Мастика KS 3 (кг),Лак SP-2 (кг),Минплита (м2),Минвата (кг),Бандаж DG-CR BS (м)\n";

    items.forEach((item, idx) => {
      if (item.type === "cable_line") {
        csv += `${idx + 1},"${item.title.replace(/"/g, '""')}","Кабели KS 1","L=${item.details.lengthM}м",${item.result.areaM2},${item.result.ks1MassKg},0,0,0,${item.result.sp2MassKg},0,0,0\n`;
      } else if (item.type === "penetration") {
        csv += `${idx + 1},"${item.title.replace(/"/g, '""')}","UNIVERSALSCHOTT","${item.details.dimensionsText}",${item.result.openingAreaM2},${item.result.ks1MassKg},0,0,${item.result.ks3MassKg},${item.result.sp2MassKg},${item.result.boardAreaM2},${item.result.mineralWoolMassKg},0\n`;
      } else if (item.type === "cable_flammotect") {
        csv += `${idx + 1},"${item.title.replace(/"/g, '""')}","Кабели FLAMMOTECT-A","L=${item.details.lengthM}м, DFT=${item.details.dryFilmThicknessMm}мм",${item.result.areaM2},0,${item.result.flammotectMassKg},0,0,0,0,0,0\n`;
      } else if (item.type === "penetration_flammotect") {
        csv += `${idx + 1},"${item.title.replace(/"/g, '""')}","FLAMMOTECT Double Layer","${item.details.dimensionsText}, EI 120",${item.result.openingAreaM2},0,${item.result.coatingMassKg},${item.result.fillerMassKg},0,0,${item.result.boardAreaM2},${item.result.looseWoolMassKg},${item.result.dgCrBsMeters}\n`;
      }
    });

    csv += `ИТОГО,,,,,"${totals.totalKs1Kg}","${totals.totalFlammotectCoatingKg}","${totals.totalFlammotectFillerKg}","${totals.totalKs3Kg}","${totals.totalSp2Kg}","${totals.totalBoardM2}","${totals.totalWoolKg}","${totals.totalDgCrBsMeters}"\n`;

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
              Объединенный расчет огнезащитных материалов по всем кабельным трассам и проходкам здания (системы FLAMMOPLAST и FLAMMOTECT) с расчетом количества стандартной тары.
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
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white shadow-md shadow-orange-950/40 transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Печать спецификации
            </button>
          </div>
        </div>
      </div>

      {/* CONSOLIDATED MATERIAL TOTALS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              для проходок EI 60 / 120 / 180
            </div>
          </div>
        </div>

        {/* Loose Mineral Wool */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              Рассыпная минвата
            </span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalWoolKg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              уплотнение пустот и зазоров
            </div>
          </div>
        </div>

        {/* PYRO-SAFE KS 3 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              PYRO-SAFE KS 3
            </span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totals.totalKs3Kg} <span className="text-sm font-normal text-slate-400">кг</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              мастика UNIVERSALSCHOTT
            </div>
          </div>
        </div>

        {/* Protective Topcoat SP-2 */}
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
              для KS 1 при влажности &gt; 85%
            </div>
          </div>
        </div>

        {/* DG-CR BS wrap */}
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
              для пластиковых труб (Double Layer)
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
                Выберите подходящий калькулятор выше, произведите расчет и добавьте позиции в спецификацию.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={() => onNavigateToTab("cable")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-colors"
              >
                Кабели (KS 1)
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab("penetration")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Проходки (UNIVERSALSCHOTT)
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab("cable_flammotect")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
              >
                Кабели (FLAMMOTECT-A)
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab("penetration_flammotect")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Проходки Double Layer
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
                  <th className="py-3 px-3 text-orange-400 font-bold">KS 1 (кг)</th>
                  <th className="py-3 px-3 text-teal-400 font-bold">FLAMMOTECT (кг)</th>
                  <th className="py-3 px-3 text-rose-300">Шпаклевка (кг)</th>
                  <th className="py-3 px-3">Минплита</th>
                  <th className="py-3 px-3">Минвата</th>
                  <th className="py-3 px-3 no-print">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {items.map((item, index) => {
                  let systemLabel = "Кабели KS 1";
                  let systemColor = "bg-orange-950/80 text-orange-300 border-orange-800/40";
                  let area = 0;
                  let ks1Kg = "—";
                  let flammotectKg = "—";
                  let fillerKg = "—";
                  let boardM2 = "—";
                  let woolKg = "—";
                  let paramsText = "";

                  if (item.type === "cable_line") {
                    systemLabel = "Кабели KS 1";
                    systemColor = "bg-orange-950/80 text-orange-300 border-orange-800/40";
                    area = item.result.areaM2;
                    ks1Kg = `${item.result.ks1MassKg} (${item.result.ks1BucketsCount}в)`;
                    paramsText = `L=${item.details.lengthM}м, d/b=${item.details.dimensionMm}мм`;
                  } else if (item.type === "penetration") {
                    systemLabel = "UNIVERSALSCHOTT";
                    systemColor = "bg-red-950/80 text-red-300 border-red-800/40";
                    area = item.result.openingAreaM2;
                    ks1Kg = `${item.result.ks1MassKg} (${item.result.ks1BucketsCount}в)`;
                    boardM2 = `${item.result.boardAreaM2} м²`;
                    woolKg = `${item.result.mineralWoolMassKg} кг`;
                    paramsText = `${item.details.dimensionsText} (${item.details.fireResistance})`;
                  } else if (item.type === "cable_flammotect") {
                    systemLabel = "FLAMMOTECT-A Кабели";
                    systemColor = "bg-teal-950/80 text-teal-300 border-teal-800/40";
                    area = item.result.areaM2;
                    flammotectKg = `${item.result.flammotectMassKg} (${item.result.flammotectBucketsCount}в)`;
                    paramsText = `L=${item.details.lengthM}м, DFT=${item.details.dryFilmThicknessMm}мм`;
                  } else if (item.type === "penetration_flammotect") {
                    systemLabel = "FLAMMOTECT Double Layer";
                    systemColor = "bg-rose-950/80 text-rose-300 border-rose-800/40";
                    area = item.result.openingAreaM2;
                    flammotectKg = `${item.result.coatingMassKg} (${item.result.coatingBucketsCount}в)`;
                    fillerKg = `${item.result.fillerMassKg} (${item.result.fillerBucketsCount}в)`;
                    boardM2 = `${item.result.boardAreaM2} м²`;
                    woolKg = `${item.result.looseWoolMassKg} кг`;
                    paramsText = `${item.details.dimensionsText} (EI 120)`;
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                      <td className="py-3 px-3 font-sans font-medium text-white max-w-[200px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${systemColor}`}
                        >
                          {systemLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {paramsText}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {area} м²
                      </td>
                      <td className="py-3 px-3 text-orange-400 font-bold">
                        {ks1Kg}
                      </td>
                      <td className="py-3 px-3 text-teal-300 font-bold">
                        {flammotectKg}
                      </td>
                      <td className="py-3 px-3 text-rose-300">
                        {fillerKg}
                      </td>
                      <td className="py-3 px-3 text-amber-300">
                        {boardM2}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {woolKg}
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
