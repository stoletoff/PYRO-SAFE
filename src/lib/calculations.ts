/**
 * Бизнес-логика инженерного калькулятора огнезащитных материалов «svt Brandschutz» / PYRO-SAFE.
 * Чистые математические функции, независимые от интерфейса пользователя.
 */

// ==========================================
// КОНСТАНТЫ И НОРМАТИВНЫЕ ПОКАЗАТЕЛИ
// ==========================================

export const CONSTANTS = {
  // FLAMMOPLAST KS 1: норма расхода при толщине сухого слоя 0.72 мм (технологические потери включены)
  KS1_CABLE_COVERAGE_RATE_KG_M2: 1.73,
  // Емкость стандартного ведра FLAMMOPLAST KS 1 (кг)
  KS1_BUCKET_WEIGHT_KG: 12.5,
  // Защитный лак PYRO-SAFE SP-2: норма расхода при влажности > 85% (кг/м²)
  SP2_COVERAGE_RATE_KG_M2: 0.175,
  // Максимально допустимый процент заполнения кабельной проходки по стандарту UNIVERSALSCHOTT (60%)
  MAX_PENETRATION_FILL_RATIO_PERCENT: 60.0,
} as const;

// Коэффициенты технологических потерь для KS 1 при кабельных проходках
export const APPLICATION_LOSS_FACTORS = {
  brush: 1.10, // Кисть / валик: +10%
  sprayer: 1.30, // Распылитель: +30%
} as const;

export type ApplicationMethod = keyof typeof APPLICATION_LOSS_FACTORS;

// Базовые нормы расхода материалов на 1 м² проема кабельной проходки UNIVERSALSCHOTT
export const PENETRATION_EI_NORMS = {
  EI60: {
    label: "EI 60 (60 минут)",
    boardLayers: 1,
    boardAreaPerM2: 1.0, // м² минплиты на 1 м² проема
    ks1BaseKgPerM2: 1.65, // кг KS 1 на 1 м² проема (без учета способа нанесения)
    ks3KgPerM2: 3.5, // кг мастики KS 3 на 1 м² проема
    mineralWoolKgPerM2: 1.0, // кг рассыпной минваты на 1 м² проема
  },
  EI180: {
    label: "EI 180 (180 минут)",
    boardLayers: 2,
    boardAreaPerM2: 2.0, // м² минплиты на 1 м² проема (2 слоя)
    ks1BaseKgPerM2: 2.5, // кг KS 1 на 1 м² проема (без учета способа нанесения)
    ks3KgPerM2: 5.0, // кг мастики KS 3 на 1 м² проема
    mineralWoolKgPerM2: 1.5, // кг рассыпной минваты на 1 м² проема
  },
} as const;

export type FireResistanceRating = keyof typeof PENETRATION_EI_NORMS;

// ==========================================
// МОДУЛЬ 1: ОГНЕЗАЩИТА КАБЕЛЬНЫХ ЛИНИЙ (FLAMMOPLAST KS 1)
// ==========================================

export type CableInstallationType =
  | "single" // Одиночный кабель
  | "bundle" // Кабели в пучке
  | "tray_solid" // Лоток с глухим дном
  | "tray_mesh"; // Сетчатый лоток

export interface CableLineInput {
  installationType: CableInstallationType;
  /** Длина кабельной трассы (L) в метрах */
  lengthM: number;
  /** Внешний диаметр кабеля или пучка (d), либо ширина лотка (b) в миллиметрах */
  dimensionMm: number;
  /** Количество кабелей (для одиночной прокладки; для остальных типов игнорируется или = 1) */
  cableCount?: number;
  /** Признак влажности в помещении более 85% */
  humidityGt85: boolean;
}

export interface CableLineResult {
  /** Расчетная площадь защищаемой поверхности (м²) */
  areaM2: number;
  /** Масса огнезащитного покрытия FLAMMOPLAST KS 1 (кг) */
  ks1MassKg: number;
  /** Количество целых вёдер FLAMMOPLAST KS 1 (по 12.5 кг) */
  ks1BucketsCount: number;
  /** Масса защитного лака PYRO-SAFE SP-2 (кг) */
  sp2MassKg: number;
  /** Текстовая расшифровка формулы для инженерного отчета */
  formulaExplanation: string;
}

/**
 * Расчет расхода огнезащитных материалов для кабельных линий
 */
