"use client";

import React from "react";
import { CableInstallationType } from "@/lib/calculations";

export interface InstallationTypeConfig {
  id: CableInstallationType;
  title: string;
  subtitle: string;
  formula: string;
  dimensionLabel: string;
  dimensionHelp: string;
  defaultDimension: number;
}

export const INSTALLATION_TYPES: InstallationTypeConfig[] = [
  {
    id: "single",
    title: "Одиночный кабель",
    subtitle: "Круглый наружный кабель",
    formula: "S = L × π × d × N",
    dimensionLabel: "Наружный диаметр кабеля (d), мм",
    dimensionHelp: "Диаметр по внешней оболочке кабеля",
    defaultDimension: 25,
  },
  {
    id: "bundle",
    title: "Кабели в пучке",
    subtitle: "Пучок плотно связанных кабелей",
    formula: "S = L × π × d × 1.5",
    dimensionLabel: "Диаметр пучка кабелей (d), мм",
    dimensionHelp: "Внешний габаритный диаметр связанного жгута/пучка",
    defaultDimension: 60,
  },
  {
    id: "tray_solid",
    title: "Лоток с глухим дном",
    subtitle: "Сплошной металлический короб",
    formula: "S = L × b × 1.5",
    dimensionLabel: "Ширина кабельного лотка (b), мм",
    dimensionHelp: "Ширина основания лотка по габаритам",
    defaultDimension: 300,
  },
  {
    id: "tray_mesh",
    title: "Сетчатый лоток",
    subtitle: "Проволочный / перфорированный лоток",
    formula: "S = L × b × 1.5 × 2",
    dimensionLabel: "Ширина кабельного лотка (b), мм",
    dimensionHelp: "Двусторонняя обработка лотка и кабелей",
    defaultDimension: 300,
  },
];

/* -------------------------------------------------------------
   Маленькие векторные схемы (пиктограммы) для визуализации
   ------------------------------------------------------------- */

function SingleCableIcon({ isSelected }: { isSelected: boolean }) {
  const strokeColor = isSelected ? "#f97316" : "#94a3b8";
  return (
    <svg
      viewBox="0 0 48 48"
      className="w-11 h-11 shrink-0 transition-transform duration-200 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Схема одиночного кабеля"
    >
      <rect
        width="48"
        height="48"
        rx="10"
        fill={isSelected ? "rgba(249, 115, 22, 0.14)" : "rgba(30, 41, 59, 0.55)"}
        stroke={isSelected ? "rgba(249, 115, 22, 0.35)" : "rgba(51, 65, 85, 0.6)"}
        strokeWidth="1"
      />
      {/* Корпус кабеля в перспективе */}
      <path
        d="M12 16L34 16C37.5 16 39 19.5 39 24C39 28.5 37.5 32 34 32L12 32C8.5 32 7 28.5 7 24C7 19.5 8.5 16 12 16Z"
        fill="#1e293b"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Передний срез оболочки */}
      <ellipse cx="12" cy="24" rx="4" ry="7.5" fill="#0f172a" stroke={strokeColor} strokeWidth="1.5" />
      {/* Слой изоляции */}
      <ellipse cx="12" cy="24" rx="2.6" ry="5.2" fill="#334155" stroke={isSelected ? "#ea580c" : "#64748b"} strokeWidth="1" />
      {/* Медная токопроводящая жила */}
      <ellipse cx="12" cy="24" rx="1.3" ry="2.6" fill="#f97316" />
      {/* Разметка наружной оболочки */}
      <line x1="21" y1="16.5" x2="21" y2="31.5" stroke={isSelected ? "#ea580c" : "#475569"} strokeWidth="1" strokeDasharray="1.5 2" />
      <line x1="29" y1="16.5" x2="29" y2="31.5" stroke={isSelected ? "#ea580c" : "#475569"} strokeWidth="1" strokeDasharray="1.5 2" />
    </svg>
  );
}

