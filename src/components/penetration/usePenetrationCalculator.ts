"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  flammotectPenetrationFormSchema,
  FlammotectPenetrationFormData,
} from "@/lib/schemas";
import {
  calculateFlammotectPenetration,
  FlammotectPenetrationResult,
  FLAMMOTECT_APPLICATION_LOSSES,
  FlammotectApplicationMethod,
  FLAMMOTECT_PENETRATION_CONSTANTS,
  recommendSleeve,
  calculateSleeveLength,
  STANDARD_ROUND_SLEEVES,
  STANDARD_RECT_SLEEVES,
  StandardRoundSleeve,
  StandardRectSleeve,
} from "@/lib/calculations";
import { ProjectFlammotectPenetrationItem } from "@/lib/projectStore";
import { generateId, getTimestamp } from "@/lib/utils";
import {
  CABLES_CATALOG,
  CableSpec,
  POPULAR_CABLES,
} from "@/lib/cablesCatalog";

export interface UsePenetrationCalculatorProps {
  onAddToProject?: (item: ProjectFlammotectPenetrationItem) => void;
}

export function usePenetrationCalculator({
  onAddToProject,
}: UsePenetrationCalculatorProps = {}) {
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [positionTitle, setPositionTitle] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "popular" | "Интеркабель" | "Южкабель" | "all"
  >("popular");
  const [cableSearch, setCableSearch] = useState("");

  // Параметры конструкции и маркировка проходки
  const [wallThicknessMm, setWallThicknessMm] = useState<number>(200);
  const [sleeveTag, setSleeveTag] = useState<string>("Г-1");

  const form = useForm<FlammotectPenetrationFormData>({
    resolver: zodResolver(flammotectPenetrationFormSchema),
    defaultValues: {
      shape: "round",
      heightMm: 400,
      widthMm: 600,
      diameterMm: 150,
      count: 1,
      applicationMethod: "sprayer_30",
      includeCuttingLosses: true,
      isFloorPenetration: false,
      penetrants: [
        { id: "p1", name: "(N)HXH FE180/E90 3×2.5", type: "cable", diameterMm: 13, count: 6 },
        { id: "p2", name: "ВВГнгд 5×10", type: "cable", diameterMm: 19, count: 4 },
      ],
    },
    mode: "onChange",
  });

  const { control, watch, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "penetrants",
  });

  const formValues = watch();

  const watchedPenetrants = useWatch({
    control,
    name: "penetrants",
  });

  const penetrantsList = watchedPenetrants ?? formValues.penetrants ?? [];

  const result: FlammotectPenetrationResult = useMemo(() => {
    return calculateFlammotectPenetration({
      shape: formValues.shape,
      heightMm: Number(formValues.heightMm) || 0,
      widthMm: Number(formValues.widthMm) || 0,
      diameterMm: Number(formValues.diameterMm) || 0,
      penetrants: penetrantsList.map((p) => ({
        id: p?.id || "",
        name: p?.name || "",
        type: p?.type || "cable",
        diameterMm: Number(p?.diameterMm) || 0,
        count: Number(p?.count) || 0,
      })),
      applicationMethod:
        (formValues.applicationMethod as FlammotectApplicationMethod) ||
        "sprayer_30",
      includeCuttingLosses: Boolean(formValues.includeCuttingLosses),
      isFloorPenetration: Boolean(formValues.isFloorPenetration),
      wallThicknessMm: Number(wallThicknessMm) || 200,
      count: Number(formValues.count) || 1,
    });
  }, [
    formValues.shape,
    formValues.heightMm,
    formValues.widthMm,
    formValues.diameterMm,
    penetrantsList,
    formValues.applicationMethod,
    formValues.includeCuttingLosses,
    formValues.isFloorPenetration,
    wallThicknessMm,
    formValues.count,
  ]);

  const coatingLossFactor =
    FLAMMOTECT_APPLICATION_LOSSES[formValues.applicationMethod]?.factor || 1.30;
  const cuttingLossFactor = formValues.includeCuttingLosses
    ? FLAMMOTECT_PENETRATION_CONSTANTS.BOARD_CUTTING_LOSS_FACTOR
    : 1.0;
  const woolLossFactor = formValues.includeCuttingLosses
    ? FLAMMOTECT_PENETRATION_CONSTANTS.WOOL_INSTALL_LOSS_FACTOR
    : 1.0;

  // Суммарная площадь коммуникаций в проеме
  const totalPenetrantsAreaMm2 = useMemo(() => {
    return penetrantsList.reduce((acc, p) => {
      const d = Number(p?.diameterMm) || 0;
      const cnt = Number(p?.count) || 0;
      return acc + (Math.PI * (d / 2) * (d / 2)) * cnt;
    }, 0);
  }, [penetrantsList]);

  // Интеллектуальный расчет и подбор гильзы
  const sleeveRec = useMemo(() => {
    return recommendSleeve(totalPenetrantsAreaMm2, formValues.shape);
  }, [totalPenetrantsAreaMm2, formValues.shape]);

  // Расчет длины гильзы и выступов
  const sleeveLengthInfo = useMemo(() => {
    return calculateSleeveLength(wallThicknessMm, formValues.isFloorPenetration);
  }, [wallThicknessMm, formValues.isFloorPenetration]);

  // Текущая спецификация гильзы
  const currentSleeveSpec = useMemo(() => {
    if (formValues.shape === "round") {
      const dia = Number(formValues.diameterMm) || 0;
      const match = STANDARD_ROUND_SLEEVES.find(
        (s) =>
          Math.abs(s.internalDiameterMm - dia) <= 3 ||
          Math.abs(s.diameterMm - dia) <= 3
      );
      if (match) {
        return `${match.label}, L = ${sleeveLengthInfo.totalLengthMm} мм`;
      }
      return `Труба стальная Ø${dia} мм, L = ${sleeveLengthInfo.totalLengthMm} мм`;
    } else {
      const w = Number(formValues.widthMm) || 0;
      const h = Number(formValues.heightMm) || 0;
      const match = STANDARD_RECT_SLEEVES.find(
        (s) => s.widthMm === w && s.heightMm === h
      );
      if (match) {
        return `${match.label}, L = ${sleeveLengthInfo.totalLengthMm} мм`;
      }
      return `Короб стальной ${w} × ${h} мм, L = ${sleeveLengthInfo.totalLengthMm} мм`;
    }
  }, [
    formValues.shape,
    formValues.diameterMm,
    formValues.widthMm,
    formValues.heightMm,
    sleeveLengthInfo.totalLengthMm,
  ]);

  const handleApplyRecommendedSleeve = () => {
    if (sleeveRec.shape === "round") {
      setValue("shape", "round");
      setValue(
        "diameterMm",
        sleeveRec.recommendedInternalDiameterMm || sleeveRec.recommendedDiameterMm
      );
    } else {
      setValue("shape", "rect");
      setValue("widthMm", sleeveRec.recommendedWidthMm);
      setValue("heightMm", sleeveRec.recommendedHeightMm);
    }
  };

  const handleSelectRoundSleeve = (s: StandardRoundSleeve) => {
    setValue("shape", "round");
    setValue("diameterMm", s.internalDiameterMm);
  };

  const handleSelectRectSleeve = (s: StandardRectSleeve) => {
    setValue("shape", "rect");
    setValue("widthMm", s.widthMm);
    setValue("heightMm", s.heightMm);
  };

  const filteredCables = useMemo(() => {
    let list = CABLES_CATALOG;
    if (selectedFilter === "popular") {
      list = POPULAR_CABLES;
    } else if (selectedFilter === "Интеркабель" || selectedFilter === "Южкабель") {
      list = CABLES_CATALOG.filter((c) => c.manufacturer === selectedFilter);
    }

    if (cableSearch.trim()) {
      const q = cableSearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.manufacturer.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedFilter, cableSearch]);

  const handleAddCableSpec = (cable: CableSpec) => {
    append({
      id: generateId("pen"),
      name: cable.name,
      type: "cable",
      diameterMm: cable.diameterMm,
      count: 1,
    });
  };

  const handleAddCustomPenetrant = (type: "cable" | "pipe_plastic" | "pipe_metal") => {
    let defaultName = "Кабель";
    let defaultDia = 20;
    if (type === "pipe_plastic") {
      defaultName = "Труба ПВХ / ПЭ";
      defaultDia = 50;
    } else if (type === "pipe_metal") {
      defaultName = "Труба стальная";
      defaultDia = 54;
    }

    append({
      id: generateId("pen"),
      name: defaultName,
      type,
      diameterMm: defaultDia,
      count: 1,
    });
  };

  const dimensionsText =
    formValues.shape === "rect"
      ? `${formValues.widthMm || 0} × ${formValues.heightMm || 0} мм`
      : `Ø ${formValues.diameterMm || 0} мм`;

  const handleCopy = () => {
    if (result.isBlocked) return;

    const penetrantsSummary = (formValues.penetrants || [])
      .map((p) => `${p.name || "Элемент"} (Ø${p.diameterMm}мм, ${p.count} шт.)`)
      .join("; ");

    const countInfo =
      result.count > 1 ? `\nКоличество одинаковых проходок: ${result.count} шт.` : "";

    const singleBreakdown =
      result.count > 1
        ? `\n---\nПОТРЕБНОСТЬ НА 1 ПРОХОДКУ:
- Просвет проема: ${result.singlePenetration.openingAreaM2} м² (${result.singlePenetration.openingAreaCm2} см²)
- FLAMMOTECT-A coating: ${result.singlePenetration.coatingMassKg} кг (${result.singlePenetration.coatingBucketsCount} вёдер)
- FLAMMOTECT-A filler: ${result.singlePenetration.fillerMassKg} кг (${result.singlePenetration.fillerBucketsCount} вёдер)
- Минплита 150 кг/м³ (2 слоя): ${result.singlePenetration.boardAreaM2} м²
- Базальтовая минвата: ${result.singlePenetration.looseWoolMassKg} кг${
            result.singlePenetration.dgCrBsMeters > 0
              ? `\n- Обмотка DG-CR BS: ${result.singlePenetration.dgCrBsMeters} пог. м`
              : ""
          }`
        : "";

    const totalsHeader =
      result.count > 1
        ? `ИТОГО НА ${result.count} ШТУК (В СПЕЦИФИКАЦИЮ):`
        : "ПОТРЕБНОСТЬ В МАТЕРИАЛАХ ОЗС (ПО РЕГЛАМЕНТУ, ТАБЛИЦА 10):";

    const text = `
=== РАСЧЕТ КАБЕЛЬНОЙ ПРОХОДКИ PYRO-SAFE FLAMMOTECT (DOUBLE LAYER) ===
Регламент: ТОВ «ІПВК «СПЕЦЗАХИСТ» / svt Products GmbH (2022)
Позиция / Марка: ${sleeveTag} (${currentSleeveSpec})${countInfo}
Тип конструкции: ${formValues.isFloorPenetration ? "Перекрытие (≥150 мм)" : "Стена / перегородка (≥100 мм)"}, толщина ${wallThicknessMm} мм
Форма и размеры: ${dimensionsText}
Предел огнестойкости: EI 120 (Двухслойная проходка 2 × 60 мм = 120 мм)
---
Площадь 1 проема (S): ${result.singlePenetration.openingAreaM2} м² (${result.singlePenetration.openingAreaCm2} см² / ${result.singlePenetration.openingAreaMm2} мм²)
${result.count > 1 ? `Суммарный просвет (${result.count} шт.): ${result.openingAreaM2} м² (${result.openingAreaCm2} см²)\n` : ""}Площадь сечения коммуникаций: ${(totalPenetrantsAreaMm2 / 100).toFixed(2)} см² (${(result.penetrantsAreaMm2 / result.count).toFixed(1)} мм²)
Коэффициент заполнения: ${result.fillRatioPercent}% (лимит не более 60%)
Состав коммуникаций: ${penetrantsSummary}${singleBreakdown}
---
${totalsHeader}
1. FLAMMOTECT-A coating (краска): ${result.coatingMassKg} кг (${result.coatingBucketsCount} вёдер по 12.5 кг)
2. FLAMMOTECT-A filler (шпаклевка): ${result.fillerMassKg} кг (${result.fillerBucketsCount} вёдер по 12.5 кг)
3. Минплита 150 кг/м³ (толщина 60 мм, 2 слоя): ${result.boardAreaM2} м²
4. Рассыпная базальтовая вата: ${result.looseWoolMassKg} кг
${result.dgCrBsMeters > 0 ? `5. Противопожарная обмотка DG-CR BS: ${result.dgCrBsMeters} пог. м\n` : ""}Контроль: ${result.measurementsCount} контрольных замера толщины ${result.count > 1 ? `(по ${result.singlePenetration.measurementsCount} на проходку)` : "гребенкой/штангенциркулем"}
Дата: ${new Date().toLocaleDateString("ru-RU")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddPosition = () => {
    if (!onAddToProject || result.isBlocked) return;

    const penetrantsSummary = (formValues.penetrants || [])
      .map((p) => `${p.name || "Элемент"} (Ø${p.diameterMm}мм, ${p.count} шт.)`)
      .join(", ");

    const countSuffix = result.count > 1 ? ` × ${result.count} шт.` : "";
    const title =
      positionTitle.trim() ||
      `Гильза ${sleeveTag}: ${currentSleeveSpec}${countSuffix} (${dimensionsText}, зап. ${result.fillRatioPercent}%)`;

    const item: ProjectFlammotectPenetrationItem = {
      id: generateId("flammotect_pen"),
      type: "penetration_flammotect",
      title,
      timestamp: getTimestamp(),
      details: {
        shapeName: formValues.shape === "rect" ? "Прямоугольный" : "Круглый",
        dimensionsText,
        penetrantsSummary: penetrantsSummary || "Без коммуникаций",
        applicationMethodName:
          FLAMMOTECT_APPLICATION_LOSSES[formValues.applicationMethod]?.label ||
          "Кисть / шпатель",
        locationTypeName: formValues.isFloorPenetration ? "Перекрытие" : "Стена",
        sleeveTag: sleeveTag.trim() || undefined,
        sleeveSpec: currentSleeveSpec,
        wallThicknessMm,
        count: result.count,
      },
      result,
    };

    onAddToProject(item);
    setPositionTitle("");
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return {
    form,
    control,
    formValues,
    penetrantsList,
    setValue,
    fields,
    append,
    remove,
    result,
    coatingLossFactor,
    cuttingLossFactor,
    woolLossFactor,
    totalPenetrantsAreaMm2,
    wallThicknessMm,
    setWallThicknessMm,
    sleeveTag,
    setSleeveTag,
    sleeveRec,
    sleeveLengthInfo,
    currentSleeveSpec,
    dimensionsText,
    selectedFilter,
    setSelectedFilter,
    cableSearch,
    setCableSearch,
    filteredCables,
    copied,
    addedToast,
    positionTitle,
    setPositionTitle,
    handleApplyRecommendedSleeve,
    handleSelectRoundSleeve,
    handleSelectRectSleeve,
    handleAddCableSpec,
    handleAddCustomPenetrant,
    handleCopy,
    handlePrint,
    handleAddPosition,
  };
}

export type PenetrationCalculatorReturn = ReturnType<typeof usePenetrationCalculator>;