export function calculateCableLine(input: CableLineInput): CableLineResult {
  const { installationType, lengthM, dimensionMm, cableCount = 1, humidityGt85 } = input;

  if (lengthM <= 0 || dimensionMm <= 0) {
    return {
      areaM2: 0,
      ks1MassKg: 0,
      ks1BucketsCount: 0,
      sp2MassKg: 0,
      formulaExplanation: "Некорректные входные данные (длина или диаметр <= 0).",
    };
  }

  // Перевод размера из мм в метры
  const dimensionM = dimensionMm / 1000;
  const count = Math.max(1, cableCount);

  let areaM2 = 0;
  let formulaExplanation = "";

  switch (installationType) {
    case "single": {
      // S = L * π * d * N
      areaM2 = lengthM * Math.PI * dimensionM * count;
      formulaExplanation = `S = L × π × d × N = ${lengthM} м × 3.1416 × ${dimensionM.toFixed(4)} м × ${count} шт.`;
      break;
    }
    case "bundle": {
      // S = L * π * d * 1.5
      areaM2 = lengthM * Math.PI * dimensionM * 1.5;
      formulaExplanation = `S = L × π × d × 1.5 = ${lengthM} м × 3.1416 × ${dimensionM.toFixed(4)} м × 1.5 (коэф. пучка)`;
      break;
    }
    case "tray_solid": {
      // S = L * b * 1.5
      areaM2 = lengthM * dimensionM * 1.5;
      formulaExplanation = `S = L × b × 1.5 = ${lengthM} м × ${dimensionM.toFixed(3)} м × 1.5 (периметр лотка с глухим дном)`;
      break;
    }
    case "tray_mesh": {
      // S = L * b * 1.5 * 2
      areaM2 = lengthM * dimensionM * 1.5 * 2;
      formulaExplanation = `S = L × b × 1.5 × 2 = ${lengthM} м × ${dimensionM.toFixed(3)} м × 1.5 × 2 (двусторонняя обработка сетчатого лотка)`;
      break;
    }
  }

  // Расход KS 1: 1.73 кг/м²
  const ks1MassKg = areaM2 * CONSTANTS.KS1_CABLE_COVERAGE_RATE_KG_M2;

  // Округление количества ведер до целого в большую сторону
  const ks1BucketsCount = Math.ceil(ks1MassKg / CONSTANTS.KS1_BUCKET_WEIGHT_KG);

  // Расход SP-2: 0.175 кг/м² только при влажности > 85%
  const sp2MassKg = humidityGt85 ? areaM2 * CONSTANTS.SP2_COVERAGE_RATE_KG_M2 : 0;

  return {
    areaM2: roundTo(areaM2, 3),
    ks1MassKg: roundTo(ks1MassKg, 2),
    ks1BucketsCount,
    sp2MassKg: roundTo(sp2MassKg, 2),
    formulaExplanation,
  };
}

// ==========================================
// МОДУЛЬ 2: КАБЕЛЬНЫЕ ПРОХОДКИ (UNIVERSALSCHOTT)
// ==========================================

export type PenetrationShape = "rect" | "round";

export interface CableItem {
  id: string;
  name?: string;
  /** Внешний диаметр кабеля (мм) */
  diameterMm: number;
  /** Количество кабелей данного типа */
  count: number;
}

export interface PenetrationInput {
  shape: PenetrationShape;
  /** Высота проема (мм) для прямоугольного */
  heightMm?: number;
  /** Ширина проема (мм) для прямоугольного */
  widthMm?: number;
  /** Диаметр проема (мм) для круглого */
  diameterMm?: number;
  /** Список проходящих кабелей */
  cables: CableItem[];
  /** Предел огнестойкости (EI 60 или EI 180) */
  fireResistance: FireResistanceRating;
  /** Способ нанесения KS 1 */
  applicationMethod: ApplicationMethod;
  /** Помещение с влажностью > 85% */
  humidityGt85: boolean;
}

export interface PenetrationResult {
  /** Площадь проема (м²) */
  openingAreaM2: number;
  /** Площадь проема (мм²) */
  openingAreaMm2: number;
  /** Суммарная площадь сечения всех кабелей (мм²) */
  cablesAreaMm2: number;
  /** Фактический процент заполнения проема кабелями (%) */
  fillRatioPercent: number;
  /** Заблокирован ли расчет из-за превышения 60% */
  isBlocked: boolean;
  /** Текст ошибки валидации (если есть) */
  validationError?: string;
  /** Количество слоев минераловатных плит */
  boardLayers: number;
  /** Площадь минераловатной плиты (м²) */
  boardAreaM2: number;
  /** Масса рассыпной базальтовой минваты для плотной заделки (кг) */
  mineralWoolMassKg: number;
  /** Масса огнезащитного покрытия FLAMMOPLAST KS 1 (кг) */
  ks1MassKg: number;
  /** Количество ведер KS 1 по 12.5 кг */
  ks1BucketsCount: number;
  /** Масса абляционной мастики PYRO-SAFE KS 3 (кг) */
  ks3MassKg: number;
  /** Масса финишного защитного лака PYRO-SAFE SP-2 (кг) */
  sp2MassKg: number;
  /** Коэффициент технологических потерь KS 1 */
  applicationLossFactor: number;
}

/**
 * Расчет расхода материалов для кабельной проходки UNIVERSALSCHOTT с критической проверкой 60%
 */
