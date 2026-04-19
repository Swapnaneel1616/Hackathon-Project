"use client";

import clsx from "clsx";
import type { StockLevel } from "@/lib/types";

const copy: Record<
  StockLevel,
  { label: string; hint: string; className: string }
> = {
  green: {
    label: "Stable",
    hint: "Comfortable buffer vs hub capacity",
    className: "bg-emerald-100 text-emerald-900 ring-emerald-300/60",
  },
  yellow: {
    label: "Tightening",
    hint: "Reservations still possible — monitor closely",
    className: "bg-amber-100 text-amber-950 ring-amber-300/60",
  },
  red: {
    label: "Critical",
    hint: "Scarce vs capacity — prioritize replenishment",
    className: "bg-rose-100 text-rose-950 ring-rose-300/60",
  },
};

export function StockLevelBadge({ level }: { level: StockLevel }) {
  const c = copy[level];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        c.className,
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          level === "green" && "bg-emerald-600",
          level === "yellow" && "bg-amber-600",
          level === "red" && "bg-rose-600 animate-pulse-soft",
        )}
      />
      {c.label}
    </span>
  );
}
