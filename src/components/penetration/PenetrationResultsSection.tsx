"use client";

import React from "react";
import {
  Flame,
  AlertTriangle,
  Check,
  Copy,
  Printer,
  PlusCircle,
} from "lucide-react";
import { FormulaTooltip } from "./FormulaTooltip";
import { PenetrationCalculatorReturn } from "./usePenetrationCalculator";

interface PenetrationResultsSectionProps {
  calc: PenetrationCalculatorReturn;
}

export function PenetrationResultsSection({ calc }: PenetrationResultsSectionProps) {
  const {
    formValues,
    result,
    currentSleeveSpec,
    coatingLossFactor,
    cuttingLossFactor,
    woolLossFactor,
    sleeveTag,
    positionTitle,
    setPositionTitle,
    copied,
    addedToast,
    handleCopy,
    handlePrint,
    handleAddPosition,
  } = calc;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <Flame className="w-4 h-4 mr-2 text-rose-500" />
            Потребность в материалах ОЗС
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {currentSleeveSpec}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/40 text-[10px] font-mono text-rose-300 font-bold">
          EI 120
        </span>
      </div>

      {/* Results Output */}
      <div className="space-y-5">
        {/* Multiplier notification banner */}
        {result.count > 1 && (
          <div className="p-3 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300">
                Расчет для {result.count} одинаковых проходок ({sleeveTag})
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              × {result.count} шт.
            </span>
          </div>
        )}

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
            <span>Сечение комун. = {(result.penetrantsAreaMm2 / result.count).toFixed(0)} мм² ({(result.penetrantsAreaMm2 / (result.count * 100)).toFixed(1)} см²)</span>
            <span>Лимит по регламенту: ≤ 60%</span>
          </div>

          {/* Opening Area Detailed Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/70">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="text-slate-400 font-medium">Просвет 1 проема (S):</span>
              <span className="font-mono font-bold text-white">
                {result.singlePenetration.openingAreaM2} м²{" "}
                <span className="text-slate-400 font-normal">
                  ({result.singlePenetration.openingAreaCm2} см² / {result.singlePenetration.openingAreaMm2} мм²)
                </span>
              </span>
            </div>
            {result.count > 1 && (
              <div className="flex justify-between items-center text-xs text-emerald-300">
                <span className="font-medium text-emerald-400">Суммарный просвет ({result.count} шт.):</span>
                <span className="font-mono font-bold text-emerald-300">
                  {result.openingAreaM2} м²{" "}
                  <span className="text-emerald-500/80 font-normal">
                    ({result.openingAreaCm2} см² / {result.openingAreaMm2} мм²)
                  </span>
                </span>
              </div>
            )}
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
                <div className="flex items-center">
                  <span className="text-xs font-bold text-white block">
                    FLAMMOTECT-A coating (краска)
                  </span>
                  <FormulaTooltip
                    title="FLAMMOTECT-A coating (краска)"
                    formula="M = S_проема × 6.48 кг/м² × K_потерь"
                    calculation={
                      result.count > 1
                        ? `На 1 шт: ${result.singlePenetration.openingAreaM2} м² × 6.48 × ${coatingLossFactor} = ${result.singlePenetration.coatingMassKg} кг\nВсего (${result.count} шт): ${result.singlePenetration.coatingMassKg} × ${result.count} = ${result.coatingMassKg} кг (${result.coatingBucketsCount} вёдер)`
                        : `${result.openingAreaM2} м² × 6.48 × ${coatingLossFactor} = ${result.coatingMassKg} кг (${result.coatingBucketsCount} вёдер)`
                    }
                    notes={`Базовая норма 6.48 кг/м² включает двухстороннюю окраску плит, торцов, кабелей и канта стены 20 мм. Коэффициент потерь при нанесении: ${coatingLossFactor}.`}
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Базовая норма 6,48 кг/м² + потери
                </span>
                {result.count > 1 && (
                  <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">
                    На 1 шт: {result.singlePenetration.coatingMassKg} кг ({result.singlePenetration.coatingBucketsCount} вед.)
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-rose-400 font-mono">
                  {result.coatingMassKg} кг
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  ({result.coatingBucketsCount} вёдер по 12.5 кг){result.count > 1 ? ` • на ${result.count} шт.` : ""}
                </span>
              </div>
            </div>

            {/* FLAMMOTECT-A filler */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="text-xs font-bold text-white block">
                    FLAMMOTECT-A filler (шпаклевка)
                  </span>
                  <FormulaTooltip
                    title="FLAMMOTECT-A filler (шпаклевка)"
                    formula="M = S_проема × 5.00 кг/м² × K_потерь"
                    calculation={
                      result.count > 1
                        ? `На 1 шт: ${result.singlePenetration.openingAreaM2} м² × 5.00 × ${coatingLossFactor} = ${result.singlePenetration.fillerMassKg} кг\nВсего (${result.count} шт): ${result.singlePenetration.fillerMassKg} × ${result.count} = ${result.fillerMassKg} кг (${result.fillerBucketsCount} вёдер)`
                        : `${result.openingAreaM2} м² × 5.00 × ${coatingLossFactor} = ${result.fillerMassKg} кг (${result.fillerBucketsCount} вёдер)`
                    }
                    notes={`Базовая норма 5.00 кг/м² на заделку швов между плитами, щелей вокруг кабелей и склейку стыков. Коэффициент потерь: ${coatingLossFactor}.`}
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Базовая норма 5,0 кг/м² для швов и стыков
                </span>
                {result.count > 1 && (
                  <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">
                    На 1 шт: {result.singlePenetration.fillerMassKg} кг ({result.singlePenetration.fillerBucketsCount} вед.)
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white font-mono">
                  {result.fillerMassKg} кг
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  ({result.fillerBucketsCount} вёдер по 12.5 кг){result.count > 1 ? ` • на ${result.count} шт.` : ""}
                </span>
              </div>
            </div>

            {/* Mineral wool boards */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="text-xs font-bold text-white block">
                    Минплита 150 кг/м³ (толщина 60 мм)
                  </span>
                  <FormulaTooltip
                    title="Минераловатная плита 150 кг/м³"
                    formula="S_плит = S_проема × 2.0 м²/м² × K_раскроя"
                    calculation={
                      result.count > 1
                        ? `На 1 шт: ${result.singlePenetration.openingAreaM2} м² × 2.0 × ${cuttingLossFactor} = ${result.singlePenetration.boardAreaM2} м²\nВсего (${result.count} шт): ${result.singlePenetration.boardAreaM2} × ${result.count} = ${result.boardAreaM2} м²`
                        : `${result.openingAreaM2} м² × 2.0 × ${cuttingLossFactor} = ${result.boardAreaM2} м²`
                    }
                    notes={`Система Double layer (EI 120, толщина уплотнения 120 мм) состоит из 2 слоев плит по 60 мм. Базовая норма 2.0 м² плиты на 1 м² проходки. Запас на раскрой: ${formValues.includeCuttingLosses ? "+30%" : "0%"}.`}
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  2 слоя (общая толщина 120 мм, EI 120)
                </span>
                {result.count > 1 && (
                  <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">
                    На 1 шт: {result.singlePenetration.boardAreaM2} м²
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-amber-400 font-mono">
                  {result.boardAreaM2} м²
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  (2 слоя плит){result.count > 1 ? ` • на ${result.count} шт.` : ""}
                </span>
              </div>
            </div>

            {/* Loose mineral wool */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="text-xs font-bold text-white block">
                    Рассыпная базальтовая минвата
                  </span>
                  <FormulaTooltip
                    title="Рассыпная базальтовая минвата"
                    formula="M = S_проема × 1.52 кг/м² × K_уплотнения"
                    calculation={
                      result.count > 1
                        ? `На 1 шт: ${result.singlePenetration.openingAreaM2} м² × 1.52 × ${woolLossFactor} = ${result.singlePenetration.looseWoolMassKg} кг\nВсего (${result.count} шт): ${result.singlePenetration.looseWoolMassKg} × ${result.count} = ${result.looseWoolMassKg} кг`
                        : `${result.openingAreaM2} м² × 1.52 × ${woolLossFactor} = ${result.looseWoolMassKg} кг`
                    }
                    notes={`Базовая норма 1.52 кг/м² для плотной набивки полостей и зазоров вокруг кабелей по Таблице 10 Регламента. Запас на уплотнение: ${formValues.includeCuttingLosses ? "+30%" : "0%"}.`}
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {result.isRoundSleeve ? `Заполнение гильзы (норма 1,52 кг/м²)` : `Набивка зазоров и пустот (1,52 кг/м²)`}
                </span>
                {result.count > 1 && (
                  <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">
                    На 1 шт: {result.singlePenetration.looseWoolMassKg} кг
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-slate-200 font-mono">
                  {result.looseWoolMassKg} кг
                </span>
                {result.looseWoolMassKg < 0.1 && (
                  <span className="text-[10px] text-slate-500 block font-mono">
                    ({(result.looseWoolMassKg * 1000).toFixed(1)} г)
                  </span>
                )}
                {result.count > 1 && (
                  <span className="text-[11px] text-slate-500 block font-mono">
                    на {result.count} шт.
                  </span>
                )}
              </div>
            </div>

            {/* DG-CR BS wrap (if plastic pipes present) */}
            {result.dgCrBsMeters > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="text-xs font-bold text-rose-300 block">
                      Обмотка PYRO-SAFE DG-CR BS
                    </span>
                    <FormulaTooltip
                      title="Огнезащитная обмотка DG-CR BS"
                      formula="L = ∑ (π × (d/1000) × n_слоев + 0.05) × n_обмоток"
                      calculation={
                        result.count > 1
                          ? `На 1 шт: ${result.singlePenetration.dgCrBsMeters} м\nВсего (${result.count} шт): ${result.dgCrBsMeters} м`
                          : `∑ (3.1416 × d × слои × ${formValues.isFloorPenetration ? "1" : "2"}) = ${result.dgCrBsMeters} м`
                      }
                      notes={`Ширина 100 мм для пластиковых труб (Таблицы 13–14). Стены: 2 обмотки с обеих сторон; перекрытия: 1 обмотка снизу. Вспучивание в 15.5–22 раза.`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Ширина 100 мм для пластиковых труб
                  </span>
                  {result.count > 1 && (
                    <span className="text-[11px] text-emerald-400 block font-mono mt-0.5">
                      На 1 шт: {result.singlePenetration.dgCrBsMeters} м
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-rose-300 font-mono">
                    {result.dgCrBsMeters} м
                  </span>
                  {result.count > 1 && (
                    <span className="text-[11px] text-slate-500 block font-mono">
                      на {result.count} шт.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quality control tips */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">
                Контроль качества монтажа (п. 5.1):
              </span>
              <div>
                • {result.count > 1 ? `Рекомендуется ${result.singlePenetration.measurementsCount} контрольных замера на 1 проходку (всего ${result.measurementsCount} замеров на ${result.count} шт.)` : `Обязательно провести ${result.measurementsCount} контрольных замера толщины на данной проходке`}.
              </div>
              <div>• Световой тест фонарем с обратной стороны — отсутствие щелей.</div>
              <div>• Межслойная сушка: ≥ 8 часов. Полная полимеризация: 4 суток.</div>
            </div>
          </div>
        )}
      </div>

      {/* General Actions */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <input
          type="text"
          placeholder={`Наименование позиции в проекте (по умолч.: ${sleeveTag})`}
          value={positionTitle}
          onChange={(e) => setPositionTitle(e.target.value)}
          disabled={result.isBlocked}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500 placeholder-slate-600 transition-colors disabled:opacity-50"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={result.isBlocked}
            className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Копировать текстовый расчет ОЗС"
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
            onClick={handlePrint}
            disabled={result.isBlocked}
            className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Печать спецификации ОЗС"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Печать
          </button>

          <button
            type="button"
            onClick={handleAddPosition}
            disabled={result.isBlocked}
            className="w-full inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer transition-all shadow-lg shadow-rose-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            В проект
          </button>
        </div>

        {addedToast && (
          <p className="text-center text-xs text-rose-400 font-medium animate-pulse">
            ✓ Позиция {sleeveTag} добавлена в спецификацию проекта!
          </p>
        )}
      </div>
    </div>
  );
}

