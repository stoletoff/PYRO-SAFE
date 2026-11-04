/**
 * Бизнес-логика инженерного калькулятора огнезащитных материалов «PYRO-SAFE» (svt Products GmbH / ТОВ «ІПВК «СПЕЦЗАХИСТ»).
 * Регламенты 2022 года:
 * 1. Огнезащита кабелей: PYRO-SAFE FLAMMOTECT-A (ДСТУ EN 60332-3-21)
 * 2. Огнестойкие проходки: PYRO-SAFE FLAMMOTECT Double Layer (EI 120, EN 1366-3)
 */

// ==========================================
// ОБЩИЕ ТИПЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

export type CableInstallationType =
  | "single" // Одиночный кабель
  | "bundle" // Кабели в пучке
  | "tray_solid" // Лоток с глухим дном
  | "tray_mesh"; // Сетчатый лоток

export type PenetrationShape = "rect" | "round";

export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

// ==========================================
// МОДУЛЬ 1: ОГНЕЗАЩИТА КАБЕЛЬНЫХ ЛИНИЙ (PYRO-SAFE FLAMMOTECT-A)
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

  // Рекомендованное количество точек замера по регламенту (п. 5.1): каждые 15-20 м, но не менее 10 точек
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
// МОДУЛЬ 2: КАБЕЛЬНЫЕ ПРОХОДКИ И ЗАКЛАДНЫЕ ГИЛЬЗЫ DOUBLE LAYER (EI 120)
// ==========================================

export const FLAMMOTECT_PENETRATION_CONSTANTS = {
  /** Норма расхода покрытия FLAMMOTECT-A coating на 1 м² проходки (кг) без потерь (Таблица 10 регламента) */
  COATING_KG_M2: 6.48,
  /** Норма расхода шпаклевки FLAMMOTECT-A filler на 1 м² проходки (кг) без потерь (Таблица 10 регламента) */
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
  /** Технологические потери на минплиту и вату при подгонке/раскрое (+30%) */
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
  /** Толщина стены/перекрытия (глубина гильзы) в мм */
  wallThicknessMm?: number;
}

