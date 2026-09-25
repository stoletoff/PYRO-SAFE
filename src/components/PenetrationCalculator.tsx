"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  penetrationFormSchema,
  PenetrationFormData,
} from "@/lib/schemas";
import {
  calculatePenetration,
  PenetrationResult,
  CONSTANTS,
  PENETRATION_EI_NORMS,
} from "@/lib/calculations";
import { ProjectPenetrationItem } from "@/lib/projectStore";
import { generateId, getTimestamp } from "@/lib/utils";
import {
  AlertTriangle,
  Flame,
  Plus,
  Trash2,
  Lock,
  CheckCircle,
  Copy,
  PlusCircle,
  Check,
  Layers,
  Droplets,
} from "lucide-react";

interface PenetrationCalculatorProps {
  onAddToProject?: (item: ProjectPenetrationItem) => void;
}

// Популярные типовые марки кабелей для быстрого заполнения
const TYPICAL_CABLE_PRESETS = [
  { name: "ВВГнг-FRLS 3×1.5", diameterMm: 9.5 },
  { name: "ВВГнг-FRLS 3×2.5", diameterMm: 10.8 },
  { name: "ВВГнг-LS 5×4", diameterMm: 15.2 },
  { name: "ВВГнг-FRLS 5×10", diameterMm: 19.5 },
  { name: "АВВГнг 4×35", diameterMm: 27.0 },
  { name: "АПвПуг 1×240", diameterMm: 38.0 },
  { name: "Силовой 4×120", diameterMm: 46.5 },
  { name: "Контрольный КВВГ 14×1.5", diameterMm: 16.0 },
  { name: "Витая пара UTP Cat 5e/6", diameterMm: 6.2 },
];

