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
    className: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  },
  yellow: {
    label: "Tightening",
    hint: "Reservations still possible — monitor closely",
    className: "bg-amber-500/15 text-amber-200 ring-amber-500/35",
  },
  red: {
    label: "Critical",
    hint: "Scarce vs capacity — prioritize replenishment",
    className: "bg-rose-500/15 text-rose-200 ring-rose-500/40",
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
          level === "green" && "bg-emerald-400",
          level === "yellow" && "bg-amber-400",
          level === "red" && "bg-rose-400 animate-pulse-soft",
        )}
      />
      {c.label}
    </span>
  );
}