export interface FlammotectPenetrationResult {
  openingAreaM2: number;
  openingAreaCm2: number;
  openingAreaMm2: number;
  penetrantsAreaMm2: number;
  fillRatioPercent: number;
  isBlocked: boolean;
  validationError?: string;
  isRoundSleeve: boolean;
  /** Справочный объем свободной полости гильзы в литрах */
  cavityVolumeLiters?: number;
  /** Справочный объем свободной полости гильзы в м³ */
  cavityVolumeM3?: number;
  /** Количество слоев минераловатных плит (2 слоя по 60 мм) */
  boardLayers: number;
  /** Площадь минплиты (м²) по нормативной таблице Регламента */
  boardAreaM2: number;
  /** Масса базальтовой минваты (кг) по нормативной таблице Регламента */
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
 * Расчет расхода материалов на кабельную проходку / закладную гильзу
 * методом пропорции по Таблице 10 Регламента «PYRO-SAFE Flammotect – Double layer» (EI 120)
 * S_проема (м²) × Удельный норматив на 1 м² × Коэффициент технологических потерь
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
    wallThicknessMm = 200,
  } = input;

  // 1. Площадь сечения проема (просвета гильзы)
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
        let layers = 1;
        if (item.diameterMm > 110) layers = 4;
        else if (item.diameterMm > 80) layers = 3;
        else if (item.diameterMm > 50) layers = 2;

        const wrapsCount = isFloorPenetration ? 1 : 2;
        const wrapPerPipeM = (Math.PI * (item.diameterMm / 1000) * layers + 0.05) * wrapsCount;
        dgCrBsMeters += wrapPerPipeM * item.count;
      }
    }
  }

  // 3. Коэффициент заполнения проходки (не более 60%)
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
    validationError = "Укажите корректные размеры проема проходки или гильзы.";
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

  const isRoundSleeve = shape === "round";
  const cavityAreaMm2 = Math.max(0, openingAreaMm2 - penetrantsAreaMm2);
  const wallDepthMm = Math.max(100, wallThicknessMm || 200);
  const cavityVolumeM3 = (cavityAreaMm2 / 1_000_000_000) * wallDepthMm;
  const cavityVolumeLiters = roundTo(cavityVolumeM3 * 1000, 2);

  if (isBlocked) {
    const displayOpeningAreaM2 =
      openingAreaM2 < 0.01 ? roundTo(openingAreaM2, 6) : roundTo(openingAreaM2, 4);
    const openingAreaCm2 = roundTo(openingAreaMm2 / 100, 2);

    return {
      openingAreaM2: displayOpeningAreaM2,
      openingAreaCm2,
      openingAreaMm2: roundTo(openingAreaMm2, 1),
      penetrantsAreaMm2: roundTo(penetrantsAreaMm2, 1),
      fillRatioPercent: roundTo(fillRatioPercent, 2),
      isBlocked: true,
      validationError,
      isRoundSleeve,
      cavityVolumeLiters: 0,
      cavityVolumeM3: 0,
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

  // Расчет всех материалов методом пропорции по Таблице 10 Регламента:
  // S_проема (м²) × удельная норма на 1 м² × коэффициент потерь

  // 1. Минплита 150 кг/м³ (толщина 60 мм, 2 слоя = 2.0 м² на 1 м²):
  const boardAreaM2 = roundTo(
    openingAreaM2 * FLAMMOTECT_PENETRATION_CONSTANTS.MINERAL_BOARD_M2_PER_M2 * cuttingLossFactor,
    4
  );

  // 2. Рассыпная базальтовая минвата (1.52 кг на 1 м²):
  const looseWoolMassKg = roundTo(
    openingAreaM2 * FLAMMOTECT_PENETRATION_CONSTANTS.LOOSE_WOOL_KG_M2 * woolLossFactor,
    4
  );

  // 3. FLAMMOTECT-A coating (6.48 кг на 1 м²):
  const coatingMassKg = roundTo(
    openingAreaM2 * FLAMMOTECT_PENETRATION_CONSTANTS.COATING_KG_M2 * coatingLossFactor,
    3
  );
  const coatingBucketsCount = Math.ceil(coatingMassKg / FLAMMOTECT_CONSTANTS.BUCKET_WEIGHT_KG);

  // 4. FLAMMOTECT-A filler (5.00 кг на 1 м²):
  const fillerMassKg = roundTo(
    openingAreaM2 * FLAMMOTECT_PENETRATION_CONSTANTS.FILLER_KG_M2 * coatingLossFactor,
    3
  );
  const fillerBucketsCount = Math.ceil(fillerMassKg / FLAMMOTECT_CONSTANTS.BUCKET_WEIGHT_KG);

  // Контрольные замеры толщины (п. 5.1): не менее 2 замеров
  const measurementsCount = Math.max(2, Math.ceil(openingAreaM2 * 2));

  // Для малых проемов/гильз (< 0.01 м², например Ду 15 - Ду 100) выводим м² с точностью 6 знаков (например, 0.001257 м²),
  // для средних и больших проемов — 4 знака. Площадь в см² выводим с точностью 2 знака (например, 12.57 см²).
  const displayOpeningAreaM2 =
    openingAreaM2 < 0.01 ? roundTo(openingAreaM2, 6) : roundTo(openingAreaM2, 4);
  const openingAreaCm2 = roundTo(openingAreaMm2 / 100, 2);

  return {
    openingAreaM2: displayOpeningAreaM2,
    openingAreaCm2,
    openingAreaMm2: roundTo(openingAreaMm2, 1),
    penetrantsAreaMm2: roundTo(penetrantsAreaMm2, 1),
    fillRatioPercent: roundTo(fillRatioPercent, 2),
    isBlocked: false,
    validationError,
    isRoundSleeve,
    cavityVolumeLiters,
    cavityVolumeM3: roundTo(cavityVolumeM3, 5),
    boardLayers: 2,
    boardAreaM2,
    looseWoolMassKg,
    coatingMassKg,
    coatingBucketsCount,
    fillerMassKg,
    fillerBucketsCount,
    dgCrBsMeters: roundTo(dgCrBsMeters, 2),
    measurementsCount,
  };
}

// ==========================================
// МОДУЛЬ 3: СТАНДАРТНЫЕ ГИЛЬЗЫ (ДСТУ EN 10255) И РАСЧЕТ ДЛИНЫ
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
  { diameterMm: 89, internalDiameterMm: 82, wallThicknessMm: 3.5, label: "Труба Ø89×3.5 (Ду 80)", du: 80, areaMm2: Math.PI * 41 * 41 },
  { diameterMm: 108, internalDiameterMm: 100, wallThicknessMm: 4.0, label: "Труба Ø108×4.0 (Ду 100)", du: 100, areaMm2: Math.PI * 50 * 50 },
  { diameterMm: 133, internalDiameterMm: 125, wallThicknessMm: 4.0, label: "Труба Ø133×4.0 (Ду 125)", du: 125, areaMm2: Math.PI * 62.5 * 62.5 },
  { diameterMm: 159, internalDiameterMm: 150, wallThicknessMm: 4.5, label: "Труба Ø159×4.5 (Ду 150)", du: 150, areaMm2: Math.PI * 75 * 75 },
  { diameterMm: 219, internalDiameterMm: 207, wallThicknessMm: 6.0, label: "Труба Ø219×6.0 (Ду 200)", du: 200, areaMm2: Math.PI * 103.5 * 103.5 },
];

