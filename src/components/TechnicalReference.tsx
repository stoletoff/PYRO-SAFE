"use client";

import React from "react";
import {
  BookOpen,
  ShieldCheck,
  Flame,
  Sparkles,
  CheckCircle2,
  Wrench,
} from "lucide-react";

export function TechnicalReference() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-bold text-white">
            Инженерно-технический регламент «PYRO-SAFE FLAMMOTECT»
          </h2>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl">
          Справочные данные, физико-химические свойства абляционных составов FLAMMOTECT-A, нормы расхода по официальным технологическим регламентам 2022 года (ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH), стандарты EN 1366-3 и ДСТУ EN 60332-3-21.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-teal-950 text-teal-300 border border-teal-800/40">
            Огнезащита кабелей: FLAMMOTECT-A
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/40">
            Проходки и гильзы: Double Layer EI 120
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Регламент 2022 (svt / Спецзахист)
          </span>
        </div>
      </div>

      {/* Materials Cards Grid */}
      <div className="space-y-6">
        <div className="border-l-2 border-teal-500 pl-4 py-1">
          <h3 className="text-lg font-bold text-white flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-teal-400" />
            Линейка PYRO-SAFE FLAMMOTECT (Абляционные эндотермические системы)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Пассивные огнезащитные системы для объектов с повышенными требованиями (АЭС, ТЭС, высотное строительство).
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
              Тонкослойная абляционная краска пассивного эндотермического действия. При температуре свыше +200...+250 °C керамизуется с выделением связанной воды, создавая плотный микропористый теплозащитный барьер. Стойка к 100% влажности (не требует защитного лака).
            </p>
            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>Контроль гребенкой:</span>
                <strong className="text-teal-400 font-mono">0,9 мм мокрого = 0,5 мм сухого</strong>
              </div>
              <div className="flex justify-between">
                <span>Базовый расход на кабели (0,5 мм):</span>
                <strong className="text-white font-mono">1,26 кг/м² (1,0 мм: 2,52 кг/м²)</strong>
              </div>
              <div className="flex justify-between">
                <span>Норма на 1 м² проходки:</span>
                <strong className="text-white font-mono">6,48 кг/м² (п. 3.1 Регламента)</strong>
              </div>
              <div className="flex justify-between">
                <span>Плотность состава:</span>
                <strong className="text-white font-mono">1,34 – 1,48 г/см³</strong>
              </div>
              <div className="flex justify-between">
                <span>Срок службы покрытия:</span>
                <strong className="text-emerald-400 font-mono">не менее 30 лет</strong>
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
              Двухслойная система уплотнения проходки кабелей, металлических и пластиковых труб через стены (≥ 100 мм) и перекрытия (≥ 150 мм). Сохраняет целостность (E) и теплоизолирующую способность (I) в течение 120 минут.
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
                <strong className="text-white font-mono">1,52 кг/м² (заделка пустот)</strong>
              </div>
              <div className="flex justify-between">
                <span>Максимальное заполнение:</span>
                <strong className="text-amber-400 font-mono">не более 60% проема</strong>
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
              Эндотермическая шпаклевка без растворителей и галогенов. Применяется для заделки швов между минераловатными плитами, герметизации зазоров вокруг кабелей и труб, склейки стыков и создания торцевых пробок в трубных гильзах.
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
                <strong className="text-white font-mono">Пластиковые ведра по 12,5 кг</strong>
              </div>
              <div className="flex justify-between">
                <span>Расход на 1 м² проходки:</span>
                <strong className="text-white font-mono">5,00 кг/м² (п. 3.1 Регламента)</strong>
              </div>
            </div>
          </div>

          {/* PYRO-SAFE DG-CR BS */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-amber-300 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-amber-400" />
                PYRO-SAFE DG-CR BS
              </h4>
              <span className="text-xs font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
                Бандаж
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Огнезащитная рулонная стеклотканевая оболочка с терморасширяющимся полимерным слоем. При пожаре вспучивается в 15,5–22 раза, пережимая горючие пластиковые трубы и предотвращая сквозной прорыв пламени.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>Коэффициент вспучивания:</span>
                <strong className="text-amber-400 font-mono">в 15,5 – 22 раза (+550 °C)</strong>
              </div>
              <div className="flex justify-between">
                <span>Ширина ленты:</span>
                <strong className="text-white font-mono">100 мм</strong>
              </div>
              <div className="flex justify-between">
                <span>Стены / перегородки:</span>
                <strong className="text-white">2 обмотки (с обеих сторон)</strong>
              </div>
              <div className="flex justify-between">
                <span>Перекрытия (пол/потолок):</span>
                <strong className="text-white">1 обмотка снизу</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Guidelines & Standards */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400 font-bold">
            <Wrench className="w-5 h-5" />
            <h4 className="text-base text-white">
              Нормативные требования к гильзам и выполнению огнезащитной заделки (ОЗС)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">
                1. Требования к стальным гильзам и проемам:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Применение стальных труб по действующим европейским стандартам Украины (<strong>ДСТУ EN 10255</strong> или <strong>ДСТУ EN 10217-1</strong> взамен недействующего ГОСТ 10704).</li>
                <li>Антикоррозийная защита наружной и внутренней поверхности гильзы грунтом за 2 раза.</li>
                <li>Торцы труб должны быть зачищены от заусенцев и острых кромок во избежание повреждения кабелей.</li>
                <li>Соблюдение проектных выступов: ПУЭ 2.1.58 (+50 мм выше чистого пола в перекрытиях для защиты от воды; по +20 мм в стенах под отделку).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 block uppercase tracking-wider text-[11px]">
                2. Огнезащитная заделка (FLAMMOTECT Double Layer EI 120):
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Коэффициент заполнения просвета гильзы кабелями строго не более <strong>60%</strong> по Регламенту и ПУЭ.</li>
                <li>Установка 2-х слоев жестких минераловатных плит толщиной по 60 мм (суммарно 120 мм) заподлицо с поверхностями преграды.</li>
                <li>Плотная набивка полостей и зазоров вокруг кабелей базальтовой ватой и герметизация швов шпаклевкой FLAMMOTECT-A filler.</li>
                <li>Окраска наружных поверхностей плит и кабелей огнезащитным составом FLAMMOTECT-A coating (длина защитного слоя кабелей 500 мм).</li>
              </ul>
            </div>
          </div>

          {/* Exact normative regulation clauses */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Нормативные пункты расчета и расхода по Регламентам (ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt, 2022 г.):</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-850">
                <strong className="text-rose-400 block font-mono">
                  Проходки «Double Layer» (EI 120):
                </strong>
                <ul className="space-y-1 text-slate-400">
                  <li>
                    <strong className="text-slate-200 font-mono">п. 1.3, п. 2.1</strong> — суммарное сечение кабелей и труб в проеме не должно превышать <strong>60%</strong> площади проходки.
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 3.1</strong> — базовые нормы расхода на 1 м² проходки:
                    <span className="text-white block font-mono pl-2">
                      • Минплита 150 кг/м³ (2×60 мм): 2,0 м²<br />
                      • FLAMMOTECT-A coating (краска): 6,48 кг<br />
                      • FLAMMOTECT-A filler (шпаклевка): 5,0 кг<br />
                      • Минвата базальтовая (набивка): 1,52 кг
                    </span>
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 3.1</strong> — потери: кисть/шпатель +5...10%, безвоздушное распыление до +30%; раскрой плит и уплотнение ваты до +30%.
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 3.2</strong> — расчет потребности во всех материалах проходки выполняется на основании удельных норм п. 3.1.
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 4.6, Табл. 12</strong> — окраска кабелей составом FLAMMOTECT-A (сухой слой ≥ 2,0 мм) на длину 500 мм от проходки.
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">Таблицы 3, 5, 9, 10</strong> — защита полимерных горючих труб терморасширяющимся бандажом DG-CR BS.
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-850">
                <strong className="text-teal-400 block font-mono">
                  Огнезащита кабелей «FLAMMOTECT-A»:
                </strong>
                <ul className="space-y-1 text-slate-400">
                  <li>
                    <strong className="text-slate-200 font-mono">п. 3.1</strong> — удельный расход краски: 1,26 кг/м² при DFT 0,5 мм (2,52 кг/м² при DFT 1,0 мм).
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 3.2.1</strong> — лоток/короб с глухим дном: S = L × b × 1,5 × N_полок (для сетчатого: × 2 сторон).
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 3.2.2</strong> — одиночный кабель: S = L × π × d.
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 3.2.3</strong> — кабели в пучке: S = L × π × D × 1,5 (коэф. развитой поверхности пучка 1,5).
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 4.9</strong> — защитный лак не требуется (100% стойкость к влаге, циклам заморозки и УФ).
                  </li>
                  <li>
                    <strong className="text-slate-200 font-mono">п. 5.1, 5.2</strong> — контроль гребенкой WFT 0,9 мм = DFT 0,5 мм; замеры каждые 15–20 м (не менее 10 точек).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