export function PenetrationCalculator({ onAddToProject }: PenetrationCalculatorProps) {
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [positionTitle, setPositionTitle] = useState("");

  const {
    control,
    watch,
    setValue,
  } = useForm<PenetrationFormData>({
    resolver: zodResolver(penetrationFormSchema),
    defaultValues: {
      shape: "rect",
      heightMm: 400,
      widthMm: 600,
      diameterMm: 300,
      fireResistance: "EI60",
      applicationMethod: "brush",
      humidityGt85: false,
      cables: [
        { id: "c1", name: "ВВГнг-FRLS 3×2.5", diameterMm: 11, count: 8 },
        { id: "c2", name: "ВВГнг-LS 5×10", diameterMm: 20, count: 4 },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cables",
  });

  const formValues = watch();

  // Чистый математический расчет бизнес-логики
  const result: PenetrationResult = calculatePenetration({
    shape: formValues.shape,
    heightMm: Number(formValues.heightMm) || 0,
    widthMm: Number(formValues.widthMm) || 0,
    diameterMm: Number(formValues.diameterMm) || 0,
    cables: (formValues.cables || []).map((c) => ({
      id: c.id,
      name: c.name,
      diameterMm: Number(c.diameterMm) || 0,
      count: Number(c.count) || 0,
    })),
    fireResistance: formValues.fireResistance,
    applicationMethod: formValues.applicationMethod,
    humidityGt85: Boolean(formValues.humidityGt85),
  });

  const handleAddPreset = (preset: (typeof TYPICAL_CABLE_PRESETS)[0]) => {
    append({
      id: generateId("cable"),
      name: preset.name,
      diameterMm: preset.diameterMm,
      count: 1,
    });
  };

  const handleCopy = () => {
    if (result.isBlocked) return;

    const shapeText =
      formValues.shape === "rect"
        ? `Прямоугольный ${formValues.heightMm} × ${formValues.widthMm} мм (S = ${result.openingAreaM2} м²)`
        : `Круглый Ø ${formValues.diameterMm} мм (S = ${result.openingAreaM2} м²)`;

    const cablesText = (formValues.cables || [])
      .map(
        (c) => `  - ${c.name || "Кабель"}: Ø${c.diameterMm} мм × ${c.count} шт.`
      )
      .join("\n");

    const text = `
=== РАСЧЕТ КАБЕЛЬНОЙ ПРОХОДКИ PYRO-SAFE UNIVERSALSCHOTT ===
Проем: ${shapeText}
Предел огнестойкости: ${PENETRATION_EI_NORMS[formValues.fireResistance].label}
Способ нанесения KS 1: ${formValues.applicationMethod === "brush" ? "Кисть/валик (+10%)" : "Распылитель (+30%)"}
Влажность > 85%: ${formValues.humidityGt85 ? "Да (требуется лак SP-2)" : "Нет"}

Параметры кабелей:
${cablesText || "  (Кабели не указаны)"}
Суммарное сечение кабелей: ${result.cablesAreaMm2} мм²
Коэффициент заполнения проходки: ${result.fillRatioPercent}% (макс. допустимо: 60%)

РАСХОД МАТЕРИАЛОВ:
1. Минераловатная жесткая плита: ${result.boardAreaM2} м² (${result.boardLayers} ${result.boardLayers === 1 ? "слой" : "слоя"})
2. Рассыпная базальтовая минвата: ${result.mineralWoolMassKg} кг
3. Огнезащитное покрытие FLAMMOPLAST KS 1: ${result.ks1MassKg} кг (${result.ks1BucketsCount} вёдер по ${CONSTANTS.KS1_BUCKET_WEIGHT_KG} кг)
4. Абляционная мастика PYRO-SAFE KS 3: ${result.ks3MassKg} кг
5. Защитный лак PYRO-SAFE SP-2: ${result.sp2MassKg} кг
Дата: ${new Date().toLocaleDateString("ru-RU")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddPosition = () => {
    if (!onAddToProject || result.isBlocked) return;

    const shapeText =
      formValues.shape === "rect"
        ? `${formValues.heightMm}×${formValues.widthMm} мм`
        : `Ø${formValues.diameterMm} мм`;

    const title =
      positionTitle.trim() ||
      `Проходка UNIVERSALSCHOTT ${shapeText} (${formValues.fireResistance})`;

    const cablesSummary = (formValues.cables || [])
      .map((c) => `${c.count}×Ø${c.diameterMm}`)
      .join(", ");

    const item: ProjectPenetrationItem = {
      id: generateId("pen"),
      type: "penetration",
      title,
      timestamp: getTimestamp(),
      details: {
        shapeName: formValues.shape === "rect" ? "Прямоугольная" : "Круглая",
        dimensionsText: shapeText,
        cablesSummary,
        fireResistance: formValues.fireResistance,
        applicationMethodName:
          formValues.applicationMethod === "brush" ? "Кисть/валик" : "Распылитель",
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
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-red-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              UNIVERSALSCHOTT • svt Brandschutz
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Кабельные проходки универсальной системы UNIVERSALSCHOTT
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Комплексный расчет сертифицированной проходки (минплита, базальтовая минвата, FLAMMOPLAST KS 1, мастика KS 3, лак SP-2).
              Нормативные классы огнестойкости: <strong className="text-slate-200">EI 60</strong> (1 слой) и{" "}
              <strong className="text-slate-200">EI 180</strong> (2 слоя).
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800/50 flex items-center">
              <Flame className="w-4 h-4 text-red-400 mr-1.5" />
              Стандарт EN 1366-3
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM PANEL (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-7">
          {/* Penetration Geometry */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">
                Геометрия проема проходки
              </label>
              <span className="text-xs font-mono text-slate-400">
                S = <strong className="text-orange-400">{result.openingAreaM2}</strong> м² ({result.openingAreaMm2.toLocaleString()} мм²)
              </span>
            </div>

            {/* Shape selection tabs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("shape", "rect")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  formValues.shape === "rect"
                    ? "bg-orange-500/10 border-orange-500 text-white font-medium shadow-md shadow-orange-950/20"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-sm font-semibold mb-0.5">Прямоугольный проем</div>
                <div className="text-xs text-slate-500 font-mono">Высота (H) × Ширина (W)</div>
              </button>

              <button
                type="button"
                onClick={() => setValue("shape", "round")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  formValues.shape === "round"
                    ? "bg-orange-500/10 border-orange-500 text-white font-medium shadow-md shadow-orange-950/20"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-sm font-semibold mb-0.5">Круглый проем</div>
                <div className="text-xs text-slate-500 font-mono">Диаметр (Ø D)</div>
              </button>
            </div>

            {/* Dimension Inputs */}
            {formValues.shape === "rect" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Высота (H), мм
                  </label>
                  <Controller
                    name="heightMm"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        min="50"
                        step="10"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none"
                        placeholder="400"
                      />
                    )}
                  />
                  {/* Quick sizes */}
                  <div className="flex gap-1 pt-1">
                    {[200, 400, 600, 800].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setValue("heightMm", h)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Ширина (W), мм
                  </label>
                  <Controller
                    name="widthMm"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        min="50"
                        step="10"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none"
                        placeholder="600"
                      />
                    )}
                  />
                  {/* Quick sizes */}
                  <div className="flex gap-1 pt-1">
                    {[300, 500, 600, 1000].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setValue("widthMm", w)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Диаметр круглого проема (Ø D), мм
                </label>
                <Controller
                  name="diameterMm"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      min="50"
                      step="10"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none"
                      placeholder="300"
                    />
                  )}
                />
                <div className="flex gap-1 pt-1">
                  {[100, 150, 200, 300, 400, 500].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setValue("diameterMm", d)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      Ø{d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* System Settings (EI + Application Method + Humidity) */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <label className="text-sm font-semibold text-slate-200">
              Параметры огнестойкости и нанесения
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fire resistance rating */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-300">
                  Предел огнестойкости (EI)
                </span>
                <Controller
                  name="fireResistance"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange("EI60")}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          field.value === "EI60"
                            ? "bg-orange-500/20 border-orange-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="text-sm">EI 60</div>
                        <div className="text-[10px] text-slate-400 font-normal">1 слой плиты</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => field.onChange("EI180")}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          field.value === "EI180"
                            ? "bg-red-500/20 border-red-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="text-sm">EI 180</div>
                        <div className="text-[10px] text-slate-400 font-normal">2 слоя плиты</div>
                      </button>
                    </div>
                  )}
                />
              </div>

              {/* Application method */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-300">
                  Способ нанесения KS 1
                </span>
                <Controller
                  name="applicationMethod"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange("brush")}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          field.value === "brush"
                            ? "bg-orange-500/20 border-orange-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="text-xs">Кисть / Валик</div>
                        <div className="text-[10px] text-orange-400 font-mono">+10% потери</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => field.onChange("sprayer")}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          field.value === "sprayer"
                            ? "bg-orange-500/20 border-orange-500 text-white font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="text-xs">Распылитель</div>
                        <div className="text-[10px] text-orange-400 font-mono">+30% потери</div>
                      </button>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Humidity toggle */}
            <Controller
              name="humidityGt85"
              control={control}
              render={({ field }) => (
                <label className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-900 cursor-pointer"
                  />
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-slate-200">
                      Влажность помещения &gt; 85%
                    </span>
                    <span className="text-slate-400 ml-1.5">
                      (добавляет финишный защитный лак SP-2 по 0,175 кг/м²)
                    </span>
                  </div>
                </label>
              )}
            />
          </div>

          {/* Dynamic Cables List */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-200 block">
                  Кабели в проходке
                </label>
                <span className="text-xs text-slate-400">
                  Суммарное сечение:{" "}
                  <strong className="text-white font-mono">{result.cablesAreaMm2.toLocaleString()} мм²</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  append({
                    id: "c-" + Date.now(),
                    name: "Кабель",
                    diameterMm: 20,
                    count: 1,
                  })
                }
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Добавить строку
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-medium">
                Быстрое добавление типового кабеля:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TYPICAL_CABLE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  >
                    + {preset.name} (Ø{preset.diameterMm}мм)
                  </button>
                ))}
              </div>
            </div>

            {/* Cable entries table */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {fields.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Кабели еще не добавлены. Добавьте кабели вручную или воспользуйтесь быстрыми кнопками выше.
                </div>
              ) : (
                fields.map((field, index) => {
                  const currentCable = formValues.cables?.[index];
                  const diameter = Number(currentCable?.diameterMm) || 0;
                  const count = Number(currentCable?.count) || 0;
                  const singleArea = Math.PI * Math.pow(diameter / 2, 2);
                  const groupArea = Math.round(singleArea * count);

                  return (
                    <div
                      key={field.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-[120px]">
                        <Controller
                          name={`cables.${index}.name`}
                          control={control}
                          render={({ field: nameField }) => (
                            <input
                              type="text"
                              value={nameField.value || ""}
                              onChange={nameField.onChange}
                              placeholder="Марка кабеля (напр. ВВГнг 3х2.5)"
                              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="w-24">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Диаметр Ø, мм</label>
                          <Controller
                            name={`cables.${index}.diameterMm`}
                            control={control}
                            render={({ field: dField }) => (
                              <input
                                type="number"
                                min="1"
                                max="300"
                                step="any"
                                value={dField.value || ""}
                                onChange={(e) => dField.onChange(parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-lg px-2 py-1 text-slate-100 font-mono outline-none"
                              />
                            )}
                          />
                        </div>

                        <div className="w-20">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Кол-во, шт</label>
                          <Controller
                            name={`cables.${index}.count`}
                            control={control}
                            render={({ field: cField }) => (
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                step="1"
                                value={cField.value || ""}
                                onChange={(e) => cField.onChange(parseInt(e.target.value, 10) || 1)}
                                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-lg px-2 py-1 text-slate-100 font-mono outline-none"
                              />
                            )}
                          />
                        </div>

                        <div className="w-24 text-right hidden sm:block">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Сечение</span>
                          <span className="font-mono text-slate-300 font-medium">{groupArea} мм²</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          title="Удалить строку"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors ml-1 self-end sm:self-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RESULTS PANEL (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* CRITICAL VALIDATION GAUGE (0 - 60% MAX) */}
          <div
            className={`border rounded-2xl p-5 shadow-2xl transition-all ${
              result.isBlocked
                ? "bg-red-950/40 border-red-700/80 shadow-red-950/50"
                : result.fillRatioPercent > 45
                ? "bg-amber-950/20 border-amber-600/50"
                : "bg-slate-900/90 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
                {result.isBlocked ? (
                  <AlertTriangle className="w-4 h-4 text-red-400 mr-1.5 animate-bounce" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 mr-1.5" />
                )}
                Заполнение проема кабелями
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Макс. норматив:{" "}
                <strong className="text-orange-400">60%</strong>
              </span>
            </div>

            {/* Gauge Percentage Number */}
            <div className="flex items-baseline justify-between my-2">
              <div
                className={`text-3xl font-black font-mono tracking-tight ${
                  result.isBlocked
                    ? "text-red-400"
                    : result.fillRatioPercent > 45
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {result.fillRatioPercent}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {result.cablesAreaMm2.toLocaleString()} / {result.openingAreaMm2.toLocaleString()} мм²
              </div>
            </div>

            {/* Progress Bar with 60% Marker */}
            <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 my-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  result.isBlocked
                    ? "bg-red-600 animate-pulse"
                    : result.fillRatioPercent > 45
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(100, (result.fillRatioPercent / 100) * 100)}%`,
                }}
              />
              {/* 60% threshold vertical marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                style={{ left: "60%" }}
                title="Максимальный допустимый лимит: 60%"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0%</span>
              <span className="text-red-400 font-semibold">60% макс.</span>
              <span>100%</span>
            </div>

            {/* Critical error or success message */}
            {result.isBlocked ? (
              <div className="mt-3 p-3 rounded-xl bg-red-900/40 border border-red-600 text-xs text-red-200 space-y-1">
                <div className="font-bold flex items-center text-red-300">
                  <Lock className="w-3.5 h-3.5 mr-1 text-red-400" />
                  РАСЧЕТ ЗАБЛОКИРОВАН НОРМАТИВОМ!
                </div>
                <p>
                  Загальний дозволений переріз кабелів не може бути більше 60% від площі перерізу проходки!
                </p>
                <p className="text-[11px] text-red-300/80 pt-1">
                  💡 <strong>Рекомендация:</strong> Увеличьте высоту или ширину проема, либо распределите часть кабелей во вторую отдельную проходку.
                </p>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-slate-400">
                ✓ Норматив заполнения соблюден. Свободно еще{" "}
                <strong className="text-emerald-400 font-mono">
                  {Math.max(0, 60 - result.fillRatioPercent).toFixed(1)}%
                </strong>{" "}
                допустимого объема проходки.
              </div>
            )}
          </div>

          {/* MATERIAL SPECIFICATION OUTPUTS */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white">Ведомость материалов</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40">
                UNIVERSALSCHOTT
              </span>
            </div>

            {result.isBlocked ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto text-red-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-300">
                  Расчет заблокирован
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Устраните превышение коэффициента заполнения (&le; 60%), чтобы сформировать спецификацию материалов.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Mineral Wool Boards */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                      Минераловатная жесткая плита (150 кг/м³)
                    </span>
                    <span className="text-[11px] font-mono text-orange-400 font-bold">
                      {result.boardLayers} {result.boardLayers === 1 ? "слой" : "слоя"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="text-2xl font-black text-white font-mono tracking-tight">
                      {result.boardAreaM2}
                    </div>
                    <div className="text-sm font-mono text-slate-400 font-semibold">
                      м²
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {result.boardLayers === 1
                      ? "EI 60: 1 слой плиты толщиной 50 мм"
                      : "EI 180: 2 слоя плиты (2×50 мм) с двух сторон проходки"}
                  </div>
                </div>

                {/* 2. Loose Mineral Wool */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                      Рассыпная минеральная вата (базальт)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      для заделки полостей
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="text-2xl font-black text-white font-mono tracking-tight">
                      {result.mineralWoolMassKg}
                    </div>
                    <div className="text-sm font-mono text-slate-400 font-semibold">
                      кг
                    </div>
                  </div>
                </div>

                {/* 3. FLAMMOPLAST KS 1 */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-950/30 to-slate-950/80 border border-orange-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-orange-300 font-semibold uppercase tracking-wider">
                      FLAMMOPLAST KS 1 (огнезащита)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      потери: {result.applicationLossFactor === 1.1 ? "+10%" : "+30%"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="text-3xl font-black text-orange-400 font-mono tracking-tight">
                      {result.ks1MassKg}
                    </div>
                    <div className="text-sm font-mono text-orange-300 font-semibold">
                      кг
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-orange-900/30 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Вёдра (по 12.5 кг):</span>
                    <div className="text-xs font-bold font-mono text-white bg-orange-600/30 border border-orange-500/40 px-2 py-0.5 rounded">
                      {result.ks1BucketsCount} шт.
                    </div>
                  </div>
                </div>

                {/* 4. PYRO-SAFE KS 3 (Ablative Mastic) */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                      Абляционная мастика PYRO-SAFE KS 3
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      герметизация щелей и пучков
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="text-2xl font-black text-white font-mono tracking-tight">
                      {result.ks3MassKg}
                    </div>
                    <div className="text-sm font-mono text-slate-400 font-semibold">
                      кг
                    </div>
                  </div>
                </div>

                {/* 5. Protective Varnish SP-2 */}
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
                </div>
              </div>
            )}

            {/* Actions */}
            {!result.isBlocked && (
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-3 no-print">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    placeholder="Наименование (напр.: Проходка П-1 в щитовой)"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAddPosition}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-medium text-xs shadow-lg shadow-red-950/40 transition-all active:scale-[0.98]"
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
                  <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs text-center flex items-center justify-center animate-fadeIn">
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Проходка успешно добавлена в сводную ведомость проекта!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