export function calculatePenetration(input: PenetrationInput): PenetrationResult {
  const {
    shape,
    heightMm = 0,
    widthMm = 0,
    diameterMm = 0,
    cables,
    fireResistance,
    applicationMethod,
    humidityGt85,
  } = input;

  // 1. Расчет площади проема
  let openingAreaMm2 = 0;
  if (shape === "rect") {
    openingAreaMm2 = Math.max(0, heightMm) * Math.max(0, widthMm);
  } else {
    const radius = Math.max(0, diameterMm) / 2;
    openingAreaMm2 = Math.PI * Math.pow(radius, 2);
  }
  const openingAreaM2 = openingAreaMm2 / 1_000_000;

  // 2. Расчет суммарного сечения кабелей
  let cablesAreaMm2 = 0;
  for (const cable of cables) {
    if (cable.diameterMm > 0 && cable.count > 0) {
      const cableRadius = cable.diameterMm / 2;
      const singleCableAreaMm2 = Math.PI * Math.pow(cableRadius, 2);
      cablesAreaMm2 += singleCableAreaMm2 * cable.count;
    }
  }

  // 3. Расчет коэффициента заполнения
  const fillRatioPercent =
    openingAreaMm2 > 0 ? (cablesAreaMm2 / openingAreaMm2) * 100 : 0;

  // 4. Критическая валидация: не более 60% от площади перереза проходки
  const isBlocked =
    openingAreaMm2 <= 0 ||
    fillRatioPercent > CONSTANTS.MAX_PENETRATION_FILL_RATIO_PERCENT;

  let validationError: string | undefined;
  if (openingAreaMm2 <= 0) {
    validationError = "Укажите корректные размеры проема проходки.";
  } else if (fillRatioPercent > CONSTANTS.MAX_PENETRATION_FILL_RATIO_PERCENT) {
    validationError = `Загальний дозволений переріз кабелів не може бути більше 60% від площі перерізу проходки! Фактичне заповнення: ${roundTo(fillRatioPercent, 1)}%. Розрахунок заблоковано.`;
  }

  // Базовые нормы для выбранного предела огнестойкости
  const norms = PENETRATION_EI_NORMS[fireResistance] || PENETRATION_EI_NORMS.EI60;
  const lossFactor = APPLICATION_LOSS_FACTORS[applicationMethod] || 1.10;

  if (isBlocked) {
    return {
      openingAreaM2: roundTo(openingAreaM2, 4),
      openingAreaMm2: roundTo(openingAreaMm2, 1),
      cablesAreaMm2: roundTo(cablesAreaMm2, 1),
      fillRatioPercent: roundTo(fillRatioPercent, 2),
      isBlocked: true,
      validationError,
      boardLayers: norms.boardLayers,
      boardAreaM2: 0,
      mineralWoolMassKg: 0,
      ks1MassKg: 0,
      ks1BucketsCount: 0,
      ks3MassKg: 0,
      sp2MassKg: 0,
      applicationLossFactor: lossFactor,
    };
  }

  // Расчет материалов:
  // Минплита: норма * S_проема (EI 60: 1.0 м², EI 180: 2.0 м²)
  const boardAreaM2 = openingAreaM2 * norms.boardAreaPerM2;

  // Рассыпная минвата: норма * S_проема (EI 60: 1.0 кг, EI 180: 1.5 кг)
  const mineralWoolMassKg = openingAreaM2 * norms.mineralWoolKgPerM2;

  // FLAMMOPLAST KS 1: базовая норма * S_проема * коэфф. потерь (кисть +10%, распылитель +30%)
  const ks1MassKg = openingAreaM2 * norms.ks1BaseKgPerM2 * lossFactor;
  const ks1BucketsCount = Math.ceil(ks1MassKg / CONSTANTS.KS1_BUCKET_WEIGHT_KG);

  // Мастика PYRO-SAFE KS 3: норма * S_проема (EI 60: 3.5 кг, EI 180: 5.0 кг)
  const ks3MassKg = openingAreaM2 * norms.ks3KgPerM2;

  // Защитный лак SP-2: 0.175 кг/м² при влажности > 85%
  const sp2MassKg = humidityGt85 ? openingAreaM2 * CONSTANTS.SP2_COVERAGE_RATE_KG_M2 : 0;

  return {
    openingAreaM2: roundTo(openingAreaM2, 4),
    openingAreaMm2: roundTo(openingAreaMm2, 1),
    cablesAreaMm2: roundTo(cablesAreaMm2, 1),
    fillRatioPercent: roundTo(fillRatioPercent, 2),
    isBlocked: false,
    validationError: undefined,
    boardLayers: norms.boardLayers,
    boardAreaM2: roundTo(boardAreaM2, 3),
    mineralWoolMassKg: roundTo(mineralWoolMassKg, 2),
    ks1MassKg: roundTo(ks1MassKg, 2),
    ks1BucketsCount,
    ks3MassKg: roundTo(ks3MassKg, 2),
    sp2MassKg: roundTo(sp2MassKg, 2),
    applicationLossFactor: lossFactor,
  };
}

// ==========================================
// МОДУЛЬ 3: ОГНЕЗАЩИТА КАБЕЛЬНЫХ ЛИНИЙ (PYRO-SAFE FLAMMOTECT-A)
// ==========================================

export const FLAMMOTECT_CONSTANTS = {
  /** Плотность состава в жидком состоянии (г/см³, среднее по паспорту 1.34 - 1.48) */
  DENSITY_G_CM3: 1.40,
  /** Вес стандартного пластикового ведра FLAMMOTECT-A (кг) */
  BUCKET_WEIGHT_KG: 12.5,
  /** Отношение мокрого слоя к сухому WFT/DFT: 0.9 мм мокрого = 0.5 мм сухого (1.8) */
  WET_TO_DRY_RATIO: 1.8,
  /** Базовый удельный расход при сухом слое 0.5 мм: 0.9 л/м² * 1.4 кг/л = 1.26 кг/м² */
  BASE_RATE_05MM_KG_M2: 1.26,
  /** Базовый удельный расход при сухом слое 1.0 мм: 1.8 л/м² * 1.4 кг/л = 2.52 кг/м² */
  BASE_RATE_10MM_KG_M2: 2.52,
} as const;

