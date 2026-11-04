"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Wrench, Ruler, Sparkles } from "lucide-react";
import { STANDARD_ROUND_SLEEVES, STANDARD_RECT_SLEEVES } from "@/lib/calculations";
import { PenetrationCalculatorReturn } from "./usePenetrationCalculator";

interface PenetrationGeometrySectionProps {
  calc: PenetrationCalculatorReturn;
}

export function PenetrationGeometrySection({ calc }: PenetrationGeometrySectionProps) {
  const {
    control,
    formValues,
    setValue,
    sleeveTag,
    setSleeveTag,
    wallThicknessMm,
    setWallThicknessMm,
    sleeveLengthInfo,
    sleeveRec,
    currentSleeveSpec,
    dimensionsText,
    totalPenetrantsAreaMm2,
    handleApplyRecommendedSleeve,
    handleSelectRoundSleeve,
    handleSelectRectSleeve,
  } = calc;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center">
            <Wrench className="w-4 h-4 mr-2 text-rose-500" />
            <span>1. Параметры проходки / гильзы</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Геометрия проема или гильзы, проверка коэффициента заполнения и расчет заделки ОЗС
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Марка:</span>
            <input
              type="text"
              value={sleeveTag}
              onChange={(e) => setSleeveTag(e.target.value)}
              placeholder="Г-1"
              className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-rose-400 text-center uppercase focus:outline-none focus:border-rose-500"
              title="Маркировка проходки / гильзы в чертежах"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-0.5">
            <span className="text-xs text-slate-400 font-mono">Кол-во:</span>
            <button
              type="button"
              onClick={() => {
                const cur = Number(formValues.count) || 1;
                setValue("count", Math.max(1, cur - 1));
              }}
              className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition-colors"
              title="Уменьшить количество"
            >
              -
            </button>
            <Controller
              control={control}
              name="count"
              render={({ field }) => (
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={field.value ?? 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    field.onChange(isNaN(val) ? 1 : Math.max(1, Math.min(1000, val)));
                  }}
                  className="w-12 bg-transparent text-center font-mono font-bold text-emerald-400 text-xs focus:outline-none"
                  title="Количество одинаковых проходок"
                />
              )}
            />
            <button
              type="button"
              onClick={() => {
                const cur = Number(formValues.count) || 1;
                setValue("count", Math.min(1000, cur + 1));
              }}
              className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition-colors"
              title="Увеличить количество"
            >
              +
            </button>
            <span className="text-[11px] text-slate-500 font-mono">шт.</span>
          </div>
        </div>
      </div>

      {/* Location: Wall or Floor */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Тип строительной конструкции (ограждающей преграды):
        </label>
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
            <span className="text-[11px] text-slate-400">Толщина ≥ 100 мм (выпуски по +20 мм)</span>
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
            <span className="text-[11px] text-slate-400">Толщина ≥ 150 мм (выпуск +50 мм по ПУЭ)</span>
          </button>
        </div>
      </div>

      {/* Wall / Floor Thickness Input & Presets */}
      <div className="space-y-2 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Ruler className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            Толщина {formValues.isFloorPenetration ? "перекрытия" : "стены"} (H_стр), мм:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="50"
              max="1500"
              value={wallThicknessMm || ""}
              onChange={(e) => setWallThicknessMm(Math.max(50, parseFloat(e.target.value) || 0))}
              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white text-right font-mono focus:outline-none focus:border-rose-500"
            />
            <span className="text-xs text-slate-400 font-mono">мм</span>
          </div>
        </div>

        {/* Fast presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 font-medium">Стандарты:</span>
          {!formValues.isFloorPenetration ? (
            <>
              {[100, 150, 200, 250, 300, 380, 510].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWallThicknessMm(t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    wallThicknessMm === t
                      ? "bg-rose-500 text-white font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {t} мм {t === 380 ? "(1.5 кирп)" : t === 510 ? "(2 кирп)" : ""}
                </button>
              ))}
            </>
          ) : (
            <>
              {[150, 180, 200, 220, 250, 300].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWallThicknessMm(t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    wallThicknessMm === t
                      ? "bg-rose-500 text-white font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {t} мм {t === 220 ? "(ПК/ПБ)" : ""}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Sleeve length banner */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-white">
              Расчетная длина гильзы: <span className="font-mono text-rose-400 text-sm">L = {sleeveLengthInfo.totalLengthMm} мм</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {sleeveLengthInfo.ruleText}
            </p>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-rose-950/80 border border-rose-800/40 text-rose-300 shrink-0 self-start sm:self-center">
            {formValues.isFloorPenetration ? "+65 мм (50+15)" : "+40 мм (20+20)"}
          </span>
        </div>
      </div>

      {/* Smart Auto-sizing Box */}
      <div className="p-4 bg-gradient-to-br from-rose-950/30 via-slate-950 to-slate-950 border border-rose-800/30 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Подбор сечения гильзы по кабелям (ПУЭ ≤ 60%)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            ∑S кабелей = {(totalPenetrantsAreaMm2 / 100).toFixed(1)} см²
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block">
              Рекомендуемый типоразмер закладной гильзы:
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
              {sleeveRec.recommendedLabel}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Заполнение:{" "}
              <strong className={sleeveRec.fillPercent > 50 ? "text-amber-400" : "text-emerald-400"}>
                {sleeveRec.fillPercent}%
              </strong>{" "}
              (лимит ПУЭ ≤ 60%)
            </span>
          </div>

          <button
            type="button"
            onClick={handleApplyRecommendedSleeve}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/30 transition-all self-start sm:self-auto"
          >
            Применить рекомендованное
          </button>
        </div>

        {/* Quick select from standard assortment */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Быстрый выбор из стандартного ряда гильз:</span>
            <span className="text-slate-500 text-[10px]">Клик для выбора</span>
          </div>

          {formValues.shape === "round" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
              {STANDARD_ROUND_SLEEVES.map((s) => {
                const fill = s.areaMm2 > 0 ? (totalPenetrantsAreaMm2 / s.areaMm2) * 100 : 0;
                const isOver = fill > 60;
                const isCurrent = Math.abs(s.internalDiameterMm - (Number(formValues.diameterMm) || 0)) <= 2;
                return (
                  <button
                    key={s.du}
                    type="button"
                    onClick={() => handleSelectRoundSleeve(s)}
                    className={`p-2 rounded-lg border text-left text-[11px] transition-all flex flex-col justify-between ${
                      isCurrent
                        ? "bg-rose-950/90 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/50"
                        : isOver
                        ? "bg-slate-950/50 border-red-900/30 text-slate-500 hover:border-red-800/50"
                        : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="font-mono font-bold truncate">Ду {s.du} (Ø{s.diameterMm})</span>
                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <span className={isOver ? "text-red-400 font-bold" : fill > 50 ? "text-amber-400 font-medium" : "text-emerald-400"}>
                        {fill.toFixed(0)}%
                      </span>
                      {isOver ? (
                        <span className="text-red-400 text-[9px] font-mono">&gt; 60%</span>
                      ) : (
                        <span className="text-slate-500 text-[9px]">ок</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
              {STANDARD_RECT_SLEEVES.map((s, idx) => {
                const fill = s.areaMm2 > 0 ? (totalPenetrantsAreaMm2 / s.areaMm2) * 100 : 0;
                const isOver = fill > 60;
                const isCurrent = s.widthMm === Number(formValues.widthMm) && s.heightMm === Number(formValues.heightMm);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectRectSleeve(s)}
                    className={`p-2 rounded-lg border text-left text-[11px] transition-all flex flex-col justify-between ${
                      isCurrent
                        ? "bg-rose-950/90 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/50"
                        : isOver
                        ? "bg-slate-950/50 border-red-900/30 text-slate-500 hover:border-red-800/50"
                        : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="font-mono font-bold truncate">{s.widthMm}×{s.heightMm}</span>
                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <span className={isOver ? "text-red-400 font-bold" : fill > 50 ? "text-amber-400 font-medium" : "text-emerald-400"}>
                        {fill.toFixed(0)}%
                      </span>
                      {isOver ? (
                        <span className="text-red-400 text-[9px] font-mono">&gt; 60%</span>
                      ) : (
                        <span className="text-slate-500 text-[9px]">ок</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Shape Selector & Manual Dimensions */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Форма и точные размеры гильзы / проема:
          </span>
          <span className="text-xs font-mono text-rose-400 font-bold">
            {dimensionsText}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue("shape", "round")}
            className={`p-3 rounded-xl border text-left transition-all ${
              formValues.shape === "round"
                ? "bg-slate-800 text-white border-rose-500/40"
                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
            }`}
          >
            <strong className="block text-xs font-bold mb-0.5">Круглая гильза (труба)</strong>
            <span className="text-[11px] text-slate-400">Внутренний диаметр (мм)</span>
          </button>

          <button
            type="button"
            onClick={() => setValue("shape", "rect")}
            className={`p-3 rounded-xl border text-left transition-all ${
              formValues.shape === "rect"
                ? "bg-slate-800 text-white border-rose-500/40"
                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
            }`}
          >
            <strong className="block text-xs font-bold mb-0.5">Прямоугольный короб / проем</strong>
            <span className="text-[11px] text-slate-400">Ширина × Высота (мм)</span>
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
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                )}
              />
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
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                )}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Внутренний диаметр гильзы (просвет D_вн), мм
            </label>
            <Controller
              control={control}
              name="diameterMm"
              render={({ field }) => (
                <input
                  type="number"
                  min="30"
                  max="2000"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              )}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Текущий выбор: {currentSleeveSpec}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
