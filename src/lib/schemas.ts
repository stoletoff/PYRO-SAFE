import { z } from "zod";

export const cableLineFormSchema = z.object({
  installationType: z.enum(["single", "bundle", "tray_solid", "tray_mesh"], {
    required_error: "Выберите тип прокладки кабеля",
  }),
  lengthM: z
    .number({ invalid_type_error: "Введите числовое значение длины" })
    .positive("Длина трассы должна быть больше 0 м")
    .max(100000, "Слишком большое значение длины"),
  dimensionMm: z
    .number({ invalid_type_error: "Введите диаметр или ширину" })
    .positive("Размер должен быть больше 0 мм")
    .max(10000, "Размер не может превышать 10 000 мм"),
  cableCount: z
    .number({ invalid_type_error: "Введите количество" })
    .int("Количество должно быть целым числом")
    .min(1, "Количество кабелей должно быть не менее 1"),
  humidityGt85: z.boolean(),
});

export type CableLineFormData = z.infer<typeof cableLineFormSchema>;

export const cableItemSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  diameterMm: z
    .number({ invalid_type_error: "Диаметр" })
    .positive("Диаметр > 0")
    .max(500, "Диаметр <= 500 мм"),
  count: z
    .number({ invalid_type_error: "Кол-во" })
    .int("Целое число")
    .min(1, "Минимум 1")
    .max(10000, "Слишком много"),
});

export const penetrationFormSchema = z
  .object({
    shape: z.enum(["rect", "round"]),
    heightMm: z
      .number({ invalid_type_error: "Введите высоту" })
      .positive("Высота должна быть больше 0")
      .max(10000, "Максимальная высота 10 000 мм")
      .optional(),
    widthMm: z
      .number({ invalid_type_error: "Введите ширину" })
      .positive("Ширина должна быть больше 0")
      .max(10000, "Максимальная ширина 10 000 мм")
      .optional(),
    diameterMm: z
      .number({ invalid_type_error: "Введите диаметр" })
      .positive("Диаметр должен быть больше 0")
      .max(10000, "Максимальный диаметр 10 000 мм")
      .optional(),
    fireResistance: z.enum(["EI60", "EI180"]),
    applicationMethod: z.enum(["brush", "sprayer"]),
    humidityGt85: z.boolean(),
    cables: z.array(cableItemSchema),
  })
  .refine(
    (data) => {
      if (data.shape === "rect") {
        return !!data.heightMm && data.heightMm > 0 && !!data.widthMm && data.widthMm > 0;
      }
      return !!data.diameterMm && data.diameterMm > 0;
    },
    {
      message: "Заполните все геометрические параметры проема",
      path: ["shape"],
    }
  );

export type PenetrationFormData = z.infer<typeof penetrationFormSchema>;

// ==========================================
// СХЕМЫ ДЛЯ FLAMMOTECT-A (РЕГЛАМЕНТ 2022)
// ==========================================

export const flammotectCableFormSchema = z.object({
  installationType: z.enum(["single", "bundle", "tray_solid", "tray_mesh"], {
    required_error: "Выберите тип прокладки кабеля",
  }),
  lengthM: z
    .number({ invalid_type_error: "Введите длину" })
    .positive("Длина должна быть больше 0 м")
    .max(100000, "Слишком большое значение длины"),
  dimensionMm: z
    .number({ invalid_type_error: "Введите диаметр или ширину" })
    .positive("Размер должен быть больше 0 мм")
    .max(10000, "Размер не может превышать 10 000 мм"),
  cableCount: z
    .number({ invalid_type_error: "Введите количество кабелей" })
    .int("Количество должно быть целым числом")
    .min(1, "Минимум 1 кабель"),
  shelvesCount: z
    .number({ invalid_type_error: "Введите количество полок" })
    .int("Количество должно быть целым числом")
    .min(1, "Минимум 1 полка")
    .max(50, "Не более 50 полок"),
  dryFilmThicknessMm: z
    .number({ invalid_type_error: "Введите толщину сухого слоя" })
    .positive("Толщина должна быть больше 0 мм")
    .max(5.0, "Максимальная толщина 5.0 мм"),
  applicationMethod: z.enum(["brush_5", "brush_10", "sprayer_30"]),
  customRateKgM2: z.number().optional(),
});

export type FlammotectCableFormData = z.infer<typeof flammotectCableFormSchema>;

export const flammotectPenetrantItemSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.enum(["cable", "pipe_plastic", "pipe_metal"]),
  diameterMm: z
    .number({ invalid_type_error: "Диаметр" })
    .positive("Диаметр > 0")
    .max(1000, "Диаметр <= 1000 мм"),
  count: z
    .number({ invalid_type_error: "Кол-во" })
    .int("Целое число")
    .min(1, "Минимум 1")
    .max(10000, "Слишком много"),
  runoutLengthMm: z.number().optional(),
});

export const flammotectPenetrationFormSchema = z
  .object({
    shape: z.enum(["rect", "round"]),
    heightMm: z
      .number({ invalid_type_error: "Введите высоту" })
      .positive("Высота должна быть больше 0")
      .max(5000, "Максимальная высота 5000 мм")
      .optional(),
    widthMm: z
      .number({ invalid_type_error: "Введите ширину" })
      .positive("Ширина должна быть больше 0")
      .max(5000, "Максимальная ширина 5000 мм")
      .optional(),
    diameterMm: z
      .number({ invalid_type_error: "Введите диаметр" })
      .positive("Диаметр должен быть больше 0")
      .max(5000, "Максимальный диаметр 5000 мм")
      .optional(),
    applicationMethod: z.enum(["brush_5", "brush_10", "sprayer_30"]),
    includeCuttingLosses: z.boolean(),
    isFloorPenetration: z.boolean(),
    penetrants: z.array(flammotectPenetrantItemSchema),
  })
  .refine(
    (data) => {
      if (data.shape === "rect") {
        return !!data.heightMm && data.heightMm > 0 && !!data.widthMm && data.widthMm > 0;
      }
      return !!data.diameterMm && data.diameterMm > 0;
    },
    {
      message: "Заполните все геометрические параметры проема",
      path: ["shape"],
    }
  );

export type FlammotectPenetrationFormData = z.infer<typeof flammotectPenetrationFormSchema>;
