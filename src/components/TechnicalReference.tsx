"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ShieldCheck,
  Flame,
  Droplets,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function TechnicalReference() {
  const [activeFamily, setActiveFamily] = useState<"flammotect" | "flammoplast">("flammotect");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-bold text-white">
            Инженерно-технические регламенты «svt Products» / «Спецзахист»
          </h2>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl">
          Справочные данные, физико-химические свойства составов PYRO-SAFE®, нормы расхода по официальным технологическим регламентам 2022 года (ТОВ «ІПВК «СПЕЦЗАХИСТ»), стандарты EN 1366-3 и ДСТУ EN 60332-3-21.
        </p>

        {/* Toggle between Product Families */}
        <div className="mt-5 flex space-x-2 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setActiveFamily("flammotect")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeFamily === "flammotect"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-md shadow-teal-950"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Система FLAMMOTECT (Регламенты 2022, АЭС/ТЭС)</span>
            <span className="px-1.5 py-0.2 rounded bg-teal-950 text-teal-400 text-[10px] font-mono border border-teal-800/50">
              Новое
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFamily("flammoplast")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeFamily === "flammoplast"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-md shadow-orange-950"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Система FLAMMOPLAST / UNIVERSALSCHOTT</span>
          </button>
        </div>
      </div>

      {/* FAMILY 1: FLAMMOTECT (2022 Reglaments) */}
      {activeFamily === "flammotect" && (
        <div className="space-y-6">
          <div className="border-l-2 border-teal-500 pl-4 py-1">
            <h3 className="text-lg font-bold text-white flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-teal-400" />
              Линейка PYRO-SAFE FLAMMOTECT (Абляционные эндотермические системы)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Регламенты ТОВ «ІПВК «СПЕЦЗАХИСТ» и svt Products GmbH (Запорожье, 2022).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FLAMMOTECT-A coating */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-teal-300 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-teal-400" />
                  FLAMMOTECT-A (coating)
                </h4>
                <span className="text-xs font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800/40">
                  Краска
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Тонкослойная абляционная краска пассивного эндотермического действия. При температуре свыше +200...+250 °C керамизуется с выделением связанной воды, создавая плотный микропористый барьер.
              </p>
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Контроль гребенкой:</span>
                  <strong className="text-teal-400 font-mono">0,9 мм мокрого = 0,5 мм сухого</strong>
                </div>
                <div className="flex justify-between">
                  <span>Базовый расход (0,5 мм):</span>
                  <strong className="text-white font-mono">1,26 кг/м² (1,0 мм: 2,52 кг/м²)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Плотность состава:</span>
                  <strong className="text-white font-mono">1,34 – 1,48 г/см³</strong>
                </div>
                <div className="flex justify-between">
                  <span>Коэффициент снижения токов:</span>
                  <strong className="text-emerald-400 font-mono">1,0 (без перегрева кабелей)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Защитный лак:</span>
                  <strong className="text-emerald-400">НЕ ТРЕБУЕТСЯ (стойкость 100% влаги)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Срок службы:</span>
                  <strong className="text-white font-mono">не менее 30 лет</strong>
                </div>
              </div>
            </div>

            {/* FLAMMOTECT Double Layer EI 120 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-rose-300 flex items-center">
                  <Flame className="w-5 h-5 mr-2 text-rose-400" />
                  Проходка Double layer (EI 120)
                </h4>
                <span className="text-xs font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800/40">
                  EI 120
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Двухслойная система уплотнения проходки кабелей, металлических и пластиковых труб через стены (≥ 100 мм) и перекрытия (≥ 150 мм). Сохраняет герметичность в условиях аварий АЭС.
              </p>
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>FLAMMOTECT-A coating на 1 м²:</span>
                  <strong className="text-white font-mono">6,48 кг/м² (+ потери)</strong>
                </div>
                <div className="flex justify-between">
                  <span>FLAMMOTECT-A filler на 1 м²:</span>
                  <strong className="text-white font-mono">5,00 кг/м² (+ потери)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Минплита 150 кг/м³:</span>
                  <strong className="text-white font-mono">2,00 м²/м² (2 слоя по 60 мм)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Рассыпная минвата:</span>
                  <strong className="text-white font-mono">1,52 кг/м²</strong>
                </div>
                <div className="flex justify-between">
                  <span>Макс. габарит проема:</span>
                  <strong className="text-white font-mono">до 1400 × 2000 мм</strong>
                </div>
              </div>
            </div>

            {/* FLAMMOTECT-A filler */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-teal-300 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-teal-400" />
                  FLAMMOTECT-A (filler)
                </h4>
                <span className="text-xs font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800/40">
                  Шпаклевка
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Эндотермическая шпаклевка без растворителей и галогенов. Применяется для заделки швов между минераловатными плитами, герметизации зазоров вокруг кабелей и труб, склейки стыков.
              </p>
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Время высыхания:</span>
                  <strong className="text-white font-mono">не более 36 часов (+20 °C)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Плотность состава:</span>
                  <strong className="text-white font-mono">1,34 – 1,48 г/см³</strong>
                </div>
                <div className="flex justify-between">
                  <span>Фасовка:</span>
                  <strong className="text-white font-mono">Ведра по 12,5 кг и 15,0 кг</strong>
                </div>
                <div className="flex justify-between">
                  <span>Разбавление:</span>
                  <strong className="text-white">Краской FLAMMOTECT-A coating</strong>
                </div>
              </div>
            </div>

            {/* PYRO-SAFE DG-CR BS & DG-CR 1.5 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-amber-300 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-amber-400" />
                  PYRO-SAFE DG-CR BS / DG-CR 1.5
                </h4>
                <span className="text-xs font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
                  Бандаж
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Огнезащитные рулонные стеклотканевые оболочки с терморасширяющимся внутренним полимерным слоем. При пожаре вспучиваются в 15,5–22 раза, пережимая пластиковые трубы и защищая кабельные вводы.
              </p>
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Коэффициент вспучивания:</span>
                  <strong className="text-amber-400 font-mono">в 15,5 – 22 раза (+550 °C)</strong>
                </div>
                <div className="flex justify-between">
                  <span>DG-CR BS для горючих труб:</span>
                  <strong className="text-white">Ширина 100 мм (1–4 слоя по Табл. 13)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Толщина полотна DG-CR 1.5:</span>
                  <strong className="text-white font-mono">1,5 мм (1530–1930 г/м²)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Фиксация:</span>
                  <strong className="text-white">Стальная бандажная лента / проволока</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAMILY 2: FLAMMOPLAST (Original Intumescent Systems) */}
      {activeFamily === "flammoplast" && (
        <div className="space-y-6">
          <div className="border-l-2 border-orange-500 pl-4 py-1">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Flame className="w-5 h-5 mr-2 text-orange-400" />
              Линейка PYRO-SAFE FLAMMOPLAST (Интумесцентные вспучивающиеся системы)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Классические европейские огнезащитные составы svt Brandschutz (Германия).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FLAMMOPLAST KS 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-orange-400 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  FLAMMOPLAST KS 1
                </h4>
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
              </div>
            </div>

            {/* UNIVERSALSCHOTT */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-red-400 flex items-center">
                  <Flame className="w-5 h-5 mr-2" />
                  Система UNIVERSALSCHOTT
                </h4>
                <span className="text-xs font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/40">
                  EN 1366-3
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Комбинированная система кабельной проходки на основе минераловатных плит высокой плотности, вспучивающегося покрытия FLAMMOPLAST KS 1 и шовной мастики KS 3.
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
              </div>
            </div>

            {/* PYRO-SAFE KS 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-amber-400 flex items-center">
                  <Flame className="w-5 h-5 mr-2" />
                  PYRO-SAFE KS 3 (Мастика)
                </h4>
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
              </div>
            </div>

            {/* PYRO-SAFE SP-2 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-sky-400 flex items-center">
                  <Droplets className="w-5 h-5 mr-2" />
                  PYRO-SAFE SP-2 (Защитный лак)
                </h4>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRITICAL NORMATIVE RULE SECTION */}
      <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-800/60 space-y-3">
        <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Критическое нормативное требование к сечению кабелей и труб (&le; 60%)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Согласно европейскому стандарту <strong>EN 1366-3</strong>, ДБН и официальным регламентам <strong>ТОВ «ІПВК «СПЕЦЗАХИСТ» (2022)</strong>, суммарная геометрическая площадь поперечного сечения всех проходящих коммуникаций не должна превышать <strong className="text-amber-300">60%</strong> от общей площади проема проходки.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Оставшиеся 40% и более технологически необходимы для обеспечения правильного монтажа двух слоев минераловатной плиты, нанесения проектного слоя шпатлевки filler / мастики KS 3 между кабелями и компенсации термических деформаций при пожаре.
        </p>
      </div>

      {/* QUALITY CONTROL REQUIREMENTS */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-teal-300 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>Требования к контролю качества работ на объекте (Раздел 5 Регламентов)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-300">
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <strong className="text-white block font-semibold">1. Контроль толщины</strong>
            <p className="text-slate-400 text-[11px]">
              Не менее 2 замеров толщины на каждый 1 м² проходки и замер каждые 15–20 м кабельной трассы штангенциркулем / толщиномером.
            </p>
          </div>
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <strong className="text-white block font-semibold">2. Мокрый слой (WFT)</strong>
            <p className="text-slate-400 text-[11px]">
              Замер измерительной гребенкой в процессе нанесения. 0,9 мм мокрого слоя дает ровно 0,5 мм сухого проектного покрытия.
            </p>
          </div>
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <strong className="text-white block font-semibold">3. Световой контроль</strong>
            <p className="text-slate-400 text-[11px]">
              Просвечивание проходки мощным фонарем с обратной стороны перекрытия/стены: наличие щелей и зазоров строго не допускается.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
