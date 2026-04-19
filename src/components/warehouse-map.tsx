"use client";

import Link from "next/link";
import clsx from "clsx";
import type { Warehouse } from "@/lib/types";
import { redSeverityScore } from "@/lib/stock-utils";

function pos(w: Warehouse) {
  const x = ((w.lng + 74) / 0.08) * 100;
  const y = ((40.8 - w.lat) / 0.08) * 100;
  return { x: Math.min(92, Math.max(8, x)), y: Math.min(88, Math.max(12, y)) };
}

export function WarehouseMap({ warehouses }: { warehouses: Warehouse[] }) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl map-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-400/8 via-transparent to-violet-400/6" />
      <div className="relative aspect-[16/11] w-full">
        {warehouses.map((w) => {
          const { x, y } = pos(w);
          const sev = redSeverityScore(w);
          return (
            <Link
              key={w.id}
              href={`/user/warehouse/${w.id}`}
              className="group absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            >
              <span
                className={clsx(
                  "flex h-4 w-4 rounded-full ring-4 transition group-hover:scale-125",
                  sev >= 8
                    ? "bg-rose-500 ring-rose-400/35"
                    : sev >= 4
                      ? "bg-amber-400 ring-amber-400/35"
                      : "bg-emerald-500 ring-emerald-400/35",
                )}
              />
              <span className="pointer-events-none absolute left-1/2 top-5 z-10 hidden w-44 -translate-x-1/2 rounded-lg border border-slate-200/90 bg-white/95 px-2 py-1.5 text-center text-[10px] font-semibold text-slate-800 shadow-lg shadow-slate-400/25 backdrop-blur-sm group-hover:block">
                {w.name}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-slate-200/70 bg-white/30 px-4 py-2 text-[10px] text-slate-600">
        <span>Live pins · sorted by critical lanes</span>
        <span className="font-mono text-slate-500">Gov-fixed sites</span>
      </div>
    </div>
  );
}
