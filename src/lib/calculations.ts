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
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}
