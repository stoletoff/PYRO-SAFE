"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
    },
    mode: "onChange",
  });

  const formValues = watch();

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
  });

  const currentTypeConfig = INSTALLATION_TYPES.find(
    (t) => t.id === formValues.installationType
  )!;

  const isTray =
    formValues.installationType === "tray_solid" ||
    formValues.installationType === "tray_mesh";

  const handleCopy = () => {
    const text = `
=== РАСЧЕТ ОГНЕЗАЩИТЫ КАБЕЛЕЙ PYRO-SAFE FLAMMOTECT-A ===
Регламент: ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH (2022)
Тип прокладки: ${currentTypeConfig.title}
Длина трассы (L): ${formValues.lengthM} м
Размер (${formValues.installationType === "single" || formValues.installationType === "bundle" ? "Диаметр d" : "Ширина b"}): ${formValues.dimensionMm} мм
${formValues.installationType === "single" ? `Количество кабелей (N): ${formValues.cableCount} шт.\n` : ""}${isTray ? `Количество полок короба: ${formValues.shelvesCount} шт.\n` : ""}Толщина сухого слоя (DFT): ${formValues.dryFilmThicknessMm} мм
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

    const title =
      positionTitle.trim() ||
      `${currentTypeConfig.title} (FLAMMOTECT-A, L=${formValues.lengthM}м, S=${result.areaM2}м²)`;

    const item: ProjectFlammotectCableItem = {
      id: generateId("flammotect_cable"),
      type: "cable_flammotect",
      title,
      timestamp: getTimestamp(),
      details: {
        installationTypeName: currentTypeConfig.title,
        lengthM: Number(formValues.lengthM),
        dimensionMm: Number(formValues.dimensionMm),
        cableCount: Number(formValues.cableCount) || 1,
        shelvesCount: Number(formValues.shelvesCount) || 1,
        dryFilmThicknessMm: Number(formValues.dryFilmThicknessMm),
        applicationMethodName:
          FLAMMOTECT_APPLICATION_LOSSES[formValues.applicationMethod]?.label ||
          "Кисть / валик",
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
              <span className="text-xs font-normal text-slate-400">Шаг 1 из 2</span>
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

            {/* 2. Geometric Dimensions */}
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
                    <span className="text-[11px] text-slate-500">В миллиметрах</span>
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

              {/* Single cable count */}
              {formValues.installationType === "single" && (
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Количество параллельных кабелей (N)
                    </label>
                    <span className="text-[11px] text-slate-500">Штук</span>
                  </div>
                  <Controller
                    control={control}
                    name="cableCount"
                    render={({ field }) => (
                      <input
                        type="number"
                        min="1"
                        value={field.value ?? 1}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors font-mono"
                      />
                    )}
                  />
                </div>
              )}

              {/* Multi-shelf tray option (New per Section 3.2.1) */}
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
            </div>

            {/* 3. Coating thickness & Application Method */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                3. Толщина сухого слоя (DFT) и способ нанесения
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
                  className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
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
                  className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 transition-all shadow-lg shadow-teal-950/40"
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