function BundleIcon({ isSelected }: { isSelected: boolean }) {
  const strokeColor = isSelected ? "#f97316" : "#94a3b8";
  return (
    <svg
      viewBox="0 0 48 48"
      className="w-11 h-11 shrink-0 transition-transform duration-200 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Схема пучка кабелей"
    >
      <rect
        width="48"
        height="48"
        rx="10"
        fill={isSelected ? "rgba(249, 115, 22, 0.14)" : "rgba(30, 41, 59, 0.55)"}
        stroke={isSelected ? "rgba(249, 115, 22, 0.35)" : "rgba(51, 65, 85, 0.6)"}
        strokeWidth="1"
      />
      {/* Обвязочный бандаж / стяжка вокруг пучка */}
      <ellipse
        cx="24"
        cy="24"
        rx="15"
        ry="13.5"
        fill="#0f172a"
        stroke={isSelected ? "#ea580c" : "#475569"}
        strokeWidth="1.5"
        strokeDasharray="3 1.5"
      />
      {/* Центральный кабель */}
      <circle cx="24" cy="24" r="4.2" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <circle cx="24" cy="24" r="1.4" fill="#f97316" />

      {/* 6 кабелей по кругу */}
      <circle cx="24" cy="15.5" r="4" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <circle cx="24" cy="15.5" r="1.3" fill="#f97316" />

      <circle cx="31.5" cy="20" r="4" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <circle cx="31.5" cy="20" r="1.3" fill="#f97316" />

      <circle cx="31.5" cy="28" r="4" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <circle cx="31.5" cy="28" r="1.3" fill="#f97316" />

      <circle cx="24" cy="32.5" r="4" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <circle cx="24" cy="32.5" r="1.3" fill="#f97316" />

      <circle cx="16.5" cy="28" r="4" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <circle cx="16.5" cy="28" r="1.3" fill="#f97316" />

      <circle cx="16.5" cy="20" r="4" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      <circle cx="16.5" cy="20" r="1.3" fill="#f97316" />
    </svg>
  );
}

function SolidTrayIcon({ isSelected }: { isSelected: boolean }) {
  const strokeColor = isSelected ? "#f97316" : "#94a3b8";
  return (
    <svg
      viewBox="0 0 48 48"
      className="w-11 h-11 shrink-0 transition-transform duration-200 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Схема сплошного лотка"
    >
      <rect
        width="48"
        height="48"
        rx="10"
        fill={isSelected ? "rgba(249, 115, 22, 0.14)" : "rgba(30, 41, 59, 0.55)"}
        stroke={isSelected ? "rgba(249, 115, 22, 0.35)" : "rgba(51, 65, 85, 0.6)"}
        strokeWidth="1"
      />
      {/* Сплошной металлический П-образный лоток */}
      {/* Левый борт */}
      <path d="M8 20L19 14V27L8 33V20Z" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      {/* Сплошное дно */}
      <path d="M8 33L19 27L40 31L29 37L8 33Z" fill="#0f172a" stroke={strokeColor} strokeWidth="1.2" />
      {/* Правый борт */}
      <path d="M29 24L40 18V31L29 37V24Z" fill="#1e293b" stroke={strokeColor} strokeWidth="1.2" />
      {/* Верхние отбортовки жесткости */}
      <path d="M7 20.5L18 14.5" stroke={strokeColor} strokeWidth="1.4" />
      <path d="M29 24L40 18" stroke={strokeColor} strokeWidth="1.4" />

      {/* Кабели внутри сплошного лотка */}
      <ellipse cx="18" cy="28.5" rx="2.6" ry="1.6" fill="#334155" stroke={isSelected ? "#ea580c" : "#64748b"} strokeWidth="1" />
      <ellipse cx="23.5" cy="29.5" rx="2.6" ry="1.6" fill="#334155" stroke={isSelected ? "#ea580c" : "#64748b"} strokeWidth="1" />
      <ellipse cx="29" cy="30.5" rx="2.6" ry="1.6" fill="#334155" stroke={isSelected ? "#ea580c" : "#64748b"} strokeWidth="1" />
      <circle cx="18" cy="28.5" r="0.8" fill="#f97316" />
      <circle cx="23.5" cy="29.5" r="0.8" fill="#f97316" />
      <circle cx="29" cy="30.5" r="0.8" fill="#f97316" />
    </svg>
  );
}