export const FLAMMOTECT_APPLICATION_LOSSES = {
  brush_5: { label: "Кисть / валик (мин. потери +5%)", factor: 1.05 },
  brush_10: { label: "Кисть / валик (средние потери +10%)", factor: 1.10 },
  sprayer_30: { label: "Аппарат безвоздушного распыления ВД (+30%)", factor: 1.30 },
} as const;

export type FlammotectApplicationMethod = keyof typeof FLAMMOTECT_APPLICATION_LOSSES;

export interface FlammotectCableInput {
  installationType: CableInstallationType;
  /** Длина кабельной трассы (L) в метрах */
  lengthM: number;
  /** Внешний диаметр кабеля/пучка (d) или ширина лотка (b) в мм */
  dimensionMm: number;
  /** Количество кабелей (для одиночной прокладки) */
  cableCount?: number;
  /** Количество полок/ярусов в коробе (по п. 3.2.1 регламента) */
  shelvesCount?: number;
  /** Целевая толщина сухого слоя (мм), по умолчанию 0.5 мм или 1.0 мм */
  dryFilmThicknessMm: number;
  /** Способ нанесения */
  applicationMethod: FlammotectApplicationMethod;
  /** Пользовательская норма расхода (кг/м²), если задана вручную */
  customRateKgM2?: number;
}

export interface FlammotectCableResult {
  /** Расчетная площадь защищаемой поверхности (м²) */
  areaM2: number;
  /** Требуемая толщина мокрого слоя WFT (мм) для контроля гребенкой на объекте */
  wetFilmThicknessMm: number;
  /** Базовый удельный расход (кг/м²) без технологических потерь */
  baseRateKgM2: number;
  /** Итоговый удельный расход с учетом потерь (кг/м²) */
  effectiveRateKgM2: number;
  /** Общая масса покрытия FLAMMOTECT-A (кг) */
  flammotectMassKg: number;
  /** Количество целых ведер FLAMMOTECT-A (по 12.5 кг) */
  flammotectBucketsCount: number;
  /** Текстовая расшифровка формулы расчета */
  formulaExplanation: string;
  /** Рекомендованное минимальное количество точек замера толщины */
  recommendedMeasurementsCount: number;
}

/**
 * Расчет расхода огнезащитного состава PYRO-SAFE FLAMMOTECT-A для кабельных линий
 * Регламент ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH (2022)
 */
export function calculateFlammotectCableLine(input: FlammotectCableInput): FlammotectCableResult {
  const {
    installationType,
    lengthM,
    dimensionMm,
    cableCount = 1,
    shelvesCount = 1,
    dryFilmThicknessMm = 0.5,
    applicationMethod = "brush_10",
    customRateKgM2,
  } = input;

  if (lengthM <= 0 || dimensionMm <= 0) {
    return {
      areaM2: 0,
      wetFilmThicknessMm: 0,
      baseRateKgM2: 0,
      effectiveRateKgM2: 0,
      flammotectMassKg: 0,
      flammotectBucketsCount: 0,
      formulaExplanation: "Некорректные входные данные (длина или диаметр <= 0).",
      recommendedMeasurementsCount: 0,
    };
  }

  const dimensionM = dimensionMm / 1000;
  const count = Math.max(1, cableCount);
  const shelves = Math.max(1, shelvesCount);

  let areaM2 = 0;
  let formulaExplanation = "";

  switch (installationType) {
    case "single": {
      // S = L * π * d * N (п. 3.2.2)
      areaM2 = lengthM * 3.1416 * dimensionM * count;
      formulaExplanation = `S = L × π × d × N = ${lengthM} м × 3.1416 × ${dimensionM.toFixed(4)} м × ${count} шт.`;
      break;
    }
    case "bundle": {
      // S = L * π * d * 1.5 (п. 3.2.3)
      areaM2 = lengthM * 3.1416 * dimensionM * 1.5;
      formulaExplanation = `S = L × π × d × 1.5 = ${lengthM} м × 3.1416 × ${dimensionM.toFixed(4)} м × 1.5 (коэф. пучка)`;
      break;
    }
    case "tray_solid": {
      // S = L * b * 1.5 * N_shelves (п. 3.2.1)
      areaM2 = lengthM * dimensionM * 1.5 * shelves;
      formulaExplanation = `S = L × b × 1.5 × N_полок = ${lengthM} м × ${dimensionM.toFixed(3)} м × 1.5 × ${shelves} пол. (глухой короб)`;
      break;
    }
    case "tray_mesh": {
      // S = L * b * 1.5 * 2 * N_shelves (п. 3.2.1)
      areaM2 = lengthM * dimensionM * 1.5 * 2 * shelves;
      formulaExplanation = `S = L × b × 1.5 × 2 × N_полок = ${lengthM} м × ${dimensionM.toFixed(3)} м × 1.5 × 2 × ${shelves} пол. (сетчатый короб, двусторонняя обработка)`;
      break;
    }
  }

  // Расчет толщины мокрого слоя WFT (п. 5.2): 0.9 мм мокрого = 0.5 мм сухого (множитель 1.8)
  const wetFilmThicknessMm = dryFilmThicknessMm * FLAMMOTECT_CONSTANTS.WET_TO_DRY_RATIO;

  // Базовая норма расхода (кг/м²):
  // Либо пользовательская, либо через плотность (1.4 кг/л) и толщину мокрого слоя
  const baseRateKgM2 =
    customRateKgM2 && customRateKgM2 > 0
      ? customRateKgM2
      : wetFilmThicknessMm * FLAMMOTECT_CONSTANTS.DENSITY_G_CM3;

  // Технологические потери
  const lossFactor = FLAMMOTECT_APPLICATION_LOSSES[applicationMethod]?.factor || 1.10;
  const effectiveRateKgM2 = baseRateKgM2 * lossFactor;

  // Итоговая масса
  const flammotectMassKg = areaM2 * effectiveRateKgM2;
  const flammotectBucketsCount = Math.ceil(flammotectMassKg / FLAMMOTECT_CONSTANTS.BUCKET_WEIGHT_KG);

  // Рекомендованное количество точек замера по регламенту (п. 5.1):
  // Каждые 15-20 м, но не менее 10 точек
  const recommendedMeasurementsCount = Math.max(10, Math.ceil(lengthM / 20));

  return {
    areaM2: roundTo(areaM2, 3),
    wetFilmThicknessMm: roundTo(wetFilmThicknessMm, 2),
    baseRateKgM2: roundTo(baseRateKgM2, 2),
    effectiveRateKgM2: roundTo(effectiveRateKgM2, 2),
    flammotectMassKg: roundTo(flammotectMassKg, 2),
    flammotectBucketsCount,
    formulaExplanation,
    recommendedMeasurementsCount,
  };
}

