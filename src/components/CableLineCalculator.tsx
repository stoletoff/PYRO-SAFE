"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  cableLineFormSchema,
  CableLineFormData,
} from "@/lib/schemas";
import {
  calculateCableLine,
  CableLineResult,
  CONSTANTS,
} from "@/lib/calculations";
import { ProjectCableLineItem } from "@/lib/projectStore";
import { generateId, getTimestamp } from "@/lib/utils";
import {
  Check,
  Copy,
  PlusCircle,
  HelpCircle,
  Droplets,
  Package,
} from "lucide-react";

import {
  InstallationTypeSelector,
  INSTALLATION_TYPES,
} from "@/components/InstallationTypeSelector";

interface CableLineCalculatorProps {
  onAddToProject?: (item: ProjectCableLineItem) => void;
}



export function CableLineCalculator({ onAddToProject }: CableLineCalculatorProps) {
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [positionTitle, setPositionTitle] = useState("");

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CableLineFormData>({
    resolver: zodResolver(cableLineFormSchema),
    defaultValues: {
      installationType: "single",
      lengthM: 50,
      dimensionMm: 25,
      cableCount: 1,
      humidityGt85: false,
    },
    mode: "onChange",
  });

  const formValues = watch();

  // Чистый мгновенный расчет бизнес-логики
  const result: CableLineResult = calculateCableLine({
    installationType: formValues.installationType,
    lengthM: Number(formValues.lengthM) || 0,
    dimensionMm: Number(formValues.dimensionMm) || 0,
    cableCount: Number(formValues.cableCount) || 1,
    humidityGt85: Boolean(formValues.humidityGt85),
  });

  const currentTypeConfig = INSTALLATION_TYPES.find(
    (t) => t.id === formValues.installationType
  )!;

  const handleCopy = () => {
    const text = `
=== РАСЧЕТ ОГНЕЗАЩИТЫ КАБЕЛЬНОЙ ЛИНИИ PYRO-SAFE ===
Тип прокладки: ${currentTypeConfig.title}
Длина трассы (L): ${formValues.lengthM} м
Размер (${formValues.installationType === "single" || formValues.installationType === "bundle" ? "Диаметр d" : "Ширина b"}): ${formValues.dimensionMm} мм
${formValues.installationType === "single" ? `Количество кабелей (N): ${formValues.cableCount} шт.\n` : ""}Влажность > 85%: ${formValues.humidityGt85 ? "Да (требуется лак SP-2)" : "Нет"}
---
Формула: ${result.formulaExplanation}
Площадь покрытия (S): ${result.areaM2} м²
FLAMMOPLAST KS 1: ${result.ks1MassKg} кг (${result.ks1BucketsCount} вёдер по ${CONSTANTS.KS1_BUCKET_WEIGHT_KG} кг)
Защитный лак SP-2: ${result.sp2MassKg} кг
Дата: ${new Date().toLocaleDateString("ru-RU")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddPosition = () => {
    if (!onAddToProject) return;

    const title =
      positionTitle.trim() ||
      `${currentTypeConfig.title} (L=${formValues.lengthM}м, S=${result.areaM2}м²)`;

    const item: ProjectCableLineItem = {
      id: generateId("cable"),
      type: "cable_line",
      title,
      timestamp: getTimestamp(),
      details: {
        installationTypeName: currentTypeConfig.title,
        lengthM: formValues.lengthM,
        dimensionMm: formValues.dimensionMm,
        cableCount: formValues.cableCount || 1,
        humidityGt85: formValues.humidityGt85,
      },
      result,
    };

    onAddToProject(item);
    setPositionTitle("");
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Intro banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-orange-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              FLAMMOPLAST KS 1 • svt Brandschutz
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Огнезащита кабельных линий составом FLAMMOPLAST KS 1
            </h2>
            <div className="text-xs sm:text-sm text-slate-400 mt-1 space-y-1">
              <div>
                Толщина сухого слоя: <strong className="text-slate-200">0,72 мм</strong>.
                {" "}Нормативный расход: <strong className="text-orange-400 font-mono">1,73 кг/м²</strong> (технологические потери учтены).
              </div>
              <div className="text-slate-300">
                Фасовка: фирменные вёдра по <strong className="text-orange-400 font-mono">12,5 кг</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM PANEL (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-xl space-y-6 sm:space-y-7">
          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>Тип прокладки кабелей</span>
              <span className="text-xs text-slate-500 font-mono">Формула площади (S)</span>
            </label>

            <Controller
              name="installationType"
              control={control}
              render={({ field }) => (
                <InstallationTypeSelector
                  value={field.value}
                  onChange={(newType) => {
                    field.onChange(newType);
                    const cfg = INSTALLATION_TYPES.find((t) => t.id === newType);
                    if (cfg) {
                      setValue("dimensionMm", cfg.defaultDimension, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                />
              )}
            />
          </div>

          {/* Route Length (L) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">
                Длина кабельной трассы (L)
              </label>
              <span className="text-xs font-mono text-orange-400">метры (м)</span>
            </div>

            <Controller
              name="lengthM"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-white font-mono text-base outline-none transition-colors"
                      placeholder="Например: 50"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 text-sm font-mono">
                      м
                    </div>
                  </div>
                  {errors.lengthM && (
                    <p className="text-xs text-red-400">{errors.lengthM.message}</p>
                  )}
                  {/* Quick length presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-xs text-slate-500 py-1 pr-1">Быстрый выбор:</span>
                    {[10, 25, 50, 100, 250, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => field.onChange(preset)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-colors ${
                          field.value === preset
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {preset} м
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>

          {/* Dimension (d or b) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">
                {currentTypeConfig.dimensionLabel}
              </label>
              <span className="text-xs font-mono text-orange-400">миллиметры (мм)</span>
            </div>

            <Controller
              name="dimensionMm"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-white font-mono text-base outline-none transition-colors"
                      placeholder="Например: 25"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 text-sm font-mono">
                      мм
                    </div>
                  </div>
                  {errors.dimensionMm && (
                    <p className="text-xs text-red-400">{errors.dimensionMm.message}</p>
                  )}

                  {/* Dimension presets tailored to type */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-xs text-slate-500 py-1 pr-1">Типовые:</span>
                    {(formValues.installationType === "single"
                      ? [12, 16, 20, 25, 35, 50]
                      : formValues.installationType === "bundle"
                      ? [30, 50, 75, 100, 120]
                      : [100, 200, 300, 400, 500, 600]
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => field.onChange(preset)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-colors ${
                          field.value === preset
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {preset} мм
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>

          {/* Cable Count (N) - only active for single cable */}
          {formValues.installationType === "single" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-200">
                  Количество одиночных кабелей (N)
                </label>
                <span className="text-xs font-mono text-orange-400">штук</span>
              </div>

              <Controller
                name="cableCount"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={field.value || 1}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-white font-mono text-base outline-none transition-colors"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 text-sm font-mono">
                        шт
                      </div>
                    </div>
                    {errors.cableCount && (
                      <p className="text-xs text-red-400">{errors.cableCount.message}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[1, 2, 3, 5, 10, 20].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => field.onChange(num)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-colors ${
                            field.value === num
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {num} шт
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {/* Step 5: Environmental Condition (Humidity > 85%) */}
          <div className="pt-2 border-t border-slate-800/80">
            <Controller
              name="humidityGt85"
              control={control}
              render={({ field }) => (
                <label className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-slate-700 text-orange-600 focus:ring-orange-500 focus:ring-offset-slate-900 bg-slate-900 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white flex items-center">
                      <Droplets className="w-4 h-4 text-sky-400 mr-1.5" />
                      Помещение с влажностью &gt; 85% (влажные / неотапливаемые зоны)
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Автоматически рассчитывает нанесение гидрозащитного полиуретанового лака{" "}
                      <strong className="text-sky-300">PYRO-SAFE SP-2</strong> (расход: 0,175 кг/м² поверх KS 1).
                    </p>
                  </div>
                </label>
              )}
            />
          </div>
        </div>

        {/* RESULTS PANEL (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-white">Ведомость материалов</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-800/40">
                svt Brandschutz
              </span>
            </div>

            <div className="space-y-4">
              {/* Result Item 1: Total Area */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                  Общая площадь обработки (S)
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {result.areaM2}
                  </div>
                  <div className="text-sm font-mono text-orange-400 font-semibold">
                    м²
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1 break-all">
                  {result.formulaExplanation}
                </div>
              </div>

              {/* Result Item 2: KS 1 Mass & Buckets */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-950/30 via-slate-950/80 to-slate-950/80 border border-orange-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-300 font-semibold uppercase tracking-wider">
                    FLAMMOPLAST KS 1 (огнезащита)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">1.73 кг/м²</span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div className="text-3xl font-black text-orange-400 font-mono tracking-tight">
                    {result.ks1MassKg}
                  </div>
                  <div className="text-sm font-mono text-orange-300 font-semibold">
                    кг
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-orange-900/30 flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center">
                    <Package className="w-3.5 h-3.5 mr-1 text-orange-400" />
                    Количество фирменных вёдер:
                  </span>
                  <div className="text-sm font-bold font-mono text-white bg-orange-600/30 border border-orange-500/40 px-2.5 py-0.5 rounded-lg">
                    {result.ks1BucketsCount} шт. <span className="text-xs text-orange-300 font-normal">(по 12.5 кг)</span>
                  </div>
                </div>
              </div>

              {/* Result Item 3: SP-2 Varnish */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  formValues.humidityGt85
                    ? "bg-sky-950/20 border-sky-800/60"
                    : "bg-slate-950/40 border-slate-900 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider flex items-center">
                    <Droplets className="w-3.5 h-3.5 mr-1 text-sky-400" />
                    Защитный лак PYRO-SAFE SP-2
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">0.175 кг/м²</span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div
                    className={`text-2xl font-black font-mono tracking-tight ${
                      formValues.humidityGt85 ? "text-sky-300" : "text-slate-500"
                    }`}
                  >
                    {result.sp2MassKg}
                  </div>
                  <div className="text-sm font-mono text-sky-400 font-semibold">
                    кг
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-1">
                  {formValues.humidityGt85
                    ? "Требуется влагозащита (>85% влажности)"
                    : "Не требуется при стандартной влажности"}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-3 no-print">
              {/* Optional Custom Position Name */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  placeholder="Наименование участка (напр.: Трасса лотка №1)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddPosition}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-medium text-xs shadow-lg shadow-orange-950/40 transition-all active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  В спецификацию
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5 text-emerald-400" />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Копировать
                    </>
                  )}
                </button>
              </div>

              {addedToast && (
                <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs text-center flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Позиция успешно добавлена в сводную ведомость проекта!
                </div>
              )}
            </div>
          </div>

          {/* Quick Info card */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
            <div className="flex items-center text-slate-300 font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-orange-400 mr-1.5" />
              Инженерная справка по нанесению
            </div>
            <p>
              Огнезащитное покрытие <strong>FLAMMOPLAST KS 1</strong> наносится кистью, валиком или установкой безвоздушного распыления (давление 200–250 бар, сопло 0,021″–0,027″).
            </p>
            <p>
              Кабели должны быть очищены от пыли, грязи и масляных пятен. Допустимая температура окружающего воздуха при нанесении: от +5°C до +50°C.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
