"use client";

import React from "react";
import {
  BookOpen,
  ShieldCheck,
  Flame,
  Droplets,
  AlertTriangle,
} from "lucide-react";

export function TechnicalReference() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-bold text-white">
            Инженерно-технический регламент «svt Brandschutz»
          </h2>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl">
          Справочные данные, физико-химические свойства огнезащитных составов PYRO-SAFE®, требования стандартов EN 1366-3, ДСТУ и правила монтажа.
        </p>
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FLAMMOPLAST KS 1 */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-orange-400 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2" />
              FLAMMOPLAST KS 1
            </h3>
            <span className="text-xs font-mono bg-orange-950 text-orange-300 px-2 py-0.5 rounded border border-orange-800/40">
              Покрытие
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Водно-дисперсионное вспучивающееся огнезащитное покрытие белого цвета для кабелей и кабельных проходок. При пожаре образует прочный пенококсовый термоизолирующий слой.
          </p>
          <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Норма расхода (сухой слой 0,72 мм):</span>
              <strong className="text-white font-mono">1,73 кг/м²</strong>
            </div>
            <div className="flex justify-between">
              <span>Плотность состава:</span>
              <strong className="text-white font-mono">1,34 ± 0,05 г/см³</strong>
            </div>
            <div className="flex justify-between">
              <span>Стандартная фасовка:</span>
              <strong className="text-white font-mono">Пластиковые вёдра по 12,5 кг</strong>
            </div>
            <div className="flex justify-between">
              <span>Температура нанесения:</span>
              <strong className="text-white font-mono">от +5°C до +50°C</strong>
            </div>
            <div className="flex justify-between">
              <span>Инструмент:</span>
              <strong className="text-white">Кисть, валик, аппарат безвоздушного распыления</strong>
            </div>
          </div>
        </div>

        {/* PYRO-SAFE UNIVERSALSCHOTT */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-red-400 flex items-center">
              <Flame className="w-5 h-5 mr-2" />
              Система UNIVERSALSCHOTT
            </h3>
            <span className="text-xs font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/40">
              EN 1366-3
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Комбинированная система кабельной проходки на основе минераловатных плит высокой плотности, вспучивающегося покрытия FLAMMOPLAST KS 1 и шовной абляционной мастики KS 3.
          </p>
          <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Предел огнестойкости EI 60:</span>
              <strong className="text-white">1 слой плиты 50 мм + KS 1 (1.65 кг/м²)</strong>
            </div>
            <div className="flex justify-between">
              <span>Предел огнестойкости EI 180:</span>
              <strong className="text-white">2 слоя плиты 50 мм + KS 1 (2.50 кг/м²)</strong>
            </div>
            <div className="flex justify-between">
              <span>Плотность минераловатных плит:</span>
              <strong className="text-white font-mono">&ge; 150 кг/м³</strong>
            </div>
            <div className="flex justify-between">
              <span>Температура плавления базальта:</span>
              <strong className="text-white font-mono">&gt; 1000 °C</strong>
            </div>
            <div className="flex justify-between">
              <span>Потери при распылении:</span>
              <strong className="text-white font-mono">+30% (кисть/валик: +10%)</strong>
            </div>
          </div>
        </div>

        {/* PYRO-SAFE KS 3 */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-400 flex items-center">
              <Flame className="w-5 h-5 mr-2" />
              PYRO-SAFE KS 3 (Мастика)
            </h3>
            <span className="text-xs font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
              Мастика
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Густая абляционная мастика / шпатлевка для герметизации зазоров между плитой и строительной конструкцией, а также заполнения пустот в пучках кабелей.
          </p>
          <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Норма на 1 м² проема (EI 60):</span>
              <strong className="text-white font-mono">3,5 кг/м²</strong>
            </div>
            <div className="flex justify-between">
              <span>Норма на 1 м² проема (EI 180):</span>
              <strong className="text-white font-mono">5,0 кг/м²</strong>
            </div>
            <div className="flex justify-between">
              <span>Назначение:</span>
              <strong className="text-white">Заделка швов, стыков и межфазных зазоров</strong>
            </div>
          </div>
        </div>

        {/* PYRO-SAFE SP-2 */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-sky-400 flex items-center">
              <Droplets className="w-5 h-5 mr-2" />
              PYRO-SAFE SP-2 (Защитный лак)
            </h3>
            <span className="text-xs font-mono bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800/40">
              Гидрозащита
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Специальное защитное полиуретановое финишное покрытие для применения в условиях относительной влажности воздуха более 85%, неотапливаемых или сырых помещениях.
          </p>
          <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>Норма расхода:</span>
              <strong className="text-white font-mono">0,175 кг/м²</strong>
            </div>
            <div className="flex justify-between">
              <span>Критерий применения:</span>
              <strong className="text-white">Относительная влажность &gt; 85%</strong>
            </div>
            <div className="flex justify-between">
              <span>Нанесение:</span>
              <strong className="text-white">Поверх высохшего слоя KS 1</strong>
            </div>
          </div>
        </div>
      </div>

      {/* CRITICAL NORMATIVE RULE SECTION */}
      <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-800/60 space-y-3">
        <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Критическое нормативное требование к сечению кабелей (&le; 60%)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Согласно европейскому стандарту <strong>EN 1366-3</strong> и регламентам производителя <strong>svt Brandschutz</strong>, суммарная геометрическая площадь поперечного сечения всех кабелей в кабельной проходке не должна превышать <strong className="text-amber-300">60%</strong> от общей площади проема проходки.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Оставшиеся 40% и более необходимы для обеспечения плотного монтажа минераловатной плиты, нанесения проектного слоя мастики KS 3 между кабелями и эффективного теплоотвода при аварийных тепловых режимах. При превышении 60% проходка теряет свои огнестойкие свойства при реальном пожаре.
        </p>
      </div>
    </div>
  );
}
