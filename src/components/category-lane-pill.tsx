"use client";

import clsx from "clsx";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import type { NutritionCategory, StockLevel } from "@/lib/types";

const laneClass: Record<StockLevel, string> = {
  green:
    "bg-emerald-100/95 text-emerald-950 ring-emerald-300/50 border-emerald-200/80",
  yellow:
    "bg-amber-100/95 text-amber-950 ring-amber-300/50 border-amber-200/80",
  red: "bg-rose-100/95 text-rose-950 ring-rose-300/50 border-rose-200/80",
};

export function CategoryLanePill({
  category,
  level,
}: {
  category: NutritionCategory;
  level: StockLevel;
}) {
  const label = CATEGORY_LABELS[category];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        laneClass[level],
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          level === "green" && "bg-emerald-600",
          level === "yellow" && "bg-amber-600",
          level === "red" && "bg-rose-600 animate-pulse-soft",
        )}
      />
      {label}
    </span>
  );
}
