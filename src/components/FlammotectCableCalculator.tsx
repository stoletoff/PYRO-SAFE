"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  flammotectCableFormSchema,
  FlammotectCableFormData,
} from "@/lib/schemas";
import {
  calculateFlammotectCableLine,
  FlammotectCableResult,
  FLAMMOTECT_CONSTANTS,
  FLAMMOTECT_APPLICATION_LOSSES,
  FlammotectApplicationMethod,
} from "@/lib/calculations";
import { ProjectFlammotectCableItem } from "@/lib/projectStore";
import { generateId, getTimestamp } from "@/lib/utils";
import {
  Check,
  Copy,
  PlusCircle,
  Plus,
  Trash2,
  ShieldCheck,
  Package,
  Layers,
  Thermometer,
  Gauge,
  Sparkles,
} from "lucide-react";

import {
  InstallationTypeSelector,
  INSTALLATION_TYPES,
} from "@/components/InstallationTypeSelector";

interface FlammotectCableCalculatorProps {
  onAddToProject?: (item: ProjectFlammotectCableItem) => void;
}

export function FlammotectCableCalculator({
  onAddToProject,
}: FlammotectCableCalculatorProps) {
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [positionTitle, setPositionTitle] = useState("");

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlammotectCableFormData>({
    resolver: zodResolver(flammotectCableFormSchema),
    defaultValues: {
      installationType: "single",
      lengthM: 50,
      dimensionMm: 25,
      cableCount: 1,
      shelvesCount: 1,
      dryFilmThicknessMm: 0.5,
      applicationMethod: "brush_10",
      bundleSizeMode: "auto",
      bundleCables: [
        { id: "bc-1", name: "ВВГнгд 3×2.5", diameterMm: 11, count: 4 },
        { id: "bc-2", name: "ВВГнгд 5×10", diameterMm: 19, count: 2 },
      ],
    },
    mode: "onChange",
  });

  const {
    fields: bundleFields,
    append: appendBundleField,
    remove: removeBundleField,
  } = useFieldArray({
    control,
    name: "bundleCables",
  });

  const formValues = watch();

  const watchedBundleCables = useWatch({
    control,
    name: "bundleCables",
  });

  const currentBundleCables = watchedBundleCables || formValues.bundleCables || [];

  const result: FlammotectCableResult = calculateFlammotectCableLine({
    installationType: formValues.installationType,
    lengthM: Number(formValues.lengthM) || 0,
    dimensionMm: Number(formValues.dimensionMm) || 0,
    cableCount: Number(formValues.cableCount) || 1,
    shelvesCount: Number(formValues.shelvesCount) || 1,
    dryFilmThicknessMm: Number(formValues.dryFilmThicknessMm) || 0.5,
    applicationMethod:
      (formValues.applicationMethod as FlammotectApplicationMethod) ||
      "brush_10",
    customRateKgM2: formValues.customRateKgM2
      ? Number(formValues.customRateKgM2)
      : undefined,
    bundleSizeMode: formValues.bundleSizeMode || "auto",
    bundleCables: currentBundleCables.map((c) => ({
      id: c?.id || "",
      name: c?.name || "",
      diameterMm: Number(c?.diameterMm) || 0,
      count: Number(c?.count) || 0,
    })),
  });

  const currentTypeConfig = INSTALLATION_TYPES.find(
    (t) => t.id === formValues.installationType
  )!;

  const isBundle = formValues.installationType === "bundle";

  const isTray =
    formValues.installationType === "tray_solid" ||
    formValues.installationType === "tray_mesh";

  const effectiveDiaMm =
    isBundle
      ? result.calculatedBundleDiameterMm || Number(formValues.dimensionMm) || 0
      : Number(formValues.dimensionMm) || 0;

  const handleCopy = () => {
    const isBundle = formValues.installationType === "bundle";
    const bundleDetails =
      isBundle && result.bundleSummary
        ? `Состав пучка: ${result.bundleSummary} (всего ${result.totalBundleCablesCount || 0} шт.)\nРасчетный диаметр пучка D: ${result.calculatedBundleDiameterMm || formValues.dimensionMm} мм\n`
        : "";

    const sizeLabel =
      isBundle
        ? `Диаметр пучка d: ${result.calculatedBundleDiameterMm || formValues.dimensionMm} мм`
        : formValues.installationType === "single"
        ? `Диаметр кабеля d: ${formValues.dimensionMm} мм`
        : `Ширина лотка b: ${formValues.dimensionMm} мм`;

    const countLine =
      isBundle && (formValues.cableCount || 1) > 1
        ? `Количество параллельных пучков: ${formValues.cableCount} шт.\n`
        : isTray
        ? `Количество полок короба: ${formValues.shelvesCount} шт.\n`
        : "";

    const text = `
=== РАСЧЕТ ОГНЕЗАЩИТЫ КАБЕЛЕЙ PYRO-SAFE FLAMMOTECT-A ===
Регламент: ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH (2022)
Тип прокладки: ${currentTypeConfig.title}
${bundleDetails}Длина трассы (L): ${formValues.lengthM} м
Размер (${sizeLabel})
${countLine}Толщина сухого слоя (DFT): ${formValues.dryFilmThicknessMm} мм
Контрольная толщина мокрого слоя (WFT): ${result.wetFilmThicknessMm} мм (гребенка)
Способ нанесения: ${FLAMMOTECT_APPLICATION_LOSSES[formValues.applicationMethod]?.label}
---
Формула площади: ${result.formulaExplanation}
Площадь покрытия (S): ${result.areaM2} м²
Норма расхода (с потерями): ${result.effectiveRateKgM2} кг/м²
Масса FLAMMOTECT-A: ${result.flammotectMassKg} кг (${result.flammotectBucketsCount} вёдер по ${FLAMMOTECT_CONSTANTS.BUCKET_WEIGHT_KG} кг)
Защитный лак: НЕ ТРЕБУЕТСЯ (стойкость к влаге 100% и УФ по п. 4.9)
Рекомендуемых точек замера: не менее ${result.recommendedMeasurementsCount} точек
Дата: ${new Date().toLocaleDateString("ru-RU")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddPosition = () => {
    if (!onAddToProject) return;

    const isBundle = formValues.installationType === "bundle";
    const effectiveDia =
      isBundle
        ? result.calculatedBundleDiameterMm || Number(formValues.dimensionMm)
        : Number(formValues.dimensionMm);

    const defaultTitle =
      isBundle && result.bundleSummary
        ? `Пучок кабелей: ${result.bundleSummary} (D=${effectiveDia}мм, L=${formValues.lengthM}м, S=${result.areaM2}м²)`
        : `${currentTypeConfig.title} (FLAMMOTECT-A, L=${formValues.lengthM}м, S=${result.areaM2}м²)`;

    const title = positionTitle.trim() || defaultTitle;

    const item: ProjectFlammotectCableItem = {
      id: generateId("flammotect_cable"),
      type: "cable_flammotect",
      title,
      timestamp: getTimestamp(),
      details: {
        installationTypeName: currentTypeConfig.title,
        lengthM: Number(formValues.lengthM),
        dimensionMm: effectiveDia,
        cableCount:
          formValues.installationType === "single"
            ? 1
            : Number(formValues.cableCount) || 1,
        shelvesCount: Number(formValues.shelvesCount) || 1,
        dryFilmThicknessMm: Number(formValues.dryFilmThicknessMm),
        applicationMethodName:
          FLAMMOTECT_APPLICATION_LOSSES[formValues.applicationMethod]?.label ||
          "Кисть / валик",
        bundleSummary: result.bundleSummary,
        bundleCablesCount: result.totalBundleCablesCount,
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
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-teal-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Регламент 2022 • ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2.5 text-teal-400" />
              Огнезащита кабелей: PYRO-SAFE FLAMMOTECT-A
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Тонкослойная абляционная краска пассивного эндотермического действия.
              Керамизуется при температуре выше +200...+250 °C. Сертифицирована для кабельных хозяйств АЭС, ТЭС и промышленных объектов (ДСТУ EN 60332-3-21).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-950 text-teal-300 border border-teal-800/40">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-400" />
              Токовый коэфф. = 1,0
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/40">
              Влагостойкость 100% (Без лака)
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Срок &ge; 30 лет
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Parameters Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
            <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Параметры кабельной трассы</span>
              <span className="text-xs font-normal text-slate-400">
                {isBundle ? "4 этапа расчета" : "3 этапа расчета"}
              </span>
            </h2>

            {/* 1. Installation Type Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                1. Тип прокладки кабелей
              </label>
              <Controller
                control={control}
                name="installationType"
                render={({ field }) => (
                  <InstallationTypeSelector
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      const targetConfig = INSTALLATION_TYPES.find((t) => t.id === val);
                      if (targetConfig) {
                        setValue("dimensionMm", targetConfig.defaultDimension);
                      }
                    }}
                  />
                )}
              />
            </div>

            {/* If Bundle: Step 2 (Bundle Diameter) and Step 3 (Route & Area) */}
            {isBundle ? (
              <>
                {/* 2. Bundle Diameter Determination */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-teal-400" />
                        <label className="text-xs font-bold text-white uppercase tracking-wider">
                          2. Определение диаметра пучка (D)
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Сначала рассчитайте диаметр жгута по составу входящих кабелей или укажите значение вручную
                      </p>
                    </div>

                    {/* Mode switcher tabs */}
                    <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          setValue("bundleSizeMode", "auto", {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className={`px-3 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                          formValues.bundleSizeMode !== "manual"
                            ? "bg-teal-600 text-white shadow-sm font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        По составу кабелей
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setValue("bundleSizeMode", "manual", {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className={`px-3 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                          formValues.bundleSizeMode === "manual"
                            ? "bg-teal-600 text-white shadow-sm font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Задать вручную
                      </button>
                    </div>
                  </div>

                  {formValues.bundleSizeMode !== "manual" ? (
                    <div className="p-4 bg-slate-950/90 border border-teal-800/40 rounded-2xl space-y-4">
                      {/* Cable items list */}
                      <div className="space-y-2">
                        {bundleFields.map((fieldItem, idx) => (
                          <div
                            key={fieldItem.id}
                            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                          >
                            <div className="flex-1">
                              <Controller
                                control={control}
                                name={`bundleCables.${idx}.name`}
                                render={({ field }) => (
                                  <input
                                    type="text"
                                    placeholder={`Кабель ${idx + 1}`}
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                                  />
                                )}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-[11px] text-slate-400 font-mono">Ø:</span>
                                <Controller
                                  control={control}
                                  name={`bundleCables.${idx}.diameterMm`}
                                  render={({ field }) => (
                                    <div className="relative">
                                      <input
                                        type="number"
                                        step="any"
                                        min="1"
                                        max="500"
                                        placeholder="Диаметр"
                                        value={
                                          field.value === 0 || field.value === undefined
                                            ? ""
                                            : field.value
                                        }
                                        onChange={(e) => {
                                          const val =
                                            e.target.value === ""
                                              ? 0
                                              : parseFloat(e.target.value);
                                          field.onChange(isNaN(val) ? 0 : val);
                                        }}
                                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg pr-7 pl-2.5 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-teal-500"
                                      />
                                      <span className="text-[10px] text-slate-500 absolute right-2 top-2 pointer-events-none font-mono">
                                        мм
                                      </span>
                                    </div>
                                  )}
                                />
                              </div>

                              <div className="flex items-center space-x-1">
                                <span className="text-[11px] text-slate-400 font-mono">Кол-во:</span>
                                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cur = Number(currentBundleCables?.[idx]?.count) || 1;
                                      setValue(`bundleCables.${idx}.count`, Math.max(1, cur - 1), {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    }}
                                    className="w-6 h-7 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                                    title="Уменьшить количество"
                                  >
                                    -
                                  </button>
                                  <Controller
                                    control={control}
                                    name={`bundleCables.${idx}.count`}
                                    render={({ field }) => (
                                      <input
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={field.value ?? 1}
                                        onChange={(e) =>
                                          field.onChange(parseInt(e.target.value, 10) || 1)
                                        }
                                        className="w-10 bg-transparent text-center text-xs font-mono font-bold text-teal-400 focus:outline-none"
                                      />
                                    )}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cur = Number(currentBundleCables?.[idx]?.count) || 1;
                                      setValue(`bundleCables.${idx}.count`, cur + 1, {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    }}
                                    className="w-6 h-7 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                                    title="Увеличить количество"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono">шт.</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeBundleField(idx)}
                                disabled={bundleFields.length <= 1}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 disabled:opacity-20 cursor-pointer transition-colors"
                                title="Удалить строку кабеля"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add cable button */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            appendBundleField({
                              id: generateId("bc"),
                              name: "Кабель",
                              diameterMm: 16,
                              count: 1,
                            })
                          }
                          className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-950/70 hover:bg-teal-900 border border-teal-800/50 text-teal-300 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Добавить кабель в пучок
                        </button>
                      </div>

                      {/* Quick popular cable chips */}
                      <div className="pt-2 border-t border-slate-800/70">
                        <span className="text-[10px] text-slate-400 font-medium block mb-1.5">
                          Быстрый выбор из каталога (клик для добавления в пучок):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: "ВВГнгд 3×2.5", dia: 11 },
                            { name: "ВВГнгд 5×6", dia: 16 },
                            { name: "ВВГнгд 5×10", dia: 19 },
                            { name: "ВВГнгд 4×25", dia: 24 },
                            { name: "(N)HXH FE180 3×2.5", dia: 12.5 },
                            { name: "(N)HXH FE180 5×16", dia: 23 },
                            { name: "АВВГ 4×70", dia: 32 },
                          ].map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() =>
                                appendBundleField({
                                  id: generateId("bc"),
                                  name: c.name,
                                  diameterMm: c.dia,
                                  count: 1,
                                })
                              }
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer transition-colors"
                            >
                              <span>{c.name}</span>
                              <span className="font-mono text-teal-400">Ø{c.dia}</span>
                              <Plus className="w-3 h-3 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Realtime bundle diameter calculation card with mathematical typography */}
                      <div className="p-4 bg-slate-950/90 border border-teal-800/50 rounded-2xl space-y-3.5 shadow-inner">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Эквивалентный расчетный диаметр жгута кабелей
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-xs text-slate-400">Всего кабелей в пучке:</span>
                            <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/40">
                              {result.totalBundleCablesCount || 0} шт.
                            </span>
                          </div>
                        </div>

                        {/* Formula display block with mathematical typography and schematic cross-section */}
                        <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30 rounded-xl border border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-4">
                          {/* Mathematical typesetting */}
                          <div className="space-y-2 flex-1 w-full">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Нормативная формула жгута:
                            </div>

                            {/* Styled Mathematical Equation */}
                            <div className="flex flex-wrap items-center gap-1.5 py-1 text-white font-serif select-none">
                              <span className="text-xl font-bold italic text-teal-300 font-sans">D</span>
                              <span className="text-slate-400 text-lg font-sans">=</span>
                              <span className="text-lg font-semibold font-mono text-white">1,15</span>
                              <span className="text-slate-400 text-sm font-sans">×</span>

                              {/* Radical Expression with overbar */}
                              <div className="inline-flex items-stretch text-emerald-300">
                                {/* Radical hook */}
                                <span className="text-2xl leading-none text-teal-400 font-light translate-y-0.5">
                                  √
                                </span>
                                {/* Content under radical with true overline bar */}
                                <div className="border-t-2 border-teal-400 pt-0.5 px-2 flex items-center space-x-1.5 bg-teal-950/40 rounded-r font-sans">
                                  <span className="text-xl font-bold text-teal-300">∑</span>
                                  <div className="flex items-center text-sm">
                                    <span className="italic font-serif text-slate-200">n</span>
                                    <sub className="text-[10px] text-teal-400 font-mono -bottom-1">i</sub>
                                    <span className="mx-1 text-slate-500">·</span>
                                    <span className="italic font-serif text-slate-200">d</span>
                                    <sub className="text-[10px] text-teal-400 font-mono -bottom-1">i</sub>
                                    <sup className="text-[10px] text-amber-300 font-bold font-mono -top-1.5 ml-0.5">2</sup>
                                  </div>
                                </div>
                              </div>

                              <span className="text-slate-400 text-lg font-sans">=</span>
                              <span className="text-xl font-black font-mono text-teal-300 px-2.5 py-0.5 rounded-lg bg-teal-950/80 border border-teal-700/60 shadow-sm">
                                {effectiveDiaMm} мм
                              </span>
                            </div>

                            {/* Live numerical expansion */}
                            {currentBundleCables && currentBundleCables.length > 0 && (
                              <div className="text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80 break-words leading-relaxed">
                                <span className="text-slate-500">Числовая подстановка: </span>
                                <span className="text-emerald-400">
                                  D = 1,15 × √({currentBundleCables
                                    .filter((c) => Number(c.diameterMm) > 0)
                                    .map((c) => `${c.count || 1}×${c.diameterMm}²`)
                                    .join(" + ") || "0"}) = {effectiveDiaMm} мм
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Vector schematic of bundle cross section */}
                          <div className="shrink-0 flex items-center space-x-2.5 p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
                            <svg
                              width="60"
                              height="60"
                              viewBox="0 0 64 64"
                              fill="none"
                              className="shrink-0 select-none"
                              aria-label="Схема сечения пучка кабелей"
                            >
                              {/* Outer bundle boundary (D) */}
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="#14b8a6"
                                strokeWidth="1.5"
                                strokeDasharray="3 2"
                                fill="rgba(20, 184, 166, 0.08)"
                              />
                              {/* Central cable */}
                              <circle cx="32" cy="32" r="8" fill="#1e293b" stroke="#2dd4bf" strokeWidth="1.2" />
                              <circle cx="32" cy="32" r="2.5" fill="#f97316" />

                              {/* Surrounding cables */}
                              <circle cx="21" cy="23" r="6.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                              <circle cx="21" cy="23" r="2" fill="#f97316" />

                              <circle cx="43" cy="23" r="6.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                              <circle cx="43" cy="23" r="2" fill="#f97316" />

                              <circle cx="21" cy="41" r="6.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                              <circle cx="21" cy="41" r="2" fill="#f97316" />

                              <circle cx="43" cy="41" r="6.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                              <circle cx="43" cy="41" r="2" fill="#f97316" />

                              {/* Dimension line */}
                              <line x1="4" y1="32" x2="60" y2="32" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                              <text
                                x="32"
                                y="14"
                                fill="#5eead4"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                Ø D
                              </text>
                            </svg>
                            <div className="text-[10px] text-slate-400 font-sans leading-tight">
                              <strong className="text-teal-300 block font-mono">D = {effectiveDiaMm} мм</strong>
                              Сечение жгута<br />
                              по огибающей
                            </div>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-serif italic font-bold text-teal-300 text-xs">
                              d<sub>i</sub>
                            </span>
                            <span>— диаметр кабеля (мм)</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-serif italic font-bold text-teal-300 text-xs">
                              n<sub>i</sub>
                            </span>
                            <span>— количество (шт.)</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-amber-300 text-xs">1,15</span>
                            <span>— коэф. скрутки жгута</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/90 border border-teal-800/40 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-slate-300">
                          Наружный габаритный диаметр пучка (D), мм
                        </label>
                        <span className="text-[11px] text-teal-400 font-mono">В миллиметрах</span>
                      </div>
                      <Controller
                        control={control}
                        name="dimensionMm"
                        render={({ field }) => (
                          <div className="relative">
                            <input
                              type="number"
                              step="any"
                              min="1"
                              placeholder="40"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors font-mono"
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                              мм
                            </span>
                          </div>
                        )}
                      />
                      <p className="text-[11px] text-slate-400">
                        Укажите измеренный внешний диаметр жгута кабелей, если состав кабелей не детализируется.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Route Geometry & Area Calculation per Regulation 3.2.3 */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      3. Трасса и расчет площади (п. 3.2.3 Регламента)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Диаметр пучка D подставляется в нормативную формулу расчета площади с коэффициентом пучка 1,5
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Length L */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          Длина трассы (L), м
                        </label>
                        <span className="text-[11px] text-slate-500">Погонные метры</span>
                      </div>
                      <Controller
                        control={control}
                        name="lengthM"
                        render={({ field }) => (
                          <div className="relative">
                            <input
                              type="number"
                              step="any"
                              min="0.1"
                              placeholder="50"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors font-mono"
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                              м
                            </span>
                          </div>
                        )}
                      />
                      {errors.lengthM && (
                        <p className="text-xs text-red-400 mt-1">{errors.lengthM.message}</p>
                      )}
                    </div>

                    {/* Parallel bundles count */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          Количество параллельных пучков (N)
                        </label>
                        <span className="text-[11px] text-slate-500">Штук</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = Number(formValues.cableCount) || 1;
                              setValue("cableCount", Math.max(1, cur - 1), {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-bold cursor-pointer transition-colors"
                          >
                            -
                          </button>
                          <Controller
                            control={control}
                            name="cableCount"
                            render={({ field }) => (
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={field.value ?? 1}
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                                className="w-full bg-transparent text-center text-sm font-mono font-bold text-teal-400 focus:outline-none"
                              />
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cur = Number(formValues.cableCount) || 1;
                              setValue("cableCount", cur + 1, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-bold cursor-pointer transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">пучков</span>
                      </div>
                    </div>
                  </div>

                  {/* Live formula substitution card styled in the exact same premium aesthetic */}
                  <div className="p-4 bg-slate-950/90 border border-teal-800/50 rounded-2xl space-y-3.5 shadow-inner">
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Нормативный расчет площади окраски пучка (п. 3.2.3 Регламента)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs text-slate-400">Площадь покрытия:</span>
                        <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/40">
                          S = {result.areaM2} м²
                        </span>
                      </div>
                    </div>

                    {/* Formula display block with mathematical typography and schematic longitudinal route */}
                    <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30 rounded-xl border border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-4">
                      {/* Mathematical typesetting */}
                      <div className="space-y-2 flex-1 w-full">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Нормативная формула площади жгута:
                        </div>

                        {/* Styled Mathematical Equation */}
                        <div className="flex flex-wrap items-center gap-1.5 py-1 text-white font-serif select-none">
                          <span className="text-xl font-bold italic text-teal-300 font-sans">S</span>
                          <span className="text-slate-400 text-lg font-sans">=</span>
                          <span className="text-lg font-bold italic text-white font-sans">L</span>
                          <span className="text-slate-400 text-sm font-sans">×</span>
                          <span className="text-lg font-bold font-serif text-amber-300">π</span>
                          <span className="text-slate-400 text-sm font-sans">×</span>
                          <span className="text-lg font-bold italic text-teal-300 font-sans">D</span>
                          <span className="text-slate-400 text-sm font-sans">×</span>
                          <span className="text-lg font-semibold font-mono text-white">1,5</span>
                          {Number(formValues.cableCount) > 1 && (
                            <>
                              <span className="text-slate-400 text-sm font-sans">×</span>
                              <span className="text-lg font-bold italic text-white font-sans">N</span>
                            </>
                          )}
                          <span className="text-slate-400 text-lg font-sans">=</span>
                          <span className="text-xl font-black font-mono text-teal-300 px-2.5 py-0.5 rounded-lg bg-teal-950/80 border border-teal-700/60 shadow-sm">
                            {result.areaM2} м²
                          </span>
                        </div>

                        {/* Live numerical expansion */}
                        <div className="text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80 break-words leading-relaxed">
                          <span className="text-slate-500">Числовая подстановка: </span>
                          <span className="text-emerald-400">
                            S = {formValues.lengthM || 0} × 3,1416 × {(effectiveDiaMm / 1000).toFixed(4)} × 1,5{Number(formValues.cableCount) > 1 ? ` × ${formValues.cableCount}` : ""} = {result.areaM2} м²
                          </span>
                        </div>
                      </div>

                      {/* Vector schematic of painted cable route */}
                      <div className="shrink-0 flex items-center space-x-2.5 p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
                        <svg
                          width="60"
                          height="60"
                          viewBox="0 0 64 64"
                          fill="none"
                          className="shrink-0 select-none"
                          aria-label="Схема окраски кабельной трассы"
                        >
                          {/* Longitudinal cylinder / painted cable bundle */}
                          <rect
                            x="6"
                            y="18"
                            width="52"
                            height="28"
                            rx="6"
                            fill="#0f172a"
                            stroke="#14b8a6"
                            strokeWidth="1.5"
                          />
                          {/* Coating layer highlight (top & bottom) */}
                          <path d="M6 18 Q 32 14 58 18" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
                          <path d="M6 46 Q 32 50 58 46" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
                          {/* End ellipses */}
                          <ellipse cx="14" cy="32" rx="4" ry="12" fill="#1e293b" stroke="#14b8a6" strokeWidth="1" />
                          <ellipse cx="14" cy="32" rx="2" ry="6" fill="#f97316" />
                          {/* Length dimension arrow L */}
                          <line
                            x1="6"
                            y1="56"
                            x2="58"
                            y2="56"
                            stroke="#f59e0b"
                            strokeWidth="1"
                            strokeDasharray="2 1.5"
                          />
                          <text
                            x="32"
                            y="62"
                            fill="#f59e0b"
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            L = {formValues.lengthM || 0}м
                          </text>
                          {/* Diameter callout D */}
                          <line
                            x1="56"
                            y1="18"
                            x2="56"
                            y2="46"
                            stroke="#5eead4"
                            strokeWidth="1"
                            strokeDasharray="1.5 1.5"
                          />
                          <text
                            x="44"
                            y="35"
                            fill="#5eead4"
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            Ø D
                          </text>
                        </svg>
                        <div className="text-[10px] text-slate-400 font-sans leading-tight">
                          <strong className="text-teal-300 block font-mono">S = {result.areaM2} м²</strong>
                          Окраска на 360°<br />
                          с коэфф. 1,5
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-serif italic font-bold text-teal-300 text-xs">L</span>
                        <span>= {formValues.lengthM || 0} м (длина трассы)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-serif italic font-bold text-teal-300 text-xs">D</span>
                        <span>= {effectiveDiaMm} мм (диаметр пучка)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-amber-300 text-xs">1,5</span>
                        <span>— коэф. формы (п. 3.2.3)</span>
                      </div>
                      {Number(formValues.cableCount) > 1 && (
                        <div className="flex items-center space-x-1.5">
                          <span className="font-serif italic font-bold text-teal-300 text-xs">N</span>
                          <span>= {formValues.cableCount} шт. (пучков)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Non-Bundle Installation: Step 2 Geometry */
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  2. Геометрия кабельной трассы
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Length L */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Длина трассы (L), м
                      </label>
                      <span className="text-[11px] text-slate-500">В метрах погонных</span>
                    </div>
                    <Controller
                      control={control}
                      name="lengthM"
                      render={({ field }) => (
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            placeholder="50"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors font-mono"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                            м
                          </span>
                        </div>
                      )}
                    />
                    {errors.lengthM && (
                      <p className="text-xs text-red-400 mt-1">{errors.lengthM.message}</p>
                    )}
                  </div>

                  {/* Dimension d or b */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        {currentTypeConfig.dimensionLabel}
                      </label>
                      <span className="text-[11px] text-teal-400 font-mono">
                        В миллиметрах
                      </span>
                    </div>
                    <Controller
                      control={control}
                      name="dimensionMm"
                      render={({ field }) => (
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="1"
                            placeholder={currentTypeConfig.defaultDimension.toString()}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors font-mono"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                            мм
                          </span>
                        </div>
                      )}
                    />
                    {errors.dimensionMm && (
                      <p className="text-xs text-red-400 mt-1">{errors.dimensionMm.message}</p>
                    )}
                  </div>
                </div>

                {/* Multi-shelf tray option (Section 3.2.1) */}
                {isTray && (
                  <div className="p-3 bg-teal-950/20 border border-teal-800/30 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-teal-300 flex items-center">
                        <Layers className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                        Количество полок / ярусов в коробе (п. 3.2.1)
                      </label>
                      <span className="text-[11px] text-slate-400">Множитель полочек</span>
                    </div>
                    <Controller
                      control={control}
                      name="shelvesCount"
                      render={({ field }) => (
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={field.value ?? 1}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors font-mono"
                        />
                      )}
                    />
                    <p className="text-[11px] text-slate-400">
                      Согласно п. 3.2.1: если короб имеет полочки, на которых лежит кабель, площадь умножается на количество полочек.
                    </p>
                  </div>
                )}

                {/* Live formula substitution card for Single / Trays */}
                <div className="p-4 bg-slate-950/90 border border-teal-800/50 rounded-2xl space-y-3.5 shadow-inner mt-3">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Нормативный расчет площади окраски (п. 3.2 Регламента)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs text-slate-400">Площадь покрытия:</span>
                      <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/40">
                        S = {result.areaM2} м²
                      </span>
                    </div>
                  </div>

                  {/* Formula display block with mathematical typography and schematic */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30 rounded-xl border border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Mathematical typesetting */}
                    <div className="space-y-2 flex-1 w-full">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {formValues.installationType === "single"
                          ? "Нормативная формула для одиночного кабеля (п. 3.2.2):"
                          : formValues.installationType === "tray_solid"
                          ? "Нормативная формула для глухого короба (п. 3.2.1):"
                          : "Нормативная формула для сетчатого короба (п. 3.2.1):"}
                      </div>

                      {/* Styled Mathematical Equation */}
                      <div className="flex flex-wrap items-center gap-1.5 py-1 text-white font-serif select-none">
                        <span className="text-xl font-bold italic text-teal-300 font-sans">S</span>
                        <span className="text-slate-400 text-lg font-sans">=</span>
                        <span className="text-lg font-bold italic text-white font-sans">L</span>
                        <span className="text-slate-400 text-sm font-sans">×</span>

                        {formValues.installationType === "single" ? (
                          <>
                            <span className="text-lg font-bold font-serif text-amber-300">π</span>
                            <span className="text-slate-400 text-sm font-sans">×</span>
                            <span className="text-lg font-bold italic text-teal-300 font-sans">d</span>
                          </>
                        ) : formValues.installationType === "tray_solid" ? (
                          <>
                            <span className="text-lg font-bold italic text-teal-300 font-sans">b</span>
                            <span className="text-slate-400 text-sm font-sans">×</span>
                            <span className="text-lg font-semibold font-mono text-white">1,5</span>
                            {(formValues.shelvesCount || 1) > 1 && (
                              <>
                                <span className="text-slate-400 text-sm font-sans">×</span>
                                <span className="text-lg font-bold italic text-white font-sans">
                                  N<sub>полок</sub>
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-bold italic text-teal-300 font-sans">b</span>
                            <span className="text-slate-400 text-sm font-sans">×</span>
                            <span className="text-lg font-semibold font-mono text-white">1,5</span>
                            <span className="text-slate-400 text-sm font-sans">×</span>
                            <span className="text-lg font-semibold font-mono text-white">2</span>
                            {(formValues.shelvesCount || 1) > 1 && (
                              <>
                                <span className="text-slate-400 text-sm font-sans">×</span>
                                <span className="text-lg font-bold italic text-white font-sans">
                                  N<sub>полок</sub>
                                </span>
                              </>
                            )}
                          </>
                        )}

                        <span className="text-slate-400 text-lg font-sans">=</span>
                        <span className="text-xl font-black font-mono text-teal-300 px-2.5 py-0.5 rounded-lg bg-teal-950/80 border border-teal-700/60 shadow-sm">
                          {result.areaM2} м²
                        </span>
                      </div>

                      {/* Live numerical expansion */}
                      <div className="text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80 break-words leading-relaxed">
                        <span className="text-slate-500">Числовая подстановка: </span>
                        <span className="text-emerald-400">
                          {result.formulaExplanation}
                        </span>
                      </div>
                    </div>

                    {/* Vector schematic of single cable / tray */}
                    <div className="shrink-0 flex items-center space-x-2.5 p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 64 64"
                        fill="none"
                        className="shrink-0 select-none"
                        aria-label="Схема прокладки"
                      >
                        <rect x="6" y="20" width="52" height="24" rx="4" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
                        <path d="M6 20 Q 32 17 58 20" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
                        <ellipse cx="14" cy="32" rx="3.5" ry="10" fill="#1e293b" stroke="#14b8a6" strokeWidth="1" />
                        <line x1="6" y1="52" x2="58" y2="52" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 1.5" />
                        <text x="32" y="58" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          L = {formValues.lengthM || 0}м
                        </text>
                      </svg>
                      <div className="text-[10px] text-slate-400 font-sans leading-tight">
                        <strong className="text-teal-300 block font-mono">S = {result.areaM2} м²</strong>
                        {formValues.installationType === "single"
                          ? "Одиночный кабель"
                          : formValues.installationType === "tray_solid"
                          ? "Глухой лоток"
                          : "Сетчатый (2 стороны)"}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-serif italic font-bold text-teal-300 text-xs">L</span>
                      <span>= {formValues.lengthM || 0} м (длина трассы)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-serif italic font-bold text-teal-300 text-xs">
                        {formValues.installationType === "single" ? "d" : "b"}
                      </span>
                      <span>
                        = {formValues.dimensionMm} мм ({formValues.installationType === "single" ? "диаметр" : "ширина"})
                      </span>
                    </div>
                    {formValues.installationType !== "single" && (
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-amber-300 text-xs">1,5</span>
                        <span>— коэф. кабелей (п. 3.2.1)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 (or 4): Coating thickness & Application Method */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isBundle
                  ? "4. Толщина сухого слоя (DFT) и способ нанесения"
                  : "3. Толщина сухого слоя (DFT) и способ нанесения"}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dry Film Thickness */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Толщина сухого слоя (DFT)
                  </label>
                  <Controller
                    control={control}
                    name="dryFilmThicknessMm"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                      >
                        <option value={0.5}>0,5 мм (Базовый предел ДСТУ)</option>
                        <option value={1.0}>1,0 мм (Усиленный предел EN 60332-3-21)</option>
                        <option value={1.5}>1,5 мм (Повышенный предел)</option>
                        <option value={2.0}>2,0 мм (Спецтребования гермозоны)</option>
                      </select>
                    )}
                  />
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-teal-400/90 font-mono">
                    <span>Контроль гребенкой (WFT):</span>
                    <strong>{result.wetFilmThicknessMm} мм</strong>
                  </div>
                </div>

                {/* Application Method */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Способ нанесения (техн. потери)
                  </label>
                  <Controller
                    control={control}
                    name="applicationMethod"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                      >
                        <option value="brush_5">Кисть / валик (потери +5%)</option>
                        <option value="brush_10">Кисть / валик (потери +10%)</option>
                        <option value="sprayer_30">Распылитель ВД (потери +30%)</option>
                      </select>
                    )}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Сопло: сопло 0,48 мм (0.019&quot;), вода до 2%
                  </p>
                </div>
              </div>

              {/* No Topcoat Info Banner */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-start space-x-3 text-xs text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-emerald-200">
                    Защитный лак не требуется (Регламент п. 4.9)
                  </strong>
                  FLAMMOTECT-A сам по себе обладает 100% влагостойкостью, стойкостью к циклу промерзания-оттаивания, воздействию УФ-лучей и химикатов.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Instant Calculation & Output */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                <Gauge className="w-4 h-4 mr-2 text-teal-400" />
                Инженерный расчет
              </h3>
              <span className="text-xs font-mono text-teal-400">FLAMMOTECT-A</span>
            </div>

            {/* Bundle summary banner */}
            {formValues.installationType === "bundle" && (
              <div className="p-3 bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-300 flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1.5" />
                    Пучок кабелей (п. 3.2.3)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/40">
                    D = {result.calculatedBundleDiameterMm || formValues.dimensionMm} мм
                  </span>
                </div>
                {result.bundleSummary && (
                  <p className="text-[11px] text-slate-300 font-mono">
                    {result.bundleSummary}
                  </p>
                )}
                <div className="text-[10px] text-slate-400 pt-1 border-t border-teal-900/40 flex justify-between">
                  <span>
                    Всего кабелей: {result.totalBundleCablesCount || 0} шт.
                    {(formValues.cableCount || 1) > 1 ? ` • ${formValues.cableCount} пучка` : ""}
                  </span>
                  <span>Коэф. пучка: 1.5</span>
                </div>
              </div>
            )}

            {/* Main Key Figures */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Площадь покрытия (S)
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  {result.areaM2}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-mono">м²</span>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Мокрый слой (WFT)
                </span>
                <span className="text-2xl font-black text-teal-400 font-mono">
                  {result.wetFilmThicknessMm}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-mono">мм</span>
              </div>
            </div>

            {/* Material Consumption Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-950/30 to-slate-950 border border-teal-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 flex items-center">
                  <Package className="w-4 h-4 mr-1.5 text-teal-400" />
                  PYRO-SAFE FLAMMOTECT-A
                </span>
                <span className="text-xs font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800/40">
                  {result.flammotectBucketsCount} вёдер
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-slate-800/80 pt-2">
                <span className="text-xs text-slate-400">Общая масса материала:</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono">
                    {result.flammotectMassKg}
                  </span>
                  <span className="text-xs text-slate-400 ml-1 font-mono">кг</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/50">
                <div className="flex justify-between">
                  <span>Базовая норма:</span>
                  <strong className="text-slate-300 font-mono">{result.baseRateKgM2} кг/м²</strong>
                </div>
                <div className="flex justify-between">
                  <span>Норма с учетом потерь:</span>
                  <strong className="text-slate-200 font-mono">{result.effectiveRateKgM2} кг/м²</strong>
                </div>
                <div className="flex justify-between">
                  <span>Стандартное ведро:</span>
                  <strong className="text-slate-300 font-mono">12,5 кг</strong>
                </div>
              </div>
            </div>

            {/* Formula explanation box styled with glowing dot & badge */}
            <div className="p-3.5 bg-gradient-to-r from-teal-950/40 via-slate-950 to-slate-950 border border-teal-800/50 rounded-2xl space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-teal-300 tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-2 animate-pulse" />
                  Расчет площади (п. 3.2 Регламента):
                </span>
                <span className="font-mono font-bold text-xs text-emerald-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/40">
                  S = {result.areaM2} м²
                </span>
              </div>
              <div className="font-mono text-emerald-400 text-xs leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90 break-words">
                {result.formulaExplanation}
              </div>
            </div>

            {/* Quality control guidelines */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
              <div className="flex items-center text-slate-300 font-semibold">
                <Thermometer className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                Контроль качества работ (п. 5.1):
              </div>
              <ul className="space-y-1 pl-4 list-disc text-[11px]">
                <li>
                  Минимальное кол-во точек замера толщины:{" "}
                  <strong className="text-white font-mono">
                    {result.recommendedMeasurementsCount} точек
                  </strong>{" "}
                  (каждые 15–20 м трассы, не менее 10).
                </li>
                <li>Межслойная сушка: не менее 8 часов (при t ≥ +5 °C).</li>
                <li>Полная готовность огнезащиты: через 4 суток (96 часов).</li>
              </ul>
            </div>

            {/* Add to Specification */}
            <div className="pt-2 space-y-3">
              <input
                type="text"
                placeholder="Пользовательское наименование позиции (необязательно)"
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 placeholder-slate-600 transition-colors"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      Копировать
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAddPosition}
                  className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 cursor-pointer transition-all shadow-lg shadow-teal-950/40"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  В спецификацию
                </button>
              </div>

              {addedToast && (
                <p className="text-center text-xs text-teal-400 font-medium animate-pulse">
                  ✓ Позиция успешно добавлена в общую спецификацию проекта!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
