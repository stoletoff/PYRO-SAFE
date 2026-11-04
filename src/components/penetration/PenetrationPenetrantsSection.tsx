"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Plus, Trash2, Search } from "lucide-react";
import { PenetrationCalculatorReturn } from "./usePenetrationCalculator";

interface PenetrationPenetrantsSectionProps {
  calc: PenetrationCalculatorReturn;
}

export function PenetrationPenetrantsSection({ calc }: PenetrationPenetrantsSectionProps) {
  const {
    control,
    formValues,
    fields,
    remove,
    selectedFilter,
    setSelectedFilter,
    cableSearch,
    setCableSearch,
    filteredCables,
    handleAddCableSpec,
    handleAddCustomPenetrant,
  } = calc;

  return (
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
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-rose-500"
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
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-rose-500"
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
                <option value="sprayer_30">Распылитель ВД / запас +30% (по умолчанию)</option>
                <option value="brush_10">Кисть / шпатель (+10% потерь)</option>
                <option value="brush_5">Кисть / шпатель (+5% потерь)</option>
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
  );
}