// ==========================================
// МОДУЛЬ 4: КАБЕЛЬНЫЕ ПРОХОДКИ DOUBLE LAYER (PYRO-SAFE FLAMMOTECT-A)
// ==========================================

export const FLAMMOTECT_PENETRATION_CONSTANTS = {
  /** Норма расхода покрытия FLAMMOTECT-A coating на 1 м² проходки (кг) без потерь */
  COATING_KG_M2: 6.48,
  /** Норма расхода шпаклевки FLAMMOTECT-A filler на 1 м² проходки (кг) без потерь */
  FILLER_KG_M2: 5.00,
  /** Площадь минплиты на 1 м² проходки (2 слоя плиты по 60 мм = 2.0 м²) */
  MINERAL_BOARD_M2_PER_M2: 2.0,
  /** Норма расхода рассыпной базальтовой ваты на 1 м² проходки (кг) */
  LOOSE_WOOL_KG_M2: 1.52,
  /** Максимально допустимый процент заполнения проходки (60%) */
  MAX_FILL_RATIO_PERCENT: 60.0,
  /** Максимальные габариты проема: ширина/высота не более 2000 мм (п. Таблица 2) */
  MAX_WIDTH_MM: 2000,
  MAX_HEIGHT_MM: 2000,
  /** Технологические потери на минплиту и вату при подгонке/раскрое (до 30%) */
  BOARD_CUTTING_LOSS_FACTOR: 1.30,
  WOOL_INSTALL_LOSS_FACTOR: 1.30,
} as const;

export type PenetrantType = "cable" | "pipe_plastic" | "pipe_metal";

export interface FlammotectPenetrantItem {
  id: string;
  name?: string;
  type: PenetrantType;
  /** Внешний диаметр (мм) */
  diameterMm: number;
  /** Количество */
  count: number;
  /** Длина вылета огнезащиты (мм) для кабелей (100–250 мм, по умолчанию 200 мм) */
  runoutLengthMm?: number;
}

export interface FlammotectPenetrationInput {
  shape: PenetrationShape;
  heightMm?: number;
  widthMm?: number;
  diameterMm?: number;
  penetrants: FlammotectPenetrantItem[];
  applicationMethod: FlammotectApplicationMethod;
  includeCuttingLosses: boolean; // Учитывать +30% потерь на раскрой плит и набивку ваты
  isFloorPenetration?: boolean; // Перекрытие (пол/потолок) или стена
}

export interface FlammotectPenetrationResult {
  openingAreaM2: number;
  openingAreaMm2: number;
  penetrantsAreaMm2: number;
  fillRatioPercent: number;
  isBlocked: boolean;
  validationError?: string;
  /** Количество слоев минераловатных плит (всегда 2 слоя по 60 мм = 120 мм) */
  boardLayers: 2;
  /** Площадь минплиты (м²) с учетом раскроя */
  boardAreaM2: number;
  /** Масса рассыпной минваты (кг) */
  looseWoolMassKg: number;
  /** Масса FLAMMOTECT-A coating (кг) */
  coatingMassKg: number;
  /** Количество ведер coating (по 12.5 кг) */
  coatingBucketsCount: number;
  /** Масса FLAMMOTECT-A filler (кг) */
  fillerMassKg: number;
  /** Количество ведер filler (по 12.5 кг) */
  fillerBucketsCount: number;
  /** Противопожарная обертка DG-CR BS для горючих труб (погонные метры) */
  dgCrBsMeters: number;
  /** Количество рекомендуемых контрольных замеров толщины */
  measurementsCount: number;
}