function MeshTrayIcon({ isSelected }: { isSelected: boolean }) {
  const strokeColor = isSelected ? "#f97316" : "#94a3b8";
  return (
    <svg
      viewBox="0 0 48 48"
      className="w-11 h-11 shrink-0 transition-transform duration-200 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Схема сетчатого проволочного лотка"
    >
      <rect
        width="48"
        height="48"
        rx="10"
        fill={isSelected ? "rgba(249, 115, 22, 0.14)" : "rgba(30, 41, 59, 0.55)"}
        stroke={isSelected ? "rgba(249, 115, 22, 0.35)" : "rgba(51, 65, 85, 0.6)"}
        strokeWidth="1"
      />
      {/* Продольные проволочные струны лотка */}
      <line x1="8" y1="18" x2="40" y2="18" stroke={strokeColor} strokeWidth="1.4" />
      <line x1="8" y1="26" x2="40" y2="26" stroke={strokeColor} strokeWidth="1.4" />
      <line x1="12" y1="34" x2="36" y2="34" stroke={strokeColor} strokeWidth="1.4" />

      {/* Поперечные U-образные проволочные ребра сетки */}
      <path d="M10 18V31C10 33 11.5 34 13 34H17" stroke={strokeColor} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M20 18V31C20 33 21.5 34 23 34H27" stroke={strokeColor} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M30 18V31C30 33 31.5 34 33 34H37" stroke={strokeColor} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M38 18V31C38 33 37 34 35 34" stroke={strokeColor} strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* Сварные узлы сетки (точки) */}
      <circle cx="10" cy="26" r="1.1" fill={isSelected ? "#f97316" : "#cbd5e1"} />
      <circle cx="20" cy="26" r="1.1" fill={isSelected ? "#f97316" : "#cbd5e1"} />
      <circle cx="30" cy="26" r="1.1" fill={isSelected ? "#f97316" : "#cbd5e1"} />
      <circle cx="38" cy="26" r="1.1" fill={isSelected ? "#f97316" : "#cbd5e1"} />

      {/* Кабели внутри сетчатого лотка */}
      <ellipse cx="20" cy="29.5" rx="2.8" ry="1.8" fill="#1e293b" stroke={isSelected ? "#ea580c" : "#64748b"} strokeWidth="1" />
      <ellipse cx="28" cy="29.5" rx="2.8" ry="1.8" fill="#1e293b" stroke={isSelected ? "#ea580c" : "#64748b"} strokeWidth="1" />
      <circle cx="20" cy="29.5" r="0.9" fill="#f97316" />
      <circle cx="28" cy="29.5" r="0.9" fill="#f97316" />
    </svg>
  );
}

function renderTypeIcon(typeId: CableInstallationType, isSelected: boolean) {
  switch (typeId) {
    case "single":
      return <SingleCableIcon isSelected={isSelected} />;
    case "bundle":
      return <BundleIcon isSelected={isSelected} />;
    case "tray_solid":
      return <SolidTrayIcon isSelected={isSelected} />;
    case "tray_mesh":
      return <MeshTrayIcon isSelected={isSelected} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------
   Основной переиспользуемый компонент переключателя типов
   ------------------------------------------------------------- */

interface InstallationTypeSelectorProps {
  value: CableInstallationType;
  onChange: (type: CableInstallationType) => void;
  className?: string;
}

export function InstallationTypeSelector({
  value,
  onChange,
  className = "",
}: InstallationTypeSelectorProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${className}`}>
      {INSTALLATION_TYPES.map((type) => {
        const isSelected = value === type.id;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`group text-left p-4 rounded-xl border transition-all duration-150 relative flex flex-col justify-between ${
              isSelected
                ? "bg-orange-500/10 border-orange-500 shadow-md shadow-orange-950/30"
                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
            }`}
          >
            {/* Статичный индикатор выбора без мерцания */}
            {isSelected && (
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="rounded-full h-2 w-2 bg-orange-500" />
              </span>
            )}

            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="space-y-0.5 pr-2">
                <div className="font-semibold text-sm text-white tracking-tight">
                  {type.title}
                </div>
                <div className="text-xs text-slate-400 leading-snug">
                  {type.subtitle}
                </div>
              </div>

              {/* Миниатюрная иллюстрация */}
              {renderTypeIcon(type.id, isSelected)}
            </div>

            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-orange-300">
                {type.formula}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
