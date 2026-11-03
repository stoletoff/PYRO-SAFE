"use client";

import React, { useState, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  flammotectPenetrationFormSchema,
  FlammotectPenetrationFormData,
} from "@/lib/schemas";
import {
  calculateFlammotectPenetration,
  FlammotectPenetrationResult,
  FLAMMOTECT_APPLICATION_LOSSES,
  FlammotectApplicationMethod,
} from "@/lib/calculations";
import { ProjectFlammotectPenetrationItem } from "@/lib/projectStore";
import { generateId, getTimestamp } from "@/lib/utils";
import {
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  PlusCircle,
  Check,
  Search,
  Flame,
  Gauge,
} from "lucide-react";
import {
  CABLES_CATALOG,
  CableSpec,
  POPULAR_CABLES,
} from "@/lib/cablesCatalog";

interface FlammotectPenetrationCalculatorProps {
  onAddToProject?: (item: ProjectFlammotectPenetrationItem) => void;
}

export function FlammotectPenetrationCalculator({
  onAddToProject,
}: FlammotectPenetrationCalculatorProps) {
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [positionTitle, setPositionTitle] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "popular" | "Интеркабель" | "Южкабель" | "all"
  >("popular");
  const [cableSearch, setCableSearch] = useState("");

  const {
    control,
    watch,
    setValue,
  } = useForm<FlammotectPenetrationFormData>({
    resolver: zodResolver(flammotectPenetrationFormSchema),
    defaultValues: {
      shape: "rect",
      heightMm: 400,
      widthMm: 600,
      diameterMm: 300,
      applicationMethod: "brush_10",
      includeCuttingLosses: true,
      isFloorPenetration: false,
      penetrants: [
        { id: "p1", name: "(N)HXH FE180/E90 3×2.5", type: "cable", diameterMm: 13, count: 6 },
        { id: "p2", name: "ВВГнгд 5×10", type: "cable", diameterMm: 19, count: 4 },
        { id: "p3", name: "Труба ПВХ Ø50 мм", type: "pipe_plastic", diameterMm: 50, count: 1 },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "penetrants",
  });

  const formValues = watch();

  const result: FlammotectPenetrationResult = calculateFlammotectPenetration({
    shape: formValues.shape,
    heightMm: Number(formValues.heightMm) || 0,
    widthMm: Number(formValues.widthMm) || 0,
    diameterMm: Number(formValues.diameterMm) || 0,
    penetrants: (formValues.penetrants || []).map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      diameterMm: Number(p.diameterMm) || 0,
      count: Number(p.count) || 0,
    })),
    applicationMethod:
      (formValues.applicationMethod as FlammotectApplicationMethod) ||
      "brush_10",
    includeCuttingLosses: Boolean(formValues.includeCuttingLosses),
    isFloorPenetration: Boolean(formValues.isFloorPenetration),
  });

  const filteredCables = useMemo(() => {
    let list = CABLES_CATALOG;
    if (selectedFilter === "popular") {
      list = POPULAR_CABLES;
    } else if (selectedFilter === "Интеркабель" || selectedFilter === "Южкабель") {
      list = CABLES_CATALOG.filter((c) => c.manufacturer === selectedFilter);
    }

    if (cableSearch.trim()) {
      const q = cableSearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.manufacturer.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedFilter, cableSearch]);

  const handleAddCableSpec = (cable: CableSpec) => {
    append({
      id: generateId("pen"),
      name: cable.name,
      type: "cable",
      diameterMm: cable.diameterMm,
      count: 1,
    });
  };

  const handleAddCustomPenetrant = (type: "cable" | "pipe_plastic" | "pipe_metal") => {
    let defaultName = "Кабель";
    let defaultDia = 20;
    if (type === "pipe_plastic") {
      defaultName = "Труба ПВХ / ПЭ";
      defaultDia = 50;
    } else if (type === "pipe_metal") {
      defaultName = "Труба стальная";
      defaultDia = 54;
    }

    append({
      id: generateId("pen"),
      name: defaultName,
      type,
      diameterMm: defaultDia,
      count: 1,
    });
  };

  const dimensionsText =
    formValues.shape === "rect"
      ? `${formValues.widthMm || 0} × ${formValues.heightMm || 0} мм`
      : `Ø ${formValues.diameterMm || 0} мм`;

  const handleCopy = () => {
    if (result.isBlocked) return;

    const penetrantsSummary = (formValues.penetrants || [])
      .map((p) => `${p.name || "Элемент"} (Ø${p.diameterMm}мм, ${p.count} шт.)`)
      .join("; ");

    const text = `
=== РАСЧЕТ КАБЕЛЬНОЙ ПРОХОДКИ PYRO-SAFE FLAMMOTECT (DOUBLE LAYER) ===
Регламент: ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH (2022)
Тип конструкции: ${formValues.isFloorPenetration ? "Перекрытие (≥150 мм)" : "Стена / перегородка (≥100 мм)"}
Форма и размеры: ${dimensionsText}
Предел огнестойкости: EI 120 (Двухслойная проходка 2 × 60 мм = 120 мм)
---
Площадь проема (S): ${result.openingAreaM2} м² (${result.openingAreaMm2} мм²)
Площадь сечения коммуникаций: ${result.penetrantsAreaMm2} мм²
Коэффициент заполнения: ${result.fillRatioPercent}% (лимит не более 60%)
Состав коммуникаций: ${penetrantsSummary}
---
ПОТРЕБНОСТЬ В МАТЕРИАЛАХ:
1. FLAMMOTECT-A coating (краска): ${result.coatingMassKg} кг (${result.coatingBucketsCount} вёдер по 12.5 кг)
2. FLAMMOTECT-A filler (шпаклевка): ${result.fillerMassKg} кг (${result.fillerBucketsCount} вёдер по 12.5 кг)
3. Минплита 150 кг/м³ (толщина 60 мм, 2 слоя): ${result.boardAreaM2} м²
4. Рассыпная базальтовая вата: ${result.looseWoolMassKg} кг
${result.dgCrBsMeters > 0 ? `5. Противопожарная обмотка DG-CR BS: ${result.dgCrBsMeters} пог. м\n` : ""}Контроль: ${result.measurementsCount} контрольных замера толщины гребенкой/штангенциркулем
Дата: ${new Date().toLocaleDateString("ru-RU")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddPosition = () => {
    if (!onAddToProject || result.isBlocked) return;

    const penetrantsSummary = (formValues.penetrants || [])
      .map((p) => `${p.name || "Элемент"} (Ø${p.diameterMm}мм, ${p.count} шт.)`)
      .join(", ");

    const title =
      positionTitle.trim() ||
      `Проходка FLAMMOTECT Double Layer (${dimensionsText}, EI 120, зап. ${result.fillRatioPercent}%)`;

    const item: ProjectFlammotectPenetrationItem = {
      id: generateId("flammotect_pen"),
      type: "penetration_flammotect",
      title,
      timestamp: getTimestamp(),
      details: {
        shapeName: formValues.shape === "rect" ? "Прямоугольный" : "Круглый",
        dimensionsText,
        penetrantsSummary: penetrantsSummary || "Без коммуникаций",
        applicationMethodName:
          FLAMMOTECT_APPLICATION_LOSSES[formValues.applicationMethod]?.label ||
          "Кисть / шпатель",
        locationTypeName: formValues.isFloorPenetration ? "Перекрытие" : "Стена",
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
      {/* Header banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Регламент 2022 • Двухслойная проходка Double Layer EI 120</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center">
              <Flame className="w-6 h-6 mr-2.5 text-rose-500" />
              Проходки: PYRO-SAFE FLAMMOTECT (Double layer)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Огнестойкие кабельные и трубные проходки для стен (≥ 100 мм) и перекрытий (≥ 150 мм).
              Комбинация 2-х слоев жестких минераловатных плит по 60 мм, абляционной краски FLAMMOTECT-A coating, огнестойкой шпаклевки filler и бандажей DG-CR BS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800/40">
              Предел огнестойкости: EI 120
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Габариты до 1400×2000 мм
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-950 text-teal-300 border border-teal-800/40">
              АЭС гермозона
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Penetrants */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Opening Geometry & Location */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-5">
            <h2 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>1. Геометрия проема и строительная конструкция</span>
              <span className="text-xs font-mono text-slate-400">п. Таблица 2</span>
            </h2>

            {/* Location: Wall or Floor */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("isFloorPenetration", false)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !formValues.isFloorPenetration
                    ? "bg-rose-500/10 border-rose-500/40 text-white shadow-md shadow-rose-950/20"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <strong className="block text-xs font-bold mb-0.5">Стена / перегородка</strong>
                <span className="text-[11px] text-slate-400">Толщина ≥ 100 мм</span>
              </button>

              <button
                type="button"
                onClick={() => setValue("isFloorPenetration", true)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formValues.isFloorPenetration
                    ? "bg-rose-500/10 border-rose-500/40 text-white shadow-md shadow-rose-950/20"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <strong className="block text-xs font-bold mb-0.5">Перекрытие (пол/потолок)</strong>
                <span className="text-[11px] text-slate-400">Толщина ≥ 150 мм</span>
              </button>
            </div>

            {/* Shape Selector */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setValue("shape", "rect")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formValues.shape === "rect"
                    ? "bg-slate-800 text-white border-rose-500/40"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                <strong className="block text-xs font-bold mb-0.5">Прямоугольный проем</strong>
                <span className="text-[11px] text-slate-400">Ширина × Высота (мм)</span>
              </button>

              <button
                type="button"
                onClick={() => setValue("shape", "round")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formValues.shape === "round"
                    ? "bg-slate-800 text-white border-rose-500/40"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                <strong className="block text-xs font-bold mb-0.5">Круглый проем</strong>
                <span className="text-[11px] text-slate-400">Диаметр (мм)</span>
              </button>
            </div>

            {/* Dimension Inputs */}
            {formValues.shape === "rect" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Ширина проема (B), мм
                  </label>
                  <Controller
                    control={control}
                    name="widthMm"
                    render={({ field }) => (
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        placeholder="600"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                    )}
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Макс. 1400–2000 мм</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Высота проема (H), мм
                  </label>
                  <Controller
                    control={control}
                    name="heightMm"
                    render={({ field }) => (
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        placeholder="400"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                    )}
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Макс. 1400–2000 мм</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Диаметр проема (D), мм
                </label>
                <Controller
                  control={control}
                  name="diameterMm"
                  render={({ field }) => (
                    <input
                      type="number"
                      min="50"
                      max="2000"
                      placeholder="300"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* 2. Penetrants List (Cables & Pipes) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center">
                  <span>2. Коммуникации в проеме (Кабели и Трубы)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Допустимое суммарное заполнение: не более 60% площади
                </p>
              </div>

              {/* Quick Add Buttons */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleAddCustomPenetrant("cable")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 text-teal-400" />
                  + Кабель
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCustomPenetrant("pipe_plastic")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 text-rose-400" />
                  + Пласт. труба
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCustomPenetrant("pipe_metal")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  + Металл. труба
                </button>
              </div>
            </div>

            {/* Penetrants Items Table */}
            {fields.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Коммуникации не добавлены. Добавьте кабели или трубы кнопками выше или из справочника ниже.
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((fieldItem, index) => {
                  const currentType = formValues.penetrants?.[index]?.type || "cable";
                  return (
                    <div
                      key={fieldItem.id}
                      className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs"
                    >
                      {/* Type badge */}
                      <div className="shrink-0">
                        {currentType === "cable" && (
                          <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/40 text-[10px] font-mono">
                            Кабель
                          </span>
                        )}
                        {currentType === "pipe_plastic" && (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40 text-[10px] font-mono" title="Требуется DG-CR BS">
                            Пл. труба (DG-CR)
                          </span>
                        )}
                        {currentType === "pipe_metal" && (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 text-[10px] font-mono">
                            Мет. труба
                          </span>
                        )}
                      </div>

                      {/* Name input */}
                      <div className="flex-1 min-w-0">
                        <Controller
                          control={control}
                          name={`penetrants.${index}.name`}
                          render={({ field }) => (
                            <input
                              type="text"
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Марка / описание"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                            />
                          )}
                        />
                      </div>

                      {/* Diameter */}
                      <div className="w-28 shrink-0">
                        <div className="flex items-center space-x-1">
                          <span className="text-[11px] text-slate-500 font-mono">Ø</span>
                          <Controller
                            control={control}
                            name={`penetrants.${index}.diameterMm`}
                            render={({ field }) => (
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-rose-500"
                              />
                            )}
                          />
                          <span className="text-[11px] text-slate-500">мм</span>
                        </div>
                      </div>

                      {/* Count */}
                      <div className="w-24 shrink-0">
                        <div className="flex items-center space-x-1">
                          <Controller
                            control={control}
                            name={`penetrants.${index}.count`}
                            render={({ field }) => (
                              <input
                                type="number"
                                min="1"
                                max="5000"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-rose-500"
                              />
                            )}
                          />
                          <span className="text-[11px] text-slate-500">шт.</span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition-colors self-end sm:self-center"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Catalog Search for Cables */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Быстрый подбор кабелей из справочника:
                </span>
                <div className="flex space-x-1">
                  {(["popular", "Интеркабель", "Южкабель", "all"] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setSelectedFilter(filterKey)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        selectedFilter === filterKey
                          ? "bg-rose-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {filterKey === "popular"
                        ? "Популярные"
                        : filterKey === "all"
                        ? "Все"
                        : filterKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cable search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Поиск марки кабеля..."
                  value={cableSearch}
                  onChange={(e) => setCableSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {filteredCables.slice(0, 15).map((cable) => (
                  <button
                    key={cable.id}
                    type="button"
                    onClick={() => handleAddCableSpec(cable)}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors"
                  >
                    <span>{cable.name}</span>
                    <span className="font-mono text-teal-400">Ø{cable.diameterMm}</span>
                    <Plus className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Application Method & Losses */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Способ нанесения покрытия (п. 3.1)
                </label>
                <Controller
                  control={control}
                  name="applicationMethod"
                  render={({ field }) => (
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="brush_5">Кисть / шпатель (+5% потерь)</option>
                      <option value="brush_10">Кисть / шпатель (+10% потерь)</option>
                      <option value="sprayer_30">Распылитель ВД (+30% потерь)</option>
                    </select>
                  )}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Потери на раскрой минплит и ваты
                </label>
                <Controller
                  control={control}
                  name="includeCuttingLosses"
                  render={({ field }) => (
                    <label className="flex items-center space-x-2 p-2 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-xs text-slate-300">
                        Учитывать нормативный запас +30%
                      </span>
                    </label>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output & Spec */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                <Gauge className="w-4 h-4 mr-2 text-rose-500" />
                Спецификация проходки EI 120
              </h3>
              <span className="text-xs font-mono text-rose-400">FLAMMOTECT</span>
            </div>

            {/* Fill Ratio Gauge */}
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Заполнение проема коммуникациями:</span>
                <span
                  className={`font-black font-mono text-sm ${
                    result.fillRatioPercent > 60
                      ? "text-red-400"
                      : result.fillRatioPercent > 50
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {result.fillRatioPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                {/* 60% limit line */}
                <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-red-500 z-10" title="Нормативный лимит 60%" />
                <div
                  className={`h-full transition-all duration-300 ${
                    result.fillRatioPercent > 60
                      ? "bg-red-500"
                      : result.fillRatioPercent > 50
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, result.fillRatioPercent)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Сечение комун. = {result.penetrantsAreaMm2} мм²</span>
                <span>Лимит по регламенту: ≤ 60%</span>
              </div>

              {result.isBlocked && (
                <div className="p-2 bg-red-950/40 border border-red-800/50 rounded-lg flex items-center text-red-300 text-xs mt-2">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-red-400 shrink-0" />
                  <span>{result.validationError}</span>
                </div>
              )}
            </div>

            {/* Bill of Materials Output */}
            {!result.isBlocked && (
              <div className="space-y-3">
                {/* FLAMMOTECT-A coating */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      FLAMMOTECT-A coating (краска)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Базовая норма 6,48 кг/м² + потери
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-rose-400 font-mono">
                      {result.coatingMassKg} кг
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      ({result.coatingBucketsCount} вёдер по 12.5 кг)
                    </span>
                  </div>
                </div>

                {/* FLAMMOTECT-A filler */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      FLAMMOTECT-A filler (шпаклевка)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Базовая норма 5,0 кг/м² для швов и стыков
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white font-mono">
                      {result.fillerMassKg} кг
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      ({result.fillerBucketsCount} вёдер по 12.5 кг)
                    </span>
                  </div>
                </div>

                {/* Mineral wool boards */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Минплита 150 кг/м³ (толщина 60 мм)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      2 слоя (общая толщина 120 мм, EI 120)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {result.boardAreaM2} м²
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      (2 слоя плит)
                    </span>
                  </div>
                </div>

                {/* Loose mineral wool */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Рассыпная базальтовая минвата
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Набивка зазоров и пустот (1,52 кг/м²)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-300 font-mono">
                      {result.looseWoolMassKg} кг
                    </span>
                  </div>
                </div>

                {/* DG-CR BS wrap (if plastic pipes present) */}
                {result.dgCrBsMeters > 0 && (
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-300 block">
                        Обмотка PYRO-SAFE DG-CR BS
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Ширина 100 мм для пластиковых труб
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-rose-300 font-mono">
                        {result.dgCrBsMeters} м
                      </span>
                    </div>
                  </div>
                )}

                {/* Quality control tips */}
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                  <span className="font-semibold text-slate-300 block">
                    Контроль качества монтажа (п. 5.1):
                  </span>
                  <div>
                    • Обязательно провести <strong>{result.measurementsCount} контрольных замера</strong> толщины на данной проходке.
                  </div>
                  <div>• Световой тест фонарем с обратной стороны — отсутствие щелей.</div>
                  <div>• Межслойная сушка: ≥ 8 часов. Полная полимеризация: 4 суток.</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-3">
              <input
                type="text"
                placeholder="Пользовательское наименование позиции (необязательно)"
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                disabled={result.isBlocked}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500 placeholder-slate-600 transition-colors disabled:opacity-50"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={result.isBlocked}
                  className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
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
                  disabled={result.isBlocked}
                  className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-950/40 disabled:opacity-50"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  В спецификацию
                </button>
              </div>

              {addedToast && (
                <p className="text-center text-xs text-rose-400 font-medium animate-pulse">
                  ✓ Проходка Double Layer добавлена в спецификацию проекта!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