/**
 * Расчет расхода материалов на двухслойную проходку «PYRO-SAFE Flammotect – Double layer» (EI 120)
 * Регламент ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH (2022)
 */
export function calculateFlammotectPenetration(
  input: FlammotectPenetrationInput
): FlammotectPenetrationResult {
  const {
    shape,
    heightMm = 0,
    widthMm = 0,
    diameterMm = 0,
    penetrants,
    applicationMethod = "brush_10",
    includeCuttingLosses = true,
    isFloorPenetration = false,
  } = input;

  // 1. Площадь проема
  let openingAreaMm2 = 0;
  if (shape === "rect") {
    openingAreaMm2 = heightMm * widthMm;
  } else {
    const radius = diameterMm / 2;
    openingAreaMm2 = Math.PI * radius * radius;
  }
  const openingAreaM2 = openingAreaMm2 / 1_000_000;

  // 2. Суммарная площадь коммуникаций
  let penetrantsAreaMm2 = 0;
  let dgCrBsMeters = 0;

  for (const item of penetrants) {
    if (item.diameterMm > 0 && item.count > 0) {
      const radius = item.diameterMm / 2;
      const singleArea = Math.PI * radius * radius;
      penetrantsAreaMm2 += singleArea * item.count;

      // Для пластиковых горючих труб рассчитываем обмотку DG-CR BS по Табл. 13-14
      if (item.type === "pipe_plastic") {
        // Определение слоев обертывания по диаметру:
        let layers = 1;
        if (item.diameterMm > 110) layers = 4;
        else if (item.diameterMm > 80) layers = 3;
        else if (item.diameterMm > 50) layers = 2;

        // Для стен: 2 обертки (с обеих сторон); для перекрытия: 1 обертка
        const wrapsCount = isFloorPenetration ? 1 : 2;
        // Длина обертки на одну трубу = π * d * layers
        const wrapPerPipeM = (Math.PI * (item.diameterMm / 1000) * layers + 0.05) * wrapsCount;
        dgCrBsMeters += wrapPerPipeM * item.count;
      }
    }
  }

  // 3. Коэффициент заполнения
  const fillRatioPercent =
    openingAreaMm2 > 0 ? (penetrantsAreaMm2 / openingAreaMm2) * 100 : 0;

  // 4. Валидация ограничений регламента
  const exceedsMaxDimension =
    (shape === "rect" && (widthMm > 2000 || heightMm > 2000)) ||
    (shape === "round" && diameterMm > 2000);

  const exceedsMaxFill = fillRatioPercent > FLAMMOTECT_PENETRATION_CONSTANTS.MAX_FILL_RATIO_PERCENT;
  const isBlocked = openingAreaMm2 <= 0 || exceedsMaxFill;

  let validationError: string | undefined;
  if (openingAreaMm2 <= 0) {
    validationError = "Укажите корректные размеры проема проходки.";
  } else if (exceedsMaxFill) {
    validationError = `Загальний дозволений переріз комунікацій не може перевищувати 60% від площі проходки! Фактичне заповнення: ${roundTo(fillRatioPercent, 1)}%. Розрахунок заблоковано регламентом.`;
  } else if (exceedsMaxDimension) {
    validationError = "Внимание: габарит проема превышает нормативный максимум регламента (2000 мм).";
  }

  // Коэффициенты технологических потерь
  const coatingLossFactor = FLAMMOTECT_APPLICATION_LOSSES[applicationMethod]?.factor || 1.10;
  const cuttingLossFactor = includeCuttingLosses
    ? FLAMMOTECT_PENETRATION_CONSTANTS.BOARD_CUTTING_LOSS_FACTOR
    : 1.0;
  const woolLossFactor = includeCuttingLosses
    ? FLAMMOTECT_PENETRATION_CONSTANTS.WOOL_INSTALL_LOSS_FACTOR
    : 1.0;

  if (isBlocked) {
    return {
      openingAreaM2: roundTo(openingAreaM2, 4),
      openingAreaMm2: roundTo(openingAreaMm2, 1),
      penetrantsAreaMm2: roundTo(penetrantsAreaMm2, 1),
      fillRatioPercent: roundTo(fillRatioPercent, 2),
      isBlocked: true,
      validationError,
      boardLayers: 2,
      boardAreaM2: 0,
      looseWoolMassKg: 0,
      coatingMassKg: 0,
      coatingBucketsCount: 0,
      fillerMassKg: 0,
      fillerBucketsCount: 0,
      dgCrBsMeters: 0,
      measurementsCount: 0,
    };
  }

  // Расчет основных материалов на 1 м² проема:
  // 1. Минплита: 2.0 м² на 1 м² (2 слоя по 60 мм) * раскрой
  const boardAreaM2 = openingAreaM2 * FLAMMOTECT_PENETRATION_CONSTANTS.MINERAL_BOARD_M2_PER_M2 * cuttingLossFactor;

  // 2. Рассыпная минвата: 1.52 кг на 1 м² * потери
  const looseWoolMassKg = openingAreaM2 * FLAMMOTECT_PENETRATION_CONSTANTS.LOOSE_WOOL_KG_M2 * woolLossFactor;

  // 3. FLAMMOTECT-A coating: 6.48 кг на 1 м² * потери при нанесении
  const coatingMassKg = openingAreaM2 * FLAMMOTECT_PENETRATION_CONSTANTS.COATING_KG_M2 * coatingLossFactor;
  const coatingBucketsCount = Math.ceil(coatingMassKg / FLAMMOTECT_CONSTANTS.BUCKET_WEIGHT_KG);

  // 4. FLAMMOTECT-A filler: 5.00 кг на 1 м² * потери
  const fillerMassKg = openingAreaM2 * FLAMMOTECT_PENETRATION_CONSTANTS.FILLER_KG_M2 * coatingLossFactor;
  const fillerBucketsCount = Math.ceil(fillerMassKg / FLAMMOTECT_CONSTANTS.BUCKET_WEIGHT_KG);

  // Количество замеров толщины (п. 5.1): 2 замера на каждый 1 м² проходки
  const measurementsCount = Math.max(2, Math.ceil(openingAreaM2 * 2));

  return {
    openingAreaM2: roundTo(openingAreaM2, 4),
    openingAreaMm2: roundTo(openingAreaMm2, 1),
    penetrantsAreaMm2: roundTo(penetrantsAreaMm2, 1),
    fillRatioPercent: roundTo(fillRatioPercent, 2),
    isBlocked: false,
    validationError,
    boardLayers: 2,
    boardAreaM2: roundTo(boardAreaM2, 3),
    looseWoolMassKg: roundTo(looseWoolMassKg, 2),
    coatingMassKg: roundTo(coatingMassKg, 2),
    coatingBucketsCount,
    fillerMassKg: roundTo(fillerMassKg, 2),
    fillerBucketsCount,
    dgCrBsMeters: roundTo(dgCrBsMeters, 2),
    measurementsCount,
  };
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

// ==========================================
// МОДУЛЬ 5: ЗАКЛАДНЫЕ ГИЛЬЗЫ И ЗАДАНИЕ СТРОИТЕЛЯМ
// ==========================================

export interface StandardRoundSleeve {
  diameterMm: number; // Наружный диаметр (мм)
  internalDiameterMm: number; // Внутренний диаметр (мм)
  wallThicknessMm: number;
  label: string;
  du: number; // Условный проход Ду
  areaMm2: number;
}

export const STANDARD_ROUND_SLEEVES: StandardRoundSleeve[] = [
  { diameterMm: 48, internalDiameterMm: 42, wallThicknessMm: 3.0, label: "Труба Ø48×3.0 (Ду 40)", du: 40, areaMm2: Math.PI * 21 * 21 },
  { diameterMm: 57, internalDiameterMm: 50, wallThicknessMm: 3.5, label: "Труба Ø57×3.5 (Ду 50)", du: 50, areaMm2: Math.PI * 25 * 25 },
  { diameterMm: 76, internalDiameterMm: 69, wallThicknessMm: 3.5, label: "Труба Ø76×3.5 (Ду 65)", du: 65, areaMm2: Math.PI * 34.5 * 34.5 },
  { diameterMm: 89, internalDiameterMm: 81, wallThicknessMm: 4.0, label: "Труба Ø89×4.0 (Ду 80)", du: 80, areaMm2: Math.PI * 40.5 * 40.5 },
  { diameterMm: 108, internalDiameterMm: 100, wallThicknessMm: 4.0, label: "Труба Ø108×4.0 (Ду 100)", du: 100, areaMm2: Math.PI * 50 * 50 },
  { diameterMm: 133, internalDiameterMm: 124, wallThicknessMm: 4.5, label: "Труба Ø133×4.5 (Ду 125)", du: 125, areaMm2: Math.PI * 62 * 62 },
  { diameterMm: 159, internalDiameterMm: 150, wallThicknessMm: 4.5, label: "Труба Ø159×4.5 (Ду 150)", du: 150, areaMm2: Math.PI * 75 * 75 },
  { diameterMm: 219, internalDiameterMm: 207, wallThicknessMm: 6.0, label: "Труба Ø219×6.0 (Ду 200)", du: 200, areaMm2: Math.PI * 103.5 * 103.5 },
  { diameterMm: 273, internalDiameterMm: 259, wallThicknessMm: 7.0, label: "Труба Ø273×7.0 (Ду 250)", du: 250, areaMm2: Math.PI * 129.5 * 129.5 },
  { diameterMm: 325, internalDiameterMm: 309, wallThicknessMm: 8.0, label: "Труба Ø325×8.0 (Ду 300)", du: 300, areaMm2: Math.PI * 154.5 * 154.5 },
  { diameterMm: 426, internalDiameterMm: 410, wallThicknessMm: 8.0, label: "Труба Ø426×8.0 (Ду 400)", du: 400, areaMm2: Math.PI * 205 * 205 },
];

export interface StandardRectSleeve {
  widthMm: number;
  heightMm: number;
  label: string;
  areaMm2: number;
}

export const STANDARD_RECT_SLEEVES: StandardRectSleeve[] = [
  { widthMm: 100, heightMm: 100, label: "Короб 100 × 100 мм", areaMm2: 10000 },
  { widthMm: 150, heightMm: 150, label: "Короб 150 × 150 мм", areaMm2: 22500 },
  { widthMm: 200, heightMm: 100, label: "Короб 200 × 100 мм", areaMm2: 20000 },
  { widthMm: 200, heightMm: 150, label: "Короб 200 × 150 мм", areaMm2: 30000 },
  { widthMm: 200, heightMm: 200, label: "Короб 200 × 200 мм", areaMm2: 40000 },
  { widthMm: 300, heightMm: 150, label: "Короб 300 × 150 мм", areaMm2: 45000 },
  { widthMm: 300, heightMm: 200, label: "Короб 300 × 200 мм", areaMm2: 60000 },
  { widthMm: 300, heightMm: 300, label: "Короб 300 × 300 мм", areaMm2: 90000 },
  { widthMm: 400, heightMm: 200, label: "Короб 400 × 200 мм", areaMm2: 80000 },
  { widthMm: 400, heightMm: 300, label: "Короб 400 × 300 мм", areaMm2: 120000 },
  { widthMm: 500, heightMm: 200, label: "Короб 500 × 200 мм", areaMm2: 100000 },
  { widthMm: 500, heightMm: 300, label: "Короб 500 × 300 мм", areaMm2: 150000 },
  { widthMm: 600, heightMm: 200, label: "Короб 600 × 200 мм", areaMm2: 120000 },
  { widthMm: 600, heightMm: 300, label: "Короб 600 × 300 мм", areaMm2: 180000 },
  { widthMm: 600, heightMm: 400, label: "Короб 600 × 400 мм", areaMm2: 240000 },
];

/**
 * Расчет длины гильзы и параметров выпуска с учетом нормативов
 */
export function calculateSleeveLength(wallThicknessMm: number, isFloor: boolean = false) {
  const wall = Math.max(50, wallThicknessMm);
  if (isFloor) {
    // В перекрытиях: гильза должна выступать на 50 мм выше чистого пола (ПУЭ / СНиП) и 10-15 мм снизу
    return {
      totalLengthMm: wall + 50 + 15,
      protrusionSide1Mm: 50, // Сверху над чистым полом
      protrusionSide2Mm: 15, // Снизу из потолка
      ruleText: "Выступ гильзы на 50 мм выше чистого пола (защита от воды по ПУЭ 2.1.58) и 15 мм снизу потолка",
    };
  } else {
    // В стенах: гильза выступает на 15-20 мм с каждой стороны под финишную отделку
    return {
      totalLengthMm: wall + 20 + 20,
      protrusionSide1Mm: 20, // Сторона 1
      protrusionSide2Mm: 20, // Сторона 2
      ruleText: "Выступ гильзы на 20 мм с каждой стороны стены под штукатурку и чистовую отделку",
    };
  }
}

/**
 * Автоматический подбор минимально необходимого размера стандартной гильзы
 * по суммарной площади сечения кабелей (из условия заполнения не более 60%)
 */
export function recommendSleeve(cablesAreaMm2: number, shape: "rect" | "round" = "round") {
  const minAreaNeededMm2 = cablesAreaMm2 > 0 ? cablesAreaMm2 / 0.60 : 1000;

  if (shape === "round") {
    // Минимальный внутренний диаметр для круглой гильзы
    const minDiameterMm = Math.ceil(Math.sqrt((4 * minAreaNeededMm2) / Math.PI));
    // Ищем стандартную трубу из сортамента
    const standardMatch = STANDARD_ROUND_SLEEVES.find((s) => s.internalDiameterMm >= minDiameterMm);
    const chosen = standardMatch || {
      diameterMm: minDiameterMm,
      internalDiameterMm: minDiameterMm,
      wallThicknessMm: 4.0,
      label: `Труба Ø${minDiameterMm} мм (нестандартная)`,
      du: minDiameterMm,
      areaMm2: (Math.PI * minDiameterMm * minDiameterMm) / 4,
    };

    const actualFillPercent = chosen.areaMm2 > 0 ? (cablesAreaMm2 / chosen.areaMm2) * 100 : 0;

    return {
      shape: "round" as const,
      minAreaNeededMm2: roundTo(minAreaNeededMm2, 1),
      minDiameterMm,
      recommendedDiameterMm: chosen.diameterMm,
      recommendedInternalDiameterMm: chosen.internalDiameterMm,
      recommendedLabel: chosen.label,
      recommendedAreaMm2: roundTo(chosen.areaMm2, 1),
      actualFillPercent: roundTo(actualFillPercent, 1),
      isStandard: !!standardMatch,
    };
  } else {
    // Ищем стандартный короб
    const standardMatch = STANDARD_RECT_SLEEVES.find((s) => s.areaMm2 >= minAreaNeededMm2);
    const side = Math.ceil(Math.sqrt(minAreaNeededMm2));
    const chosen = standardMatch || {
      widthMm: side,
      heightMm: side,
      label: `Короб ${side} × ${side} мм`,
      areaMm2: side * side,
    };

    const actualFillPercent = chosen.areaMm2 > 0 ? (cablesAreaMm2 / chosen.areaMm2) * 100 : 0;

    return {
      shape: "rect" as const,
      minAreaNeededMm2: roundTo(minAreaNeededMm2, 1),
      recommendedWidthMm: chosen.widthMm,
      recommendedHeightMm: chosen.heightMm,
      recommendedLabel: chosen.label,
      recommendedAreaMm2: roundTo(chosen.areaMm2, 1),
      actualFillPercent: roundTo(actualFillPercent, 1),
      isStandard: !!standardMatch,
    };
  }
}