export interface StandardRectSleeve {
  widthMm: number;
  heightMm: number;
  label: string;
  areaMm2: number;
}

export const STANDARD_RECT_SLEEVES: StandardRectSleeve[] = [
  { widthMm: 100, heightMm: 100, label: "Короб 100×100 мм", areaMm2: 10000 },
  { widthMm: 150, heightMm: 100, label: "Короб 150×100 мм", areaMm2: 15000 },
  { widthMm: 200, heightMm: 100, label: "Короб 200×100 мм", areaMm2: 20000 },
  { widthMm: 200, heightMm: 200, label: "Короб 200×200 мм", areaMm2: 40000 },
  { widthMm: 300, heightMm: 150, label: "Короб 300×150 мм", areaMm2: 45000 },
  { widthMm: 300, heightMm: 200, label: "Короб 300×200 мм", areaMm2: 60000 },
  { widthMm: 400, heightMm: 200, label: "Короб 400×200 мм", areaMm2: 80000 },
  { widthMm: 500, heightMm: 200, label: "Короб 500×200 мм", areaMm2: 100000 },
  { widthMm: 600, heightMm: 200, label: "Короб 600×200 мм", areaMm2: 120000 },
];

export interface SleeveRecommendation {
  shape: PenetrationShape;
  recommendedDiameterMm?: number;
  recommendedInternalDiameterMm?: number;
  recommendedWidthMm?: number;
  recommendedHeightMm?: number;
  label: string;
  recommendedLabel: string;
  fillPercent: number;
  actualFillPercent: number;
  isAvailable: boolean;
  minRequiredAreaMm2: number;
  minAreaNeededMm2: number;
}

