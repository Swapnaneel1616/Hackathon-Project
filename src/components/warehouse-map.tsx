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
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
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
                    ? "bg-rose-400 ring-rose-500/40"
                    : sev >= 4
                      ? "bg-amber-300 ring-amber-500/35"
                      : "bg-emerald-400 ring-emerald-500/30",
                )}
              />
              <span className="pointer-events-none absolute left-1/2 top-5 z-10 hidden w-40 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-950/95 px-2 py-1 text-center text-[10px] font-semibold text-white shadow-xl group-hover:block">
                {w.name}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[10px] text-slate-500">
        <span>Live pins · sorted by critical lanes</span>
        <span className="font-mono">Gov-fixed sites</span>
      </div>
    </div>
  );
}
