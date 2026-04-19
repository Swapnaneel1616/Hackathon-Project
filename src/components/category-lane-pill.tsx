"use client";

import clsx from "clsx";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import type { NutritionCategory, StockLevel } from "@/lib/types";

const laneClass: Record<StockLevel, string> = {
  green:
    "bg-emerald-500/15 text-emerald-200 ring-emerald-500/35 border-emerald-500/25",
  yellow:
    "bg-amber-500/15 text-amber-100 ring-amber-500/40 border-amber-500/25",
  red: "bg-rose-500/15 text-rose-100 ring-rose-500/45 border-rose-500/30",
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
          level === "green" && "bg-emerald-400",
          level === "yellow" && "bg-amber-400",
          level === "red" && "bg-rose-400 animate-pulse-soft",
        )}
      />
      {label}
    </span>
  );
}