export function recommendSleeve(
  cablesAreaMm2: number,
  shape: PenetrationShape
): SleeveRecommendation {
  const minRequiredAreaMm2 = cablesAreaMm2 > 0 ? cablesAreaMm2 / 0.50 : 1000;

  if (shape === "round") {
    const candidate = STANDARD_ROUND_SLEEVES.find((s) => s.areaMm2 >= minRequiredAreaMm2);
    if (candidate) {
      const fill = (cablesAreaMm2 / candidate.areaMm2) * 100;
      return {
        shape: "round",
        recommendedDiameterMm: candidate.internalDiameterMm,
        recommendedInternalDiameterMm: candidate.internalDiameterMm,
        label: candidate.label,
        recommendedLabel: candidate.label,
        fillPercent: roundTo(fill, 1),
        actualFillPercent: roundTo(fill, 1),
        isAvailable: true,
        minRequiredAreaMm2: roundTo(minRequiredAreaMm2, 0),
        minAreaNeededMm2: roundTo(minRequiredAreaMm2, 0),
      };
    }
    const maxSleeve = STANDARD_ROUND_SLEEVES[STANDARD_ROUND_SLEEVES.length - 1];
    const fill = (cablesAreaMm2 / maxSleeve.areaMm2) * 100;
    return {
      shape: "round",
      recommendedDiameterMm: maxSleeve.internalDiameterMm,
      recommendedInternalDiameterMm: maxSleeve.internalDiameterMm,
      label: `${maxSleeve.label} (Переполнение!)`,
      recommendedLabel: `${maxSleeve.label} (Переполнение!)`,
      fillPercent: roundTo(fill, 1),
      actualFillPercent: roundTo(fill, 1),
      isAvailable: false,
      minRequiredAreaMm2: roundTo(minRequiredAreaMm2, 0),
      minAreaNeededMm2: roundTo(minRequiredAreaMm2, 0),
    };
  } else {
    const candidate = STANDARD_RECT_SLEEVES.find((s) => s.areaMm2 >= minRequiredAreaMm2);
    if (candidate) {
      const fill = (cablesAreaMm2 / candidate.areaMm2) * 100;
      return {
        shape: "rect",
        recommendedWidthMm: candidate.widthMm,
        recommendedHeightMm: candidate.heightMm,
        label: candidate.label,
        recommendedLabel: candidate.label,
        fillPercent: roundTo(fill, 1),
        actualFillPercent: roundTo(fill, 1),
        isAvailable: true,
        minRequiredAreaMm2: roundTo(minRequiredAreaMm2, 0),
        minAreaNeededMm2: roundTo(minRequiredAreaMm2, 0),
      };
    }
    const maxSleeve = STANDARD_RECT_SLEEVES[STANDARD_RECT_SLEEVES.length - 1];
    const fill = (cablesAreaMm2 / maxSleeve.areaMm2) * 100;
    return {
      shape: "rect",
      recommendedWidthMm: maxSleeve.widthMm,
      recommendedHeightMm: maxSleeve.heightMm,
      label: `${maxSleeve.label} (Переполнение!)`,
      recommendedLabel: `${maxSleeve.label} (Переполнение!)`,
      fillPercent: roundTo(fill, 1),
      actualFillPercent: roundTo(fill, 1),
      isAvailable: false,
      minRequiredAreaMm2: roundTo(minRequiredAreaMm2, 0),
      minAreaNeededMm2: roundTo(minRequiredAreaMm2, 0),
    };
  }
}

export interface SleeveLengthResult {
  wallThicknessMm: number;
  totalLengthMm: number;
  protrusionSide1Mm: number;
  protrusionSide2Mm: number;
  ruleText: string;
}

export function calculateSleeveLength(
  wallThicknessMm: number,
  isFloorPenetration: boolean = false
): SleeveLengthResult {
  const wall = Math.max(50, wallThicknessMm || 200);

  if (isFloorPenetration) {
    const protrusionSide1Mm = 50; // Выпуск выше чистого пола по ПУЭ 2.1.58
    const protrusionSide2Mm = 20; // Выпуск ниже потолка
    const totalLengthMm = wall + protrusionSide1Mm + protrusionSide2Mm;
    return {
      wallThicknessMm: wall,
      totalLengthMm,
      protrusionSide1Mm,
      protrusionSide2Mm,
      ruleText: `ПУЭ 2.1.58: выпуск гильзы на +50 мм выше отметки чистого пола (защита от воды) и +20 мм снизу плиты перекрытия`,
    };
  } else {
    const protrusionSide1Mm = 20; // Стены: по 20 мм с каждой стороны под штукатурку/отделку
    const protrusionSide2Mm = 20;
    const totalLengthMm = wall + protrusionSide1Mm + protrusionSide2Mm;
    return {
      wallThicknessMm: wall,
      totalLengthMm,
      protrusionSide1Mm,
      protrusionSide2Mm,
      ruleText: `Стены/перегородки: выпуск гильзы по +20 мм с каждой стороны от плоскости стены под чистовую отделку`,
    };
  }
}
